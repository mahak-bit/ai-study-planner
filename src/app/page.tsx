import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="bg-background flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit gap-1.5">
            <GraduationCap className="size-3.5" />
            Phase 2 — Database + Auth
          </Badge>
          <CardTitle className="text-2xl">AI Study Planner</CardTitle>
          <CardDescription>
            Authentication and the database schema are wired up. The real marketing landing page
            arrives in Phase 10 — for now, sign up to try the auth flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            render={<Link href="/register">Sign up</Link>}
            nativeButton={false}
            className="flex-1"
          />
          <Button
            render={<Link href="/login">Sign in</Link>}
            nativeButton={false}
            variant="outline"
            className="flex-1"
          />
        </CardContent>
      </Card>
    </div>
  );
}
