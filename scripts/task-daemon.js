#!/usr/bin/env node
// task-daemon.js — Persistent polling daemon (runs 24/7 as a systemd service)
// This is pure code. Zero AI tokens for polling.
// AI is only invoked when the pipeline reaches Steps 4 or 10.
//
// Usage: DATABASE_URL=... node scripts/task-daemon.js
// Systemd: See /docs/DEPLOYMENT.md for service file configuration

const path = require('path');

require('ts-node').register({
  project: path.join(__dirname, '..', 'backend', 'tsconfig.json'),
  transpileOnly: true,
});

require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const { Pool } = require('pg');
const { runPipeline } = require('../backend/src/pipeline/run-pipeline');
const { PipelineError } = require('../backend/src/pipeline/types');

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || '60000', 10);
const STALE_NOTIFICATION_HOURS = 2;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

let isProcessing = false;
let pollCount = 0;

async function checkPendingDemos() {
  const result = await pool.query(
    `SELECT demo_id FROM conducted_demo_sessions
     WHERE analysis_status = 'pending'
     ORDER BY created_at ASC
     LIMIT 1`
  );

  if (result.rows.length > 0) {
    const demoId = result.rows[0].demo_id;
    console.log(`[daemon] Found pending demo: ${demoId} — starting pipeline`);
    try {
      const outcome = await runPipeline(demoId);
      console.log(`[daemon] Pipeline complete for ${demoId}: ${outcome.steps_completed}/11 steps, ${outcome.total_tokens} tokens, ${outcome.processing_time_ms}ms`);
    } catch (err) {
      if (err instanceof PipelineError && err.code === 'DEMO_NOT_FOUND') {
        console.error(`[daemon] Hard stop: demo ${demoId} not found — marking as escalated`);
        await pool.query(
          `UPDATE conducted_demo_sessions SET analysis_status = 'escalated' WHERE demo_id = $1`,
          [demoId]
        ).catch(() => {});
      } else {
        console.error(`[daemon] Pipeline error for ${demoId}:`, err instanceof Error ? err.message : String(err));
      }
    }
    return true; // Processed something
  }
  return false;
}

async function checkPendingTasks() {
  const result = await pool.query(
    `SELECT id, title, assignee_name FROM task_queue
     WHERE column_status = 'to_do' AND assignee_name = 'wajeeha'
     ORDER BY created_at ASC
     LIMIT 1`
  );

  if (result.rows.length > 0) {
    const task = result.rows[0];
    console.log(`[daemon] Found pending task: "${task.title}" (${task.id}) for ${task.assignee_name}`);
    // Mark as doing — actual execution happens via OpenClaw/pipeline
    await pool.query(
      `UPDATE task_queue SET column_status = 'doing', started_at = NOW() WHERE id = $1`,
      [task.id]
    ).catch(() => {});
  }
}

async function checkStaleNotifications() {
  const staleResult = await pool.query(
    `SELECT id, recipient, type, reference_id, created_at
     FROM notifications
     WHERE read = false
       AND shadow_mode = false
       AND created_at < NOW() - INTERVAL '${STALE_NOTIFICATION_HOURS} hours'`
  );

  if (staleResult.rows.length > 0) {
    console.warn(`[daemon] ${staleResult.rows.length} stale notification(s) older than ${STALE_NOTIFICATION_HOURS}h:`);
    for (const n of staleResult.rows) {
      console.warn(`  → [${n.type}] to ${n.recipient} ref=${n.reference_id} at ${n.created_at}`);
    }
  }
}

async function logHeartbeat(pollNum) {
  try {
    await pool.query(
      `INSERT INTO agent_activity_log (agent_name, action_type, status, details)
       VALUES ('task_daemon', 'heartbeat', 'success', $1)`,
      [JSON.stringify({ poll_count: pollNum, timestamp: new Date().toISOString() })]
    );
  } catch {
    // Heartbeat failure is non-critical
  }
}

async function poll() {
  if (isProcessing) {
    console.log(`[daemon] Poll ${pollCount}: still processing previous run, skipping`);
    return;
  }

  pollCount++;
  const ts = new Date().toISOString();
  console.log(`[daemon] Poll ${pollCount} at ${ts}`);

  isProcessing = true;
  try {
    // 1. Check for pending demos — run pipeline if found
    const processed = await checkPendingDemos();
    if (!processed) {
      console.log(`[daemon] Poll ${pollCount}: no pending demos`);
    }

    // 2. Check task queue
    await checkPendingTasks();

    // 3. Check stale notifications
    await checkStaleNotifications();

    // 4. Log heartbeat every 10 polls (~10 minutes)
    if (pollCount % 10 === 0) {
      await logHeartbeat(pollCount);
    }
  } catch (err) {
    console.error(`[daemon] Poll ${pollCount} error:`, err instanceof Error ? err.message : String(err));
  } finally {
    isProcessing = false;
  }
}

// Start daemon
console.log(`[daemon] Starting task daemon. Poll interval: ${POLL_INTERVAL}ms. Shadow mode: ${process.env.SHADOW_MODE}`);
console.log(`[daemon] Database: ${process.env.DATABASE_URL ? 'configured' : 'MISSING'}`);

// Run immediately, then on interval
poll();
setInterval(poll, POLL_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[daemon] SIGTERM received — shutting down gracefully');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[daemon] SIGINT received — shutting down');
  await pool.end();
  process.exit(0);
});
