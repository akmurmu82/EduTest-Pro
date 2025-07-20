# EduTest Pro - Educational Testing Platform

## Overview
EduTest Pro is a comprehensive educational testing platform built with React, TypeScript, Redux Toolkit, and Tailwind CSS. It features AI-powered question generation, real-time testing, and comprehensive result analysis.

## Features

### Core Functionality
- **Authentication System**: Secure login/signup with student information collection
- **Interactive Dashboard**: Browse available tests with detailed information cards
- **Real-time Testing**: Timer-based assessments with tab-switching detection
- **Comprehensive Results**: Detailed scoring, categorization, and answer review
- **Theme Support**: Dark/light mode with persistent storage
- **Responsive Design**: Mobile-first approach with full responsiveness

### Advanced Features
- **AI Question Generation**: Automated question creation with customizable parameters
- **Tab Switching Detection**: Security feature that warns and auto-submits after violations
- **Progress Tracking**: Visual progress indicators and test navigation
- **Answer Review**: Detailed explanation of correct/incorrect answers
- **Student Categorization**: Performance-based ranking (Beginner, Intermediate, Advanced, Expert)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components (Header, etc.)
│   ├── test/           # Test-related components
│   ├── results/        # Result display components
│   └── ui/             # Basic UI components (Button, Card, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Main application pages
├── store/              # Redux store and slices
│   └── slices/         # Redux Toolkit slices
├── types/              # TypeScript type definitions
├── data/               # Sample data and mock APIs
└── docs/               # Documentation
```

### Component Architecture

#### UI Components (`src/components/ui/`)
- **Button**: Animated button with multiple variants and loading states
- **Card**: Reusable card component with hover effects
- **Input**: Form input with label and error handling
- **Badge**: Status indicators with color variants

#### Feature Components
- **TestCard**: Displays test information with action buttons
- **QuestionCard**: Renders questions with appropriate input types
- **Timer**: Real-time countdown with warning states
- **ResultCard**: Comprehensive result display with statistics

### State Management

#### Redux Slices
1. **authSlice**: User authentication and profile management
2. **testSlice**: Test data, current test state, and attempts
3. **themeSlice**: Theme preferences and persistence

#### Data Flow
```
User Action → Component → Redux Action → API Call → State Update → UI Re-render
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  class: string;
  subjects: string[];
  role: 'student' | 'admin';
  createdAt: string;
}
```

### Question Model
```typescript
interface Question {
  id: string;
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
```

### Test Model
```typescript
interface Test {
  id: string;
  title: string;
  subject: string;
  class: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  questions: Question[];
  timeLimit: number; // in minutes
  totalPoints: number;
  isActive: boolean;
  createdAt: string;
}
```

### Test Attempt Model
```typescript
interface TestAttempt {
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
```

## Backend Integration

### Suggested API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Tests
- `GET /api/tests` - Fetch available tests
- `GET /api/tests/:id` - Get specific test
- `POST /api/tests` - Create new test (admin)
- `PUT /api/tests/:id` - Update test (admin)

#### Questions
- `GET /api/questions` - Fetch questions
- `POST /api/questions` - Create question (admin)
- `POST /api/questions/generate` - AI question generation

#### Test Attempts
- `POST /api/attempts` - Submit test attempt
- `GET /api/attempts/:userId` - Get user's test history
- `GET /api/attempts/:id` - Get specific attempt details

### Database Schema (MongoDB/Mongoose)

#### User Schema
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  class: { type: String, required: true },
  subjects: [{ type: String }],
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  createdAt: { type: Date, default: Date.now }
});
```

#### Question Schema
```javascript
const questionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  class: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  type: { type: String, enum: ['objective', 'subjective'], required: true },
  question: { type: String, required: true },
  options: [{ type: String }], // Optional for objective questions
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  points: { type: Number, required: true },
  createdBy: { type: String, enum: ['ai', 'manual'], required: true },
  createdAt: { type: Date, default: Date.now }
});
```

#### Test Schema
```javascript
const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  class: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  description: { type: String, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  timeLimit: { type: Number, required: true }, // in minutes
  totalPoints: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
```

#### Test Attempt Schema
```javascript
const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  answers: { type: Map, of: String }, // questionId -> answer
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  percentage: { type: Number, required: true },
  category: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  timeSpent: { type: Number, required: true }, // in seconds
  tabSwitchCount: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: true }
});
```

## AI Integration

### Question Generation Service

#### OpenAI Integration Example
```javascript
const generateQuestions = async (request) => {
  const prompt = `
    Generate ${request.count} ${request.type} questions for ${request.subject} 
    at ${request.difficulty} difficulty level for ${request.class} students.
    Topic: ${request.topic || 'general concepts'}
    
    Format as JSON array with structure:
    {
      "question": "question text",
      "options": ["A", "B", "C", "D"], // only for objective
      "correctAnswer": "correct answer",
      "explanation": "explanation text",
      "points": 10
    }
  `;

  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    prompt,
    max_tokens: 1000,
    temperature: 0.7
  });

  return JSON.parse(response.data.choices[0].text);
};
```

### Alternative AI Services
- **Google Gemini**: For natural language processing
- **Claude**: For educational content generation
- **Hugging Face**: For specialized educational models

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```env
VITE_API_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_key
```

### Backend Setup (Suggested)
```bash
# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv

# Install dev dependencies
npm install -D nodemon

# Create server structure
mkdir routes controllers models middleware
```

## Deployment

### Frontend (Netlify/Vercel)
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist

# Or deploy to Vercel
vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Add to package.json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}

# Deploy to Railway
railway deploy

# Or deploy to Heroku
git push heroku main
```

## Security Considerations

### Frontend Security
- Input validation and sanitization
- XSS prevention with proper escaping
- CSRF protection with tokens
- Secure localStorage usage

### Backend Security
- Authentication with JWT tokens
- Password hashing with bcrypt
- Rate limiting for API endpoints
- Data validation with Joi/Yup

### Test Security
- Tab switching detection
- Time limit enforcement
- Answer encryption in transit
- Secure session management

## Performance Optimizations

### Frontend
- Code splitting with React.lazy
- Image optimization and lazy loading
- Bundle size optimization
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Redis caching
- Load balancing

## Future Enhancements

### Features
- Real-time collaboration for group tests
- Advanced analytics dashboard
- Mobile app development
- Offline test capabilities
- Video proctoring integration

### Technical Improvements
- GraphQL API implementation
- Microservices architecture
- Advanced caching strategies
- Performance monitoring
- Automated testing suite

## Contributing

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### Development Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

## License
MIT License - see LICENSE file for details.