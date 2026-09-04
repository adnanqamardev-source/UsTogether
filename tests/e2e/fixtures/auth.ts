import { test as base, Page, BrowserContext } from '@playwright/test';

/**
 * Mock Firebase auth state by injecting a fake user into the browser context.
 * This intercepts Firebase Auth's onAuthStateChanged to simulate a logged-in user.
 */
export async function mockFirebaseAuth(
  context: BrowserContext,
  user: {
    uid: string;
    email: string;
    displayName: string;
  } = {
    uid: 'test-user-uid-12345',
    email: 'test@example.com',
    displayName: 'Test User',
  }
) {
  await context.addInitScript((userData) => {
    // Mock Firebase Auth internal state
    (window as any).__FIREBASE_AUTH_MOCK__ = userData;

    // Override Firebase's auth state to return our mock user
    const originalFetch = window.fetch;
    window.fetch = async (...args: any[]) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      // Intercept Firebase identity toolkit calls
      if (url && url.includes('identitytoolkit')) {
        return new Response(JSON.stringify({
          kind: 'identitytoolkit#VerifyCustomTokenResponse',
          idToken: 'mock-id-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600',
          isNewUser: false,
          localId: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return originalFetch.apply(window, args as any);
    };
  }, user);
}

/**
 * Set up auth cookies to bypass the auth wrapper loading state.
 * Note: This doesn't fully authenticate - it just prevents the app from hanging
 * on the Firebase auth check. The app will still show the login screen unless
 * Firebase is fully mocked.
 */
export async function setAuthCookies(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'session',
      value: 'mock-token-for-testing',
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
  ]);
}

/**
 * Extended test fixture with auth helpers
 */
type TestFixtures = {
  authenticatedContext: BrowserContext;
};

export const test = base.extend<TestFixtures>({
  authenticatedContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    await setAuthCookies(context);
    await mockFirebaseAuth(context);
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';
