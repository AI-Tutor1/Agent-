import { Request, Response, NextFunction } from 'express';

export function agentAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers['x-agent-token'];
  const expected = process.env.AGENT_INTERNAL_TOKEN;

  if (!expected || token !== expected) {
    res.status(401).json({ error: 'Unauthorized: invalid or missing X-Agent-Token' });
    return;
  }

  next();
}

export function webhookAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'];
  const expected = process.env.AGENT_COMMAND_WEBHOOK_SECRET;

  if (!expected || secret !== expected) {
    res.status(401).json({ error: 'Unauthorized: invalid or missing X-Webhook-Secret' });
    return;
  }

  next();
}
