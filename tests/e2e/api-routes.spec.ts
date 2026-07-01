import { test, expect } from '@playwright/test';

test.describe('API routes', () => {
  test('generate-quiz returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post('/api/generate-quiz');
    expect([401]).toContain(res.status());
  });

  test('generate-challenge POST returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post('/api/generate-challenge', {
      data: { history: [] },
    });
    expect([401]).toContain(res.status());
  });

  test('chat route returns 401 when unauthenticated', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { messages: [], coupleId: 'couple_123' },
    });
    expect([401]).toContain(res.status());
  });
});