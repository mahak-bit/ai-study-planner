import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Pencil, Plus } from 'lucide-react';

import { deleteExam } from '@/lib/actions/exam.actions';
import { deleteSubject, deleteTopic } from '@/lib/actions/subject.actions';
import { requireUser } from '@/lib/auth/session';
import { getSubjectDetail, NotFoundError } from '@/lib/services/subject.service';
import { DeleteConfirmButton } from '@/components/shared/delete-confirm-button';
import { ExamDialog } from '@/components/subjects/exam-dialog';
import { SubjectDialog } from '@/components/subjects/subject-dialog';
import { TopicDialog } from '@/components/subjects/topic-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Subject — AI Study Planner' };

const DIFFICULTY_VARIANT: Record<string, 'secondary' | 'default' | 'destructive'> = {
  EASY: 'secondary',
  MEDIUM: 'default',
  HARD: 'destructive',
};

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();

  let subject;
  try {
    subject = await getSubjectDetail(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <h1 className="text-2xl font-semibold tracking-tight">{subject.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <SubjectDialog
            subject={subject}
            trigger={
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5" /> Edit
              </Button>
            }
          />
          <DeleteConfirmButton
            title={`Delete ${subject.name}?`}
            description="This permanently deletes the subject, its topics, and any linked exams."
            onConfirm={deleteSubject.bind(null, subject.id)}
            redirectTo="/subjects"
            trigger={
              <Button variant="outline" size="sm">
                Delete
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Topics</CardTitle>
            <CardDescription>{subject.topics.length} total</CardDescription>
          </div>
          <TopicDialog
            subjectId={subject.id}
            trigger={
              <Button size="sm">
                <Plus className="size-3.5" /> Add topic
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {subject.topics.length === 0 ? (
            <p className="text-muted-foreground text-sm">No topics yet.</p>
          ) : (
            <ul className="divide-y">
              {subject.topics.map((topic) => (
                <li key={topic.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{topic.name}</span>
                    <Badge variant={DIFFICULTY_VARIANT[topic.difficulty]} className="text-xs">
                      {topic.difficulty.toLowerCase()}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      confidence {topic.confidenceLevel}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TopicDialog
                      subjectId={subject.id}
                      topic={topic}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Edit topic">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <DeleteConfirmButton
                      title={`Delete ${topic.name}?`}
                      description="This permanently deletes the topic and its history."
                      onConfirm={deleteTopic.bind(null, subject.id, topic.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Exams</CardTitle>
            <CardDescription>{subject.exams.length} scheduled</CardDescription>
          </div>
          <ExamDialog
            subjectId={subject.id}
            topics={subject.topics}
            trigger={
              <Button size="sm">
                <Plus className="size-3.5" /> Add exam
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {subject.exams.length === 0 ? (
            <p className="text-muted-foreground text-sm">No exams scheduled.</p>
          ) : (
            <ul className="divide-y">
              {subject.exams.map((exam) => (
                <li key={exam.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{exam.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(exam.examDate, 'PPP')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {exam.priority.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <ExamDialog
                      subjectId={subject.id}
                      topics={subject.topics}
                      exam={exam}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label="Edit exam">
                          <Pencil className="size-3.5" />
                        </Button>
                      }
                    />
                    <DeleteConfirmButton
                      title={`Delete ${exam.title}?`}
                      description="This permanently deletes the exam."
                      onConfirm={deleteExam.bind(null, subject.id, exam.id)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
