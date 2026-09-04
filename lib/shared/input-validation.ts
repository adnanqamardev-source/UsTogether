import { NextRequest } from 'next/server';

export function validateChatBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { ok: false as const, error: 'Invalid JSON body.' };
  }

  const maybe = body as Record<string, unknown>;

  if (!Array.isArray(maybe.messages)) {
    return { ok: false as const, error: 'messages must be an array.' };
  }

  const messages = maybe.messages as unknown[];

  if (messages.length > 100) {
    return { ok: false as const, error: 'Too many messages. Limit is 100.' };
  }

  for (const m of messages) {
    if (!m || typeof m !== 'object') {
      return { ok: false as const, error: 'Each message must be an object.' };
    }
    const msg = m as Record<string, unknown>;
    if (typeof msg.role !== 'string' || typeof msg.text !== 'string') {
      return { ok: false as const, error: 'Each message must include string role and text.' };
    }
    if (msg.text.length > 2000) {
      return { ok: false as const, error: 'Each message text must be 2000 characters or fewer.' };
    }
  }

  if (maybe.coupleId !== undefined && typeof maybe.coupleId !== 'string') {
    return { ok: false as const, error: 'coupleId must be a string.' };
  }

  return { ok: true as const, messages, coupleId: typeof maybe.coupleId === 'string' ? maybe.coupleId : null };
}

export function validateHistoryBody(body: unknown) {
  if (!body || typeof body !== 'object' || !Array.isArray((body as Record<string, unknown>).history)) {
    return { ok: false as const, error: 'history must be an array.' };
  }
  const history = (body as Record<string, unknown>).history as unknown[];

  if (history.length > 100) {
    return { ok: false as const, error: 'history is too large. Limit is 100 entries.' };
  }

  return { ok: true as const, history };
}

export function validateQuizBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    return { ok: false as const, error: 'Invalid JSON body.' };
  }
  const maybe = body as Record<string, unknown>;
  const recentTopics = Array.isArray(maybe.recentTopics)
    ? (maybe.recentTopics as unknown[]).filter((t): t is string => typeof t === 'string').slice(0, 20)
    : [];
  const preferredCategory = typeof maybe.preferredCategory === 'string' ? maybe.preferredCategory : undefined;
  return { ok: true as const, recentTopics, preferredCategory };
}