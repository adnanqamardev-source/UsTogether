import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkRateLimit } from '@/lib/ratelimit';

// Mock redis module
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    setEx: vi.fn(),
  })),
}));

describe('checkRateLimit', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow first request under limit', async () => {
    const result = await checkRateLimit('test-key', 5, 60000);
    expect(result).toBe(true);
  });

  it('should allow requests under the limit', async () => {
    const result1 = await checkRateLimit('test-key-2', 3, 60000);
    const result2 = await checkRateLimit('test-key-2', 3, 60000);
    const result3 = await checkRateLimit('test-key-2', 3, 60000);
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });

  it('should deny requests over the limit within the window', async () => {
    const result1 = await checkRateLimit('test-key-3', 2, 60000);
    const result2 = await checkRateLimit('test-key-3', 2, 60000);
    const result3 = await checkRateLimit('test-key-3', 2, 60000);
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(false);
  });

  it('should reset after the window expires', async () => {
    const result1 = await checkRateLimit('test-key-4', 1, 60000);
    const result2 = await checkRateLimit('test-key-4', 1, 60000);
    
    expect(result1).toBe(true);
    expect(result2).toBe(false);

    await vi.advanceTimersByTimeAsync(61000);

    const result3 = await checkRateLimit('test-key-4', 1, 60000);
    expect(result3).toBe(true);
  });

  it('should use default values when not provided', async () => {
    const result = await checkRateLimit('test-key-default');
    expect(result).toBe(true);
  });

  it('should track separate limits for different keys', async () => {
    const result1 = await checkRateLimit('key-a', 1, 60000);
    const result2 = await checkRateLimit('key-b', 1, 60000);
    const result3 = await checkRateLimit('key-a', 1, 60000);
    const result4 = await checkRateLimit('key-b', 1, 60000);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(false);
    expect(result4).toBe(false);
  });
});