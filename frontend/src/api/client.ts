import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('notes_quiz_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to clear invalid token on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('notes_quiz_token');
    }
    return Promise.reject(error);
  }
);

// API Types
export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  ai_provider: string;
}

export interface User {
  id: number;
  email: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Chunk {
  id: number;
  index: number;
  text: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  page_count: number;
  file_type: string;
  created_at: string;
  chunk_count: number;
}

export interface DocumentDetail extends DocumentItem {
  text: string;
  chunks: Chunk[];
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index?: number;
  correct_answer?: string;
  explanation?: string;
  difficulty: string;
  topic: string;
  type?: string;
}

export interface Quiz {
  id: number;
  document_id: number;
  title?: string;
  difficulty: string;
  question_type: string;
  time_limit_sec: number | null;
  num_questions: number;
  created_at: string;
  questions: Question[];
}

export interface QuizListItem {
  id: number;
  document_id: number;
  title?: string;
  difficulty: string;
  question_type: string;
  time_limit_sec: number | null;
  num_questions: number;
  created_at: string;
  attempts_count: number;
  best_score: number | null;
  best_score_pct: number | null;
}

export interface AttemptAnswer {
  question_id: number;
  chosen_index?: number | null;
  answer_text?: string | null;
  is_correct: boolean;
  time_spent_sec?: number;
  question: Question;
}

export interface Attempt {
  id: number;
  quiz_id: number;
  score: number;
  total: number;
  duration_sec: number;
  created_at: string;
  answers: AttemptAnswer[];
}

export interface Flashcard {
  id: number;
  document_id: number;
  front: string;
  back: string;
  topic: string;
  ease: number;
  interval: number;
  repetitions: number;
  due_date: string;
  last_reviewed?: string;
}

export interface Summary {
  id: number;
  document_id: number;
  content_markdown: string;
  created_at: string;
}

export interface ProgressOverview {
  total_quizzes_taken: number;
  average_score_pct: number;
  total_flashcards: number;
  cards_due_today: number;
  cards_mastered: number;
  current_streak_days: number;
}

export interface ScoreOverTime {
  date: string;
  score_pct: number;
  quiz_id: number;
  total: number;
}

export interface TopicScore {
  topic: string;
  total_questions: number;
  correct_count: number;
  accuracy_pct: number;
}

export interface WeakTopic {
  topic: string;
  accuracy_pct: number;
  missed_count: number;
}

// API methods
export const fetchHealth = async (): Promise<HealthResponse> => {
  const res = await apiClient.get<HealthResponse>('/health');
  return res.data;
};

// Auth
export const registerUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/register', { email, password });
  return res.data;
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
};

export const fetchMe = async (): Promise<User> => {
  const res = await apiClient.get<User>('/auth/me');
  return res.data;
};

// Documents
export const fetchDocuments = async (): Promise<DocumentItem[]> => {
  const res = await apiClient.get<DocumentItem[]>('/documents');
  return res.data;
};

export const fetchDocument = async (id: number): Promise<DocumentDetail> => {
  const res = await apiClient.get<DocumentDetail>(`/documents/${id}`);
  return res.data;
};

export const uploadDocument = async (file: File, title?: string): Promise<DocumentDetail> => {
  const formData = new FormData();
  formData.append('file', file);
  if (title) formData.append('title', title);
  const res = await apiClient.post<DocumentDetail>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`/documents/${id}`);
};

// Quizzes
export const createQuiz = async (
  documentId: number,
  numQuestions: number,
  difficulty: string,
  questionType: string = 'mcq',
  topicFocus: string | null = null,
  timeLimitSec: number | null = null
): Promise<Quiz> => {
  const res = await apiClient.post<Quiz>(`/documents/${documentId}/quizzes`, {
    num_questions: numQuestions,
    difficulty,
    question_type: questionType,
    topic_focus: topicFocus || undefined,
    time_limit_sec: timeLimitSec || undefined,
  });
  return res.data;
};

export const fetchQuizzes = async (): Promise<QuizListItem[]> => {
  const res = await apiClient.get<QuizListItem[]>('/quizzes');
  return res.data;
};

export const fetchQuiz = async (quizId: number): Promise<Quiz> => {
  const res = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
  return res.data;
};

export const deleteQuiz = async (quizId: number): Promise<void> => {
  await apiClient.delete(`/quizzes/${quizId}`);
};

export const retryWrongQuiz = async (quizId: number): Promise<Quiz> => {
  const res = await apiClient.post<Quiz>(`/quizzes/${quizId}/retry-wrong`);
  return res.data;
};

export const fetchQuizAttempts = async (quizId: number): Promise<Attempt[]> => {
  const res = await apiClient.get<Attempt[]>(`/quizzes/${quizId}/attempts`);
  return res.data;
};

export const submitQuizAttempt = async (
  quizId: number,
  answers: {
    question_id: number;
    chosen_index?: number | null;
    answer_text?: string | null;
    time_spent_sec?: number;
  }[],
  durationSec: number
): Promise<Attempt> => {
  const res = await apiClient.post<Attempt>(`/quizzes/${quizId}/attempts`, {
    duration_sec: durationSec,
    answers,
  });
  return res.data;
};

export const fetchAttempt = async (attemptId: number): Promise<Attempt> => {
  const res = await apiClient.get<Attempt>(`/attempts/${attemptId}`);
  return res.data;
};

// Flashcards
export const createFlashcards = async (documentId: number, count: number): Promise<Flashcard[]> => {
  const res = await apiClient.post<Flashcard[]>(`/documents/${documentId}/flashcards`, { count });
  return res.data;
};

export const fetchDueFlashcards = async (): Promise<Flashcard[]> => {
  const res = await apiClient.get<Flashcard[]>('/flashcards/due');
  return res.data;
};

export const fetchAllFlashcards = async (documentId?: number): Promise<Flashcard[]> => {
  const url = documentId ? `/flashcards?document_id=${documentId}` : '/flashcards';
  const res = await apiClient.get<Flashcard[]>(url);
  return res.data;
};

export const reviewFlashcard = async (flashcardId: number, quality: number): Promise<Flashcard> => {
  const res = await apiClient.post<Flashcard>(`/flashcards/${flashcardId}/review`, { quality });
  return res.data;
};

// Summaries
export const fetchSummary = async (documentId: number): Promise<Summary> => {
  const res = await apiClient.get<Summary>(`/documents/${documentId}/summary`);
  return res.data;
};

export const generateSummary = async (documentId: number): Promise<Summary> => {
  const res = await apiClient.post<Summary>(`/documents/${documentId}/summary`);
  return res.data;
};

// Progress
export const fetchProgressOverview = async (): Promise<ProgressOverview> => {
  const res = await apiClient.get<ProgressOverview>('/progress/overview');
  return res.data;
};

export const fetchScoresOverTime = async (): Promise<ScoreOverTime[]> => {
  const res = await apiClient.get<ScoreOverTime[]>('/progress/scores-over-time');
  return res.data;
};

export const fetchTopicScores = async (): Promise<TopicScore[]> => {
  const res = await apiClient.get<TopicScore[]>('/progress/topics');
  return res.data;
};

export const fetchStreak = async (): Promise<{ streak_days: number }> => {
  const res = await apiClient.get<{ streak_days: number }>('/progress/streak');
  return res.data;
};

export const fetchWeakTopics = async (): Promise<WeakTopic[]> => {
  const res = await apiClient.get<WeakTopic[]>('/progress/weak-topics');
  return res.data;
};
