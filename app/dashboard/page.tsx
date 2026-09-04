"use client";

import AuthWrapper from '@/components/AuthWrapper';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return (
    <AuthWrapper>
      <Dashboard />
    </AuthWrapper>
  );
}