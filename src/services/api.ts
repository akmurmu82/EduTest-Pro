import axios from 'axios';
import { User, Test, Question, TestAttempt, QuestionGenerationRequest } from '../types';

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
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Tests API
export const testsAPI = {
  getTests: async (): Promise<Test[]> => {
    const response = await api.get('/tests');
    return response.data;
  },

  getTest: async (id: string): Promise<Test> => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  createTest: async (testData: Omit<Test, 'id' | 'createdAt'>): Promise<Test> => {
    const response = await api.post('/tests', testData);
    return response.data;
  },

  updateTest: async (id: string, testData: Partial<Test>): Promise<Test> => {
    const response = await api.put(`/tests/${id}`, testData);
    return response.data;
  },

  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/tests/${id}`);
  },
};

// Questions API
export const questionsAPI = {
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/questions');
    return response.data;
  },

  createQuestion: async (questionData: Omit<Question, 'id' | 'createdAt'>): Promise<Question> => {
    const response = await api.post('/questions', questionData);
    return response.data;
  },

  updateQuestion: async (id: string, questionData: Partial<Question>): Promise<Question> => {
    const response = await api.put(`/questions/${id}`, questionData);
    return response.data;
  },

  deleteQuestion: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  generateQuestions: async (request: QuestionGenerationRequest): Promise<Question[]> => {
    const response = await api.post('/questions/generate', request);
    return response.data;
  },
};

// Test Attempts API
export const attemptsAPI = {
  submitAttempt: async (attemptData: Omit<TestAttempt, 'id' | 'completedAt'>): Promise<TestAttempt> => {
    const response = await api.post('/attempts', attemptData);
    return response.data;
  },

  getUserAttempts: async (userId: string): Promise<TestAttempt[]> => {
    const response = await api.get(`/attempts/user/${userId}`);
    return response.data;
  },

  getAllAttempts: async (): Promise<TestAttempt[]> => {
    const response = await api.get('/attempts');
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getStudents: async (): Promise<User[]> => {
    const response = await api.get('/admin/students');
    return response.data;
  },

  updateStudent: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/students/${id}`, userData);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/admin/students/${id}`);
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },
};

export default api;