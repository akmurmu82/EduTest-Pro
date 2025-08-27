// Core Types for Educational Testing Platform

export interface User {
  id?: string;
  _id: string;
  name: string;
  email: string;
  class: string;
  subjects: string[];
  role: 'student' | 'admin';
  createdAt: string;
}

// list of students
export type StudentsResponse = { students: User[] };

// single user
export type SingleUserResponse = User;

// analytics response: define what backend returns
export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  testsCreated: number;
  attemptsMade: number;
  // add fields returned by your backend
}

export interface Question {
  id?: string;
  _id: string;
  subject: string;
  class: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'objective' | 'subjective';
  question: string;
  options?: string[]; // For objective questions
  correctAnswer: string;
  explanation?: string;
  points: number;
  createdBy: 'ai' | 'manual';
  createdAt: string;
}

export type QuestionsResponse = {
  questions: Question[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
};

// single Question response (create/update)
export type SingleQuestionResponse = Question;

// generateQuestions returns array only
export type GeneratedQuestionsResponse = {
  message: string;
  questions: Question[];
};


export interface Test {
  id?: string;
  _id?: string;
  title: string;
  subject: string;
  class: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  questions: Question[] | string[];
  timeLimit: number; // in minutes
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
}

export type TestsResponse = { tests: Test[] };
export type SingleTestResponse = Test;

export interface TestAttempt {
  id: string;
  userId: string;
  testId: string;
  answers: Record<string, string>;
  score: number;
  totalPoints: number;
  percentage: number;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  timeSpent: number;
  tabSwitchCount: number;
  completedAt: string;
  isCompleted: boolean;
}

// Response types
export type SingleAttemptResponse = TestAttempt;
export type AttemptsResponse = TestAttempt[];

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export type AuthResponse = { user: User; token: string };


export interface TestState {
  tests: Test[];
  currentTest: Test | null;
  currentAttempt: TestAttempt | null;
  loading: boolean;
  error: string | null;
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface QuestionGenerationRequest {
  subject: string;
  class: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'objective' | 'subjective' | 'mixed';
  count: number;
  topic?: string;
}