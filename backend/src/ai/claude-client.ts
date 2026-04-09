// claude-client.ts — Anthropic Claude API client (Steps 4 and 10 only)
// Golden rule: AI only for what REQUIRES intelligence. Never for transforms or queries.

import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const client = new Anthropic({ apiKey });

export interface ClaudeResponse {
  data: Record<string, unknown>;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callClaude(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1500
): Promise<ClaudeResponse> {
  const attempt = async (): Promise<ClaudeResponse> => {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      // Thinking mode explicitly disabled — per ORCHESTRATION.md section 7 token optimization
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude returned no text content');
    }

    // Extract JSON from response — strip markdown fences if present
    const raw = textBlock.text.trim();
    const jsonStr = raw.startsWith('```')
      ? raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      : raw;

    const data = JSON.parse(jsonStr) as Record<string, unknown>;

    return {
      data,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      totalTokens: message.usage.input_tokens + message.usage.output_tokens,
    };
  };

  try {
    return await attempt();
  } catch (firstErr) {
    console.warn('[claude-client] First attempt failed, retrying after 2s...');
    await sleep(2000);
    try {
      return await attempt();
    } catch (secondErr) {
      const msg = secondErr instanceof Error ? secondErr.message : String(secondErr);
      throw new Error(`Claude API failed after 2 attempts: ${msg}`);
    }
  }
}
