import { Suspense } from 'react';
import Link from 'next/link';

import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Sign in — AI Study Planner' };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to continue your study plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-foreground font-medium underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
