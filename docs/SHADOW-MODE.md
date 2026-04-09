# SHADOW-MODE.md — 90-Day Confidence Loop & Validation System

## What Shadow Mode Is
Shadow mode is the first 90 days of any agent's deployment. The agent runs in PARALLEL
with the human employee. It processes every task, produces every output — but NOTHING
reaches the outside world. No parent gets an AI-generated message. No invoice is dispatched.
No proposal is sent. Everything is internal, reviewed, and compared against human output.

**Shadow mode is not bureaucracy. It is insurance.** Skip it and one bad parent-facing error
kills executive confidence in the entire programme.

---

## Environment Variable
```
SHADOW_MODE=true    # Agent runs, processes, logs — but sends NOTHING externally
SHADOW_MODE=false   # Agent is live — approved outputs reach parents/teachers/external
```

## What Changes When SHADOW_MODE=true
| Action | Shadow=true | Shadow=false |
|--------|------------|-------------|
| Pipeline processing | Runs fully | Runs fully |
| Database writes | Normal | Normal |
| Analysis generation | Normal | Normal |
| Dashboard display | Shows all data | Shows all data |
| Notifications (internal) | Written, marked shadow_mode=true | Written and sent |
| WhatsApp to parents | BLOCKED | Sent after human approval |
| Email to external | BLOCKED | Sent after human approval |
| Invoice dispatch | BLOCKED | Sent after human approval |
| Agent activity log | Includes shadow_mode flag | Normal |

---

## The 90-Day Timeline

### Days 1-30: Full Shadow Mode
- Agent processes every demo in parallel with Wajeeha (human)
- Agent produces output. Human does the actual work independently.
- Both outputs are compared field by field
- **No agent takes ANY live action**
- Output: Baseline accuracy measurement per action type
- Weekly accuracy report generated for Dawood

### Days 31-60: Selective Autonomy
- Actions where agent accuracy exceeded 90% in shadow → promoted to live with async review
- Actions below 90% remain in approval mode
- First real time savings begin
- Human reviews agent output async (within 24 hours) instead of before execution

### Days 61-90: Threshold Graduation
- Approval queue shrinks to genuinely difficult cases only
- Agents handle routine actions autonomously
- Human reviewer shifts from approver to exception handler
- Final calibration of confidence thresholds

### Post-90: Autonomy Map
- Documented map of every action type:
  - AUTONOMOUS: agent acts, logs, human reviews async
  - APPROVAL: agent proposes, human approves before execution
  - HUMAN-LED: agent provides analysis only, human executes
- Map reviewed monthly and updated as confidence scores evolve

---

## Confidence Score System

### How Confidence is Calculated
Every agent output has two scores:
1. **agent_confidence** (0.00 to 10.00): Self-assessed by the AI based on data completeness and reasoning certainty
2. **human_accuracy_score** (0.00 to 10.00): Assigned by the human reviewer during shadow mode

### Three Confidence Tiers

| Tier | Score Range | Agent Behaviour | Human Role |
|------|-----------|----------------|------------|
| HIGH | Above 90% (≥9.0/10) | Agent acts autonomously. Logs action. Notifies reviewer for async review within 24 hours. | Reviews log async. Flags exceptions. |
| MEDIUM | 70-90% (7.0-8.9/10) | Agent proposes action with full rationale. Waits for approval before executing. | Approves or modifies before execution. |
| LOW | Below 70% (<7.0/10) | Agent flags to human with full analysis. Does NOT act. Human executes manually. | Full manual execution. Agent provides analysis only. |

### Calibration Process
During the 90-day shadow mode, human reviewers rate every output:
- **Correct**: Agent output matches what human would have done → confidence calibration goes UP
- **Partially correct**: Right direction but missing detail → minor adjustment
- **Incorrect**: Wrong output → confidence calibration goes DOWN, reason logged to MEMORY.md

This feedback is NOT used to retrain the AI model. It is used to:
1. Improve prompts and rubrics (update AGENTS.md, pipeline prompts)
2. Adjust confidence thresholds for autonomous vs approval actions
3. Identify which action types should remain permanently human-led

---

## Comparison Engine (Shadow Mode Implementation)

### How Comparison Works
```
1. Demo completed
2. Agent runs pipeline → produces demo_analysis record
3. Human (Wajeeha) independently produces her own analysis
4. Comparison function runs:
   a. Match fields: methodology, topic_selection, resource_usage, interactivity
   b. Compare ratings: student_rating_converted vs human rating
   c. Compare POUR flags: did agent catch same flags as human?
   d. Compare accountability: same classification?
5. Generate accuracy report:
   - Field-by-field match percentage
   - Rating deviation (agent vs human)
   - POUR recall (did agent catch all flags?)
   - Accountability accuracy (correct classification?)
6. Store in comparison_results table
7. Weekly: aggregate into accuracy report for Dawood
```

### Database Table for Comparisons
```sql
CREATE TABLE IF NOT EXISTS comparison_results (
    id                  SERIAL PRIMARY KEY,
    demo_id             VARCHAR(100),
    analysis_id         UUID,
    field_name          VARCHAR(100),
    agent_value         TEXT,
    human_value         TEXT,
    match_score         DECIMAL(4,2),   -- 0.00 to 1.00
    reviewer            VARCHAR(100),
    review_date         TIMESTAMP DEFAULT NOW()
);
```

---

## Graduation Criteria
An action type graduates from shadow to selective autonomy when:
1. Accuracy above 90% for at least 30 consecutive instances
2. Zero guard rail violations in the past 2 weeks
3. Human edit rate below 15% for that action type
4. Dawood approves the graduation in writing

An action type remains PERMANENTLY human-led if:
- Requires cultural sensitivity or parent relationship judgment
- Requires real-time emotional intelligence
- Involves financial transactions above threshold
- Involves direct parent/teacher communication

---

## What Must NEVER Be Automated Regardless of Confidence Score
- Direct communication to parents (always human-approved)
- Direct communication to teachers about performance
- Financial refund decisions
- Student welfare concerns (always escalate to human immediately)
- New agent creation (always HR → CEO approval chain)
- Changes to pricing or rate cards
