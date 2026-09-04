import { test, expect } from '@playwright/test';

test.describe('Feature: API Routes', () => {
  test.describe('Authentication Guard', () => {
    test('@smoke generate-quiz should return 401 when unauthenticated', async ({ request }) => {
      const res = await request.post('/api/generate-quiz');
      expect([401]).toContain(res.status());
    });

    test('generate-challenge should return 401 when unauthenticated', async ({ request }) => {
      const res = await request.post('/api/generate-challenge', {
        data: { history: [] },
      });
      expect([401]).toContain(res.status());
    });

    test('chat should return 401 when unauthenticated', async ({ request }) => {
      const res = await request.post('/api/chat', {
        data: { messages: [], coupleId: 'couple_123' },
      });
      expect([401]).toContain(res.status());
    });

    test('reset-data should return 401 when unauthenticated', async ({ request }) => {
      const res = await request.post('/api/reset-data');
      expect([401, 405]).toContain(res.status());
    });
  });

  test.describe('Request Validation', () => {
    test('generate-quiz should handle empty body', async ({ request }) => {
      const res = await request.post('/api/generate-quiz', {
        data: {},
      });
      // Should return 401 (auth) or 400 (validation), not 500
      expect([400, 401]).toContain(res.status());
    });

    test('generate-challenge should handle invalid data', async ({ request }) => {
      const res = await request.post('/api/generate-challenge', {
        data: { invalid: 'data' },
      });
      expect([400, 401]).toContain(res.status());
    });

    test('chat should handle empty messages array', async ({ request }) => {
      const res = await request.post('/api/chat', {
        data: { messages: [], coupleId: '' },
      });
      expect([400, 401]).toContain(res.status());
    });
  });

  test.describe('HTTP Methods', () => {
    test('generate-quiz should reject GET requests', async ({ request }) => {
      const res = await request.get('/api/generate-quiz');
      expect([405, 401]).toContain(res.status());
    });

    test('generate-challenge should reject GET requests', async ({ request }) => {
      const res = await request.get('/api/generate-challenge');
      expect([405, 401]).toContain(res.status());
    });

    test('chat should reject GET requests', async ({ request }) => {
      const res = await request.get('/api/chat');
      expect([405, 401]).toContain(res.status());
    });
  });

  test.describe('Response Format', () => {
    test('generate-quiz should return JSON response', async ({ request }) => {
      const res = await request.post('/api/generate-quiz');
      const contentType = res.headers()['content-type'] || '';
      expect(contentType).toContain('application/json');
    });

    test('generate-challenge should return JSON response', async ({ request }) => {
      const res = await request.post('/api/generate-challenge', {
        data: { history: [] },
      });
      const contentType = res.headers()['content-type'] || '';
      expect(contentType).toContain('application/json');
    });

    test('chat should return JSON response', async ({ request }) => {
      const res = await request.post('/api/chat', {
        data: { messages: [], coupleId: 'couple_123' },
      });
      const contentType = res.headers()['content-type'] || '';
      expect(contentType).toContain('application/json');
    });
  });
});
