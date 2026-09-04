import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
}));

// Mock @/lib/firestore-errors
vi.mock('@/lib/firestore-errors', () => ({
  handleFirestoreError: vi.fn(),
  OperationType: {
    GET: 'get',
  },
}));

// Mock @/lib/firebase
vi.mock('@/lib/firebase', () => ({
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

import { doc, onSnapshot } from 'firebase/firestore';
import { AuthProvider, useAuth } from '@/components/providers';
import { auth, createUserProfile } from '@/lib/firebase/client';

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
    const mockUser = {
      uid: 'user_123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });

    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);

    vi.mocked(onSnapshot).mockImplementation((_ref: any, callback: any) => {
      setTimeout(() => callback({
        exists: () => true,
        data: () => ({
          email: 'test@example.com',
          displayName: 'Test User',
          points: 100,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      } as any), 0);
      return () => {};
    });

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
    const mockUser = {
      uid: 'user_new',
      email: 'newuser@example.com',
      displayName: null,
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });

    vi.mocked(doc).mockReturnValue({ id: 'user_new' } as any);

    vi.mocked(onSnapshot).mockImplementation((_ref: any, callback: any) => {
      setTimeout(() => callback({
        exists: () => false,
      } as any), 0);
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(vi.mocked(createUserProfile)).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should handle user sign-out', async () => {
    const mockUser = {
      uid: 'user_123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      setTimeout(() => callback(null), 50);
      return () => {};
    });

    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);

    vi.mocked(onSnapshot).mockImplementation((_ref: any, callback: any) => {
      setTimeout(() => callback({
        exists: () => true,
        data: () => ({
          email: 'test@example.com',
          displayName: 'Test User',
          points: 100,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      } as any), 0);
      return () => {};
    });

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

  it('should handle Firestore snapshot errors gracefully', async () => {
    const mockUser = {
      uid: 'user_123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    vi.mocked(auth.onAuthStateChanged).mockImplementation((callback: any) => {
      setTimeout(() => callback(mockUser), 0);
      return () => {};
    });

    vi.mocked(doc).mockReturnValue({ id: 'user_123' } as any);

    vi.mocked(onSnapshot).mockImplementation((_ref: any, _callback: any, errorCallback: any) => {
      setTimeout(() => errorCallback(new Error('Firestore error')), 0);
      return () => {};
    });

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