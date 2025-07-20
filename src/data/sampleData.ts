// Sample data for development and demonstration

import { Test, Question, User } from '../types';

export const sampleUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    class: '10th Grade',
    subjects: ['Mathematics', 'Science', 'English'],
    role: 'student',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    class: '11th Grade',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    role: 'student',
    createdAt: '2024-01-16T09:30:00Z',
  },
];

export const sampleQuestions: Question[] = [
  {
    id: 'q1',
    subject: 'Mathematics',
    class: '10th Grade',
    difficulty: 'medium',
    type: 'objective',
    question: 'What is the value of x in the equation 2x + 5 = 15?',
    options: ['5', '10', '7', '3'],
    correctAnswer: '5',
    explanation: '2x + 5 = 15, so 2x = 10, therefore x = 5',
    points: 10,
    createdBy: 'manual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'q2',
    subject: 'Mathematics',
    class: '10th Grade',
    difficulty: 'medium',
    type: 'subjective',
    question: 'Explain the Pythagorean theorem and provide an example.',
    correctAnswer: 'The Pythagorean theorem states that in a right triangle, a² + b² = c² where c is the hypotenuse',
    explanation: 'The theorem relates the lengths of sides in a right triangle',
    points: 15,
    createdBy: 'manual',
    createdAt: '2024-01-15T10:05:00Z',
  },
  {
    id: 'q3',
    subject: 'Science',
    class: '10th Grade',
    difficulty: 'easy',
    type: 'objective',
    question: 'What is the chemical symbol for water?',
    options: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctAnswer: 'H2O',
    explanation: 'Water consists of two hydrogen atoms and one oxygen atom',
    points: 5,
    createdBy: 'ai',
    createdAt: '2024-01-15T10:10:00Z',
  },
  {
    id: 'q4',
    subject: 'English',
    class: '10th Grade',
    difficulty: 'medium',
    type: 'objective',
    question: 'Who wrote "Romeo and Juliet"?',
    options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
    correctAnswer: 'William Shakespeare',
    explanation: 'Shakespeare wrote this famous tragedy in the early part of his career',
    points: 10,
    createdBy: 'manual',
    createdAt: '2024-01-15T10:15:00Z',
  },
];

export const sampleTests: Test[] = [
  {
    id: '1',
    title: 'Mathematics Fundamentals',
    subject: 'Mathematics',
    class: '10th Grade',
    difficulty: 'medium',
    description: 'Basic algebra, geometry, and arithmetic concepts',
    questions: [sampleQuestions[0], sampleQuestions[1]],
    timeLimit: 30,
    totalPoints: 25,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Science Basics',
    subject: 'Science',
    class: '10th Grade',
    difficulty: 'easy',
    description: 'Fundamental science concepts and principles',
    questions: [sampleQuestions[2]],
    timeLimit: 15,
    totalPoints: 5,
    isActive: true,
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    title: 'English Literature',
    subject: 'English',
    class: '10th Grade',
    difficulty: 'medium',
    description: 'Classic literature and language arts',
    questions: [sampleQuestions[3]],
    timeLimit: 20,
    totalPoints: 10,
    isActive: true,
    createdAt: '2024-01-15T12:00:00Z',
  },
];

// Mock API responses
export const mockAPI = {
  login: async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return sampleUsers[0];
  },
  
  register: async (userData: Omit<User, 'id' | 'createdAt'>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
  },
  
  fetchTests: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return sampleTests;
  },
  
  generateQuestions: async (request: any) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock AI-generated questions
    return [
      {
        id: `ai-${Date.now()}`,
        subject: request.subject,
        class: request.class,
        difficulty: request.difficulty,
        type: request.type === 'mixed' ? 'objective' : request.type,
        question: `AI-generated ${request.subject} question about ${request.topic || 'general concepts'}?`,
        options: request.type !== 'subjective' ? ['Option A', 'Option B', 'Option C', 'Option D'] : undefined,
        correctAnswer: request.type !== 'subjective' ? 'Option A' : 'AI-generated answer',
        explanation: 'AI-generated explanation',
        points: 10,
        createdBy: 'ai' as const,
        createdAt: new Date().toISOString(),
      },
    ];
  },
};