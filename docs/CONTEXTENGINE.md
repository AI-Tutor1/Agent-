# CONTEXTENGINE.md — ContextEngine Plugin Configuration for Tuitional

## What This Is
OpenClaw v2026.3.7 introduced the ContextEngine Plugin Interface — six lifecycle hooks
that control how memory is read, compressed, and recalled. Without this, OpenClaw's
default compaction will silently drop critical instructions. With this, you control everything.

**This is Memory 201. The files (SOUL.md, MEMORY.md, etc.) are Memory 101.**

---

## Why Tuitional Needs This

| Problem | Without ContextEngine | With ContextEngine |
|---------|----------------------|-------------------|
| SOUL.md gets compacted | Agent forgets prime directive after 2 hours | compact hook: "never drop CRITICAL tags" |
| Sub-agents see too much | Invoice sub-agent sees teacher matching data | prepareSubagentSpawn: isolated memory per sub-agent |
| No RAG on teacher data | Agent can't search 500+ teacher profiles | assemble hook: RAG query before every LLM call |
| No learning after turns | Outcomes lost between sessions | afterTurn: log to SQL, update confidence scores |
| Raw parent messages reach agent | Prompt injection risk via WhatsApp | ingest hook: sanitize all inbound messages |

---

## The 6 Lifecycle Hooks — Tuitional Configuration

### Hook 1: bootstrap
**When**: Agent starts (gateway restart or fresh session)
**Tuitional use**: Load department knowledge base from central locker. Connect RAG index for teacher profiles.

```javascript
// plugins/tuitional-context.js
export function bootstrap(context) {
  // Load department knowledge base
  const deptKB = loadKnowledgeBase('product-counseling');
  context.addToIndex(deptKB);

  // Load teacher profiles for RAG
  const teachers = await db.query('SELECT * FROM teacher_profiles WHERE status = $1', ['active']);
  context.addToIndex(teachers, { tag: 'teacher-profiles', priority: 'high' });

  // Load curriculum code database
  const curricula = await db.query('SELECT * FROM curriculum_codes');
  context.addToIndex(curricula, { tag: 'curriculum', priority: 'high' });

  // Mark SOUL.md as CRITICAL (never compact)
  context.tag('SOUL.md', 'CRITICAL');
  context.tag('USER.md', 'CRITICAL');
}
```

### Hook 2: ingest
**When**: New context enters (user message, tool output, sub-agent response)
**Tuitional use**: Filter, tag, and sanitize incoming data. Strip PII from logs. Prevent prompt injection.

```javascript
export function ingest(content, metadata) {
  // Sanitize inbound parent/teacher messages (prevent prompt injection)
  if (metadata.source === 'whatsapp' || metadata.source === 'parent_message') {
    content = sanitizeForPromptInjection(content);
    content = stripPII(content, { keep: ['student_name', 'subject'] });
  }

  // Tag by priority
  if (metadata.type === 'demo_data') {
    return { content, tags: ['demo', 'CRITICAL'], priority: 9 };
  }
  if (metadata.type === 'feedback') {
    return { content, tags: ['feedback'], priority: 7 };
  }
  if (metadata.type === 'heartbeat') {
    return { content, tags: ['heartbeat', 'ephemeral'], priority: 1 };
  }

  return { content, tags: ['general'], priority: 5 };
}
```

### Hook 3: assemble
**When**: Before every LLM call
**Tuitional use**: Custom RAG — search knowledge base, inject relevant teacher profiles and curriculum data into context.

```javascript
export function assemble(query, context) {
  // Always include SOUL.md and today's memory (tagged CRITICAL — never removed)
  const critical = context.getTagged('CRITICAL');

  // RAG: search teacher profiles for relevant matches
  if (query.includes('teacher') || query.includes('demo') || query.includes('match')) {
    const relevantTeachers = context.search('teacher-profiles', query, { topK: 5 });
    context.inject(relevantTeachers);
  }

  // RAG: search curriculum codes if curriculum mentioned
  if (query.includes('curriculum') || query.includes('syllabus') || query.includes('exam board')) {
    const relevantCurricula = context.search('curriculum', query, { topK: 3 });
    context.inject(relevantCurricula);
  }

  // Keep total context under 50K tokens
  context.setMaxTokens(50000);

  return context;
}
```

### Hook 4: compact
**When**: During context compression (when context exceeds threshold)
**Tuitional use**: Protect critical instructions. Never drop SOUL.md, teacher allocation rubrics, parent persona notes.

```javascript
export function compact(entries, options) {
  return entries.filter(entry => {
    // NEVER drop these — they are the agent's core instructions
    if (entry.tags.includes('CRITICAL')) return true;
    if (entry.tags.includes('demo') && entry.age < '2h') return true;
    if (entry.tags.includes('active-pipeline')) return true;

    // Always drop these — they are noise
    if (entry.tags.includes('ephemeral')) return false;
    if (entry.tags.includes('heartbeat') && entry.age > '30m') return false;

    // For everything else, keep if recent (under 1 hour)
    return entry.age < '1h';
  });
}
```

**This is the most important hook.** Without it, OpenClaw's default algorithm decides what to keep and what to drop. It WILL drop your SOUL.md execution rules after 2-3 hours. The compact hook prevents this permanently.

### Hook 5: afterTurn
**When**: After every agent response
**Tuitional use**: Log action to SQL, update confidence score, trigger review notification if approval is required.

```javascript
export async function afterTurn(response, context) {
  // Log every action to agent_activity_log
  await db.query(`
    INSERT INTO agent_activity_log (agent_name, action_type, details, tokens_used, status, shadow_mode)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    context.agentName,
    response.actionType || 'general',
    JSON.stringify({ summary: response.summary }),
    response.tokensUsed,
    'success',
    process.env.SHADOW_MODE === 'true'
  ]);

  // If analysis was completed, create review notification
  if (response.actionType === 'analysis_complete') {
    await db.query(`
      INSERT INTO notifications (recipient, type, title, reference_id)
      VALUES ('dawood_agent', 'demo_ready_for_review', $1, $2)
    `, [response.summary, response.analysisId]);
  }

  // Update daily memory log
  const today = new Date().toISOString().split('T')[0];
  await context.appendToFile(`memory/${today}.md`, `\n- ${response.summary}`);
}
```

### Hook 6: prepareSubagentSpawn
**When**: When spawning a sub-agent (Demo Parser, Shortlist Retriever, etc.)
**Tuitional use**: Give each sub-agent ONLY the context it needs. Invoice sub-agent doesn't see teacher matching data.

```javascript
export function prepareSubagentSpawn(subagentId, parentContext) {
  const subContext = {};

  switch (subagentId) {
    case 'demo-parser':
      // Only needs: demo record, session notes, student info
      subContext.include = ['demo_data', 'student_info'];
      subContext.exclude = ['teacher_profiles', 'financial', 'parent_contact'];
      subContext.maxTokens = 8000;
      break;

    case 'shortlist-retriever':
      // Needs: parsed demo summary, teacher profiles, curriculum codes
      subContext.include = ['parsed_demo', 'teacher_profiles', 'curriculum'];
      subContext.exclude = ['financial', 'parent_contact', 'sales_data'];
      subContext.maxTokens = 12000;
      break;

    case 'proposal-generator':
      // Needs: teacher shortlist, student brief, parent persona
      subContext.include = ['teacher_shortlist', 'student_brief', 'parent_persona'];
      subContext.exclude = ['raw_demo_notes', 'financial', 'other_students'];
      subContext.maxTokens = 10000;
      break;

    case 'conversion-tracker':
      // Needs: proposal ID, outcome, minimal context
      subContext.include = ['proposal_id', 'conversion_status'];
      subContext.exclude = ['teacher_profiles', 'qualitative_analysis'];
      subContext.maxTokens = 4000;
      break;

    default:
      subContext.maxTokens = 8000;
  }

  return subContext;
}
```

---

## Installation

```bash
# File location: ~/.openclaw/plugins/tuitional-context.js
# Or: /home/tuitional/.openclaw/plugins/tuitional-context.js

# OpenClaw auto-detects plugins in this directory on startup
# Verify: openclaw plugins list
```

---

## OpenClaw Config (openclaw.json)

```json
{
  "compaction": {
    "reserveTokensFloor": 20000,
    "memoryFlush": {
      "enabled": true,
      "softThresholdTokens": 4000
    }
  },
  "memorySearch": {
    "experimental": {
      "sessionMemory": true,
      "sources": ["memory", "sessions"]
    }
  },
  "contextEngine": {
    "plugins": ["tuitional-context"],
    "maxContextTokens": 50000
  }
}
```

---

## Memory Backup Protocol

| Frequency | Action | Method |
|-----------|--------|--------|
| Every 6 hours | Automated backup of all .openclaw folders | Cron job → Supermemory.ai or local backup |
| Weekly | Manual audit of all MEMORY.md files | Consolidate duplicates, delete one-time scripts |
| Weekly | Agent repeats memory back | Verify integrity — what it remembers vs what's stored |
| Monthly | Full memory audit | What's working, what's missing, update tools and API keys |
| After SOUL.md change | Mandatory session restart | Mid-session edits may be compacted away |
| After config change | Fresh session per task | Never run 5+ hour marathon sessions |

---

## Anti-Compaction Tagging Rules

| Content | Tag | Compact Behavior |
|---------|-----|-----------------|
| SOUL.md | CRITICAL | NEVER drop |
| USER.md | CRITICAL | NEVER drop |
| Active pipeline data | active-pipeline | Keep until pipeline completes |
| Demo being processed | demo | Keep for 2 hours |
| Heartbeat responses | ephemeral | Drop after 30 minutes |
| Old conversation turns | general | Drop after 1 hour |
| Teacher profiles (RAG) | teacher-profiles | Loaded on-demand, not persistent |
