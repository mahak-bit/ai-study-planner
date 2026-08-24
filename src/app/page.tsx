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
            Phase 1 — Scaffold
          </Badge>
          <CardTitle className="text-2xl">AI Study Planner</CardTitle>
          <CardDescription>
            Project scaffold is in place: Next.js, Tailwind, shadcn/ui, and the tooling pipeline are
            wired up and verified. The real landing page and app UI arrive in later phases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            Continue to onboarding
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
