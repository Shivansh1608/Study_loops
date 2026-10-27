import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchQuizzes,
  fetchQuiz,
  createQuiz,
  deleteQuiz,
  submitQuizAttempt,
  fetchAttempt,
  retryWrongQuiz,
  fetchQuizAttempts,
  type Quiz,
  type QuizListItem,
  type Attempt,
} from './client';

export function useQuizzes() {
  return useQuery<QuizListItem[]>({
    queryKey: ['quizzes'],
    queryFn: fetchQuizzes,
  });
}

export function useQuiz(quizId: number | null) {
  return useQuery<Quiz>({
    queryKey: ['quiz', quizId],
    queryFn: () => fetchQuiz(quizId!),
    enabled: quizId !== null && !isNaN(quizId),
  });
}

export function useQuizAttempts(quizId: number | null) {
  return useQuery<Attempt[]>({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => fetchQuizAttempts(quizId!),
    enabled: quizId !== null && !isNaN(quizId),
  });
}

export function useAttempt(attemptId: number | null) {
  return useQuery<Attempt>({
    queryKey: ['attempt', attemptId],
    queryFn: () => fetchAttempt(attemptId!),
    enabled: attemptId !== null && !isNaN(attemptId),
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      documentId: number;
      numQuestions: number;
      difficulty: string;
      questionType: string;
      topicFocus?: string | null;
      timeLimitSec?: number | null;
    }) =>
      createQuiz(
        variables.documentId,
        variables.numQuestions,
        variables.difficulty,
        variables.questionType,
        variables.topicFocus,
        variables.timeLimitSec
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: number) => deleteQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useRetryWrongQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: number) => retryWrongQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}

export function useSubmitAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      quizId: number;
      answers: {
        question_id: number;
        chosen_index?: number | null;
        answer_text?: string | null;
        time_spent_sec?: number;
      }[];
      durationSec: number;
    }) => submitQuizAttempt(variables.quizId, variables.answers, variables.durationSec),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-attempts', variables.quizId] });
      queryClient.invalidateQueries({ queryKey: ['progress-overview'] });
    },
  });
}
