import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Mock firebase/firestore. The current AuthProvider uses getDoc (wrapped in
// retryGetDoc with exponential backoff), not onSnapshot.
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  getDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}));

// Mock @/lib/firestore-helpers (AuthProvider imports createUserProfile from here).
vi.mock('@/lib/firestore-helpers', () => ({
  createUserProfile: vi.fn(),
}));

// Mock @/lib/firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  createUserProfile: vi.fn(),
}));

// Mock the underlying client module so the real Firebase client.ts is never
// evaluated in the jsdom test environment (which would trigger getAuth/getStorage
// and fail because the firebase/auth mock does not export getAuth).
vi.mock('@/lib/firebase/client', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
  },
  db: {},
  createUserProfile: vi.fn(),
}));

// Mock firebase/auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

import { getDoc, doc } from 'firebase/firestore';
import { AuthProvider, useAuth } from '@/components/providers';
import { auth } from '@/lib/firebase/client';
import { createUserProfile } from '@/lib/firestore-helpers';

const mockGetDoc = vi.mocked(getDoc);

function makeUser(overrides: any = {}) {
  return {
    uid: 'user_123',
    email: 'test@example.com',
    displayName: 'Test User',
    // Current AuthProvider awaits u.getIdToken() before reading Firestore.
    getIdToken: vi.fn().mockResolvedValue('fake-token'),
    ...overrides,
  };
}

function makeSnapshot(data: any | null) {
  return {
    exists: () => data != null,
    data: () => data,
  } as any;
}

// retryGetDoc calls getDoc up to 3 times; a happy path returns immediately,
// so a single resolved value is sufficient.
function mockGetDocResolved(snapshot: any) {
  mockGetDoc.mockResolvedValue(snapshot);
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with loading state', () => {
    vi.mocked(auth.onAuthStateChanged).mockReturnValue(() => {});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.dbUser).toBeNull();
  });

  it('should handle user sign-in with existing Firestore document', async () => {
    const mockUser = makeUser();
    const profileData = {
      email: 'test@example.com',
      displayName: 'Test User',
      points: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });
    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);
    mockGetDocResolved(makeSnapshot(profileData));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.dbUser).toBeDefined();
    expect(result.current.dbUser?.email).toBe('test@example.com');
    expect(result.current.dbUser?.displayName).toBe('Test User');
    expect(result.current.loading).toBe(false);
  });

  it('should create new user document with displayName fallback when user does not exist', async () => {
    const mockUser = makeUser({ uid: 'user_new', displayName: null });
    // First read (does not exist) -> createUserProfile -> second read (exists).
    mockGetDoc
      .mockResolvedValueOnce(makeSnapshot(null))
      .mockResolvedValueOnce(makeSnapshot({
        email: 'test@example.com',
        displayName: 'test',
        points: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });
    vi.mocked(doc).mockReturnValue({ id: 'user_new' } as any);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(vi.mocked(createUserProfile)).toHaveBeenCalledWith(
      'user_new',
      expect.objectContaining({
        email: 'test@example.com',
        // displayName falls back to the email prefix when the user has no name.
        displayName: 'test',
      })
    );
    expect(result.current.dbUser?.email).toBe('test@example.com');
    expect(result.current.loading).toBe(false);
  });

  it('should handle user sign-out', async () => {
    const mockUser = makeUser();
    const profileData = {
      email: 'test@example.com',
      displayName: 'Test User',
      points: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      setTimeout(() => callback(null), 50);
      return () => {};
    });
    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);
    mockGetDocResolved(makeSnapshot(profileData));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.dbUser).not.toBeNull();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 60));
    });

    expect(result.current.user).toBeNull();
    expect(result.current.dbUser).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should handle Firestore read errors gracefully', async () => {
    const mockUser = makeUser();

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });
    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);
    mockGetDoc.mockRejectedValue(new Error('Firestore error'));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should provide signIn and logOut functions', () => {
    vi.mocked(auth.onAuthStateChanged).mockReturnValue(() => {});

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(typeof result.current.signIn).toBe('function');
    expect(typeof result.current.logOut).toBe('function');
  });
});
