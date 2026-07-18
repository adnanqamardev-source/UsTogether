import { NextRequest } from 'next/server';
import { verifyIdToken } from './admin';

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
    const decoded = await verifyIdToken(token);
    return decoded?.uid ?? null;
  } catch {
    return null;
  }
}
