"use client";

import AuthWrapper from '@/components/auth/AuthWrapper';
import Dashboard from '@/components/features/couple/Dashboard';

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
}