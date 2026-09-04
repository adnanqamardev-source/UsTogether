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
  for (const m of messages) {
    if (!m || typeof m !== 'object') {
      return { ok: false as const, error: 'Each message must be an object.' };
    }
    const msg = m as Record<string, unknown>;
    if (typeof msg.role !== 'string' || typeof msg.text !== 'string') {
      return { ok: false as const, error: 'Each message must include string role and text.' };
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