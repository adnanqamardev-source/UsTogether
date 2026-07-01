import { NextRequest } from 'next/server';

export async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      // Next.js server-side fetch should not cache auth lookups
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const users = data?.users;
    if (!users || users.length === 0) {
      return null;
    }

    const uid = users[0]?.localId;
    return uid ?? null;
  } catch {
    return null;
  }
}
