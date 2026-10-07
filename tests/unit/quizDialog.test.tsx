import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const createQuizAttempt = vi.fn();
vi.mock('@/lib/actions/quiz.actions', () => ({ createQuizAttempt }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const { QuizDialog } = await import('@/components/subjects/quiz-dialog');

const topics = [
  { id: 'topic-1', name: 'Integration' },
  { id: 'topic-2', name: 'Linear Algebra' },
];

function openDialog() {
  render(
    <QuizDialog topics={topics} defaultTopicId="topic-2" trigger={<button>Log score</button>} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Log score' }));
}

describe('QuizDialog', () => {
  beforeEach(() => {
    createQuizAttempt.mockReset();
    createQuizAttempt.mockResolvedValue({ success: true });
  });

  it('submits the entered score against the preselected topic', async () => {
    openDialog();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Practice set' } });
    fireEvent.change(screen.getByLabelText('Correct'), { target: { value: '7' } });
    fireEvent.change(screen.getByLabelText('Out of'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log score' }));

    await waitFor(() =>
      expect(createQuizAttempt).toHaveBeenCalledWith({
        topicId: 'topic-2',
        title: 'Practice set',
        score: 7,
        totalQuestions: 10,
        timeTakenMinutes: undefined,
      })
    );
  });

  it('blocks a score above the question count without calling the server', async () => {
    openDialog();
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Practice set' } });
    fireEvent.change(screen.getByLabelText('Correct'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Out of'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Log score' }));

    expect(
      await screen.findByText('Score cannot be higher than the number of questions')
    ).toBeInTheDocument();
    expect(createQuizAttempt).not.toHaveBeenCalled();
  });
});
