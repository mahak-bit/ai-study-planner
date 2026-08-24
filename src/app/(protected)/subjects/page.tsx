import Link from 'next/link';
import { Plus } from 'lucide-react';

import { requireUser } from '@/lib/auth/session';
import { listSubjectsWithProgress } from '@/lib/services/subject.service';
import { SubjectDialog } from '@/components/subjects/subject-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const metadata = { title: 'Subjects — AI Study Planner' };

export default async function SubjectsPage() {
  const user = await requireUser();
  const subjects = await listSubjectsWithProgress(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground text-sm">
            Manage what you&apos;re studying and how confident you feel about each topic.
          </p>
        </div>
        <SubjectDialog
          trigger={
            <Button>
              <Plus className="size-4" /> Add subject
            </Button>
          }
        />
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No subjects yet</CardTitle>
            <CardDescription>
              Add your first subject to start building a study plan.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/subjects/${subject.id}`}>
              <Card className="hover:bg-muted/50 h-full transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {subject.topicCount} topic{subject.topicCount === 1 ? '' : 's'}
                    {subject.nextExam && (
                      <>
                        {' · '}
                        <Badge variant="secondary" className="ml-1">
                          Exam soon
                        </Badge>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-muted-foreground flex items-center justify-between text-xs">
                    <span>Mastered</span>
                    <span>
                      {subject.masteredCount}/{subject.topicCount}
                    </span>
                  </div>
                  <Progress
                    value={
                      subject.topicCount ? (subject.masteredCount / subject.topicCount) * 100 : 0
                    }
                  />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
