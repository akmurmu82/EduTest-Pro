import axios from 'axios';
import { User, Test, Question, TestAttempt, QuestionGenerationRequest, QuestionsResponse, AuthResponse, SingleTestResponse, TestsResponse, SingleQuestionResponse, GeneratedQuestionsResponse, SingleAttemptResponse, AttemptsResponse, StudentsResponse, SingleUserResponse, AdminAnalytics } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');
    return response.data;
  },
};

// Tests API
export const testsAPI = {
  getTests: async (): Promise<Test[]> => {
    const response = await api.get<TestsResponse>('/tests');
    return response.data.tests;
  },

  getTest: async (id: string): Promise<Test> => {
    const response = await api.get<SingleTestResponse>(`/tests/${id}`);
    return response.data;
  },

  createTest: async (testData: Omit<Test, 'id' | 'createdAt'>): Promise<Test> => {
    const response = await api.post<SingleTestResponse>('/tests', {
      ...testData,
      questions: testData.questions.map(q => typeof q === 'string' ? q : q._id || q.id)
    });
    return response.data;
  },

  updateTest: async (id: string, testData: Partial<Test>): Promise<Test> => {
    const response = await api.put<SingleTestResponse>(`/tests/${id}`, {
      ...testData,
      questions: testData.questions ? testData.questions.map(q => typeof q === 'string' ? q : q._id || q.id) : undefined
    });
    return response.data;
  },

  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/tests/${id}`);
  },
};

// Questions API
export const questionsAPI = {
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get<QuestionsResponse>('/questions');
    return response.data.questions;
  },

  createQuestion: async (
    questionData: Omit<Question, 'id' | 'createdAt'>
  ): Promise<Question> => {
    const response = await api.post<SingleQuestionResponse>('/questions', questionData);
    return response.data;
  },

  updateQuestion: async (
    id: string,
    questionData: Partial<Question>
  ): Promise<Question> => {
    const response = await api.put<SingleQuestionResponse>(`/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  generateQuestions: async (
    request: QuestionGenerationRequest
  ): Promise<Question[]> => {
    const response = await api.post<GeneratedQuestionsResponse>('/questions/generate', request);
    return response.data.questions;
  },
};

// Test Attempts API
export const attemptsAPI = {
  submitAttempt: async (
    attemptData: Omit<TestAttempt, 'id' | 'completedAt'>
  ): Promise<TestAttempt> => {
    const response = await api.post<SingleAttemptResponse>('/attempts', attemptData);
    return response.data;
  },

  getUserAttempts: async (userId: string): Promise<TestAttempt[]> => {
    const response = await api.get<AttemptsResponse>(`/attempts/user/${userId}`);
    return response.data;
  },

  getAllAttempts: async (): Promise<TestAttempt[]> => {
    const response = await api.get<AttemptsResponse>('/attempts');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStudents: async (): Promise<User[]> => {
    const response = await api.get<StudentsResponse>('/admin/students');
    return response.data.students;
  },

  updateStudent: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<SingleUserResponse>(`/admin/students/${id}`, userData);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/admin/students/${id}`);
  },

  getAnalytics: async (): Promise<AdminAnalytics> => {
    const response = await api.get<AdminAnalytics>('/admin/analytics');
    return response.data;
  },
};

export default api;