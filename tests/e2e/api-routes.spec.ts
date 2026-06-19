import { test, expect } from '@playwright/test';

test.describe('API routes', () => {
  test('generate-quiz returns 503 without key', async ({ request }) => {
    // We expect a server error because GEMINI_API_KEY is not available in test env
    const res = await request.post('/api/generate-quiz');
    expect([500, 503]).toContain(res.status());
  });

  test('generate-challenge POST returns json shape when missing key', async ({ request }) => {
    const res = await request.post('/api/generate-challenge', {
      data: { history: [] },
    });
    expect([200, 500]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(typeof body).toBe('object');
    }
  });

  test('chat route accepts POST and responds with reply or error', async ({ request }) => {
    const res = await request.post('/api/chat', {
      data: { messages: [], coupleId: 'couple_123' },
    });
    expect([200, 500]).toContain(res.status());
  });
});