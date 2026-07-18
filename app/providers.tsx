"use client";

import { AuthProvider } from '@/components/providers';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}