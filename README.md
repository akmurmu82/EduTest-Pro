# EduTest Pro - Complete Educational Testing Platform

A comprehensive educational testing platform with AI-powered question generation, real-time testing, and advanced analytics.

## 🚀 Features

### Frontend Features
- **Modern React Application** with TypeScript and Tailwind CSS
- **Authentication System** with student registration and login
- **Interactive Dashboard** with test cards and statistics
- **Real-time Testing** with timer and tab-switching detection
- **Comprehensive Results** with scoring and answer review
- **Admin Panel** for managing questions, tests, and students
- **AI Question Generation** with customizable parameters
- **Dark/Light Theme** with persistent storage
- **Fully Responsive** mobile-first design

### Backend Features
- **RESTful API** with Express.js and MongoDB
- **JWT Authentication** with role-based access control
- **AI Integration** with OpenAI for question generation
- **Advanced Analytics** and reporting
- **Security Features** including rate limiting and validation
- **Comprehensive Test Management** with scheduling
- **Student Performance Tracking** with detailed reports

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- Axios for API calls

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- OpenAI API for question generation
- Joi for validation
- Helmet for security

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- OpenAI API key (for AI features)

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Configuration:**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/edutest
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas cloud service
```

5. **Start the backend server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Environment Configuration:**
Create `.env` file in root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. **Start the development server:**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create question (Admin)
- `PUT /api/questions/:id` - Update question (Admin)
- `DELETE /api/questions/:id` - Delete question (Admin)
- `POST /api/questions/generate` - AI generate questions (Admin)

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get specific test
- `POST /api/tests` - Create test (Admin)
- `PUT /api/tests/:id` - Update test (Admin)
- `DELETE /api/tests/:id` - Delete test (Admin)

### Test Attempts
- `POST /api/attempts` - Submit test attempt
- `GET /api/attempts/user/:userId` - Get user attempts
- `GET /api/attempts/:id` - Get attempt details

### Admin
- `GET /api/admin/students` - Get all students
- `PUT /api/admin/students/:id` - Update student
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/reports/student/:id` - Student report
- `GET /api/admin/reports/test/:id` - Test report

## 🤖 AI Integration

The platform uses OpenAI's GPT-3.5-turbo for intelligent question generation:

### Features
- **Subject-specific questions** based on curriculum
- **Difficulty-based generation** (Easy, Medium, Hard)
- **Mixed question types** (Objective and Subjective)
- **Topic-focused content** with custom prompts
- **Automatic validation** and fallback mechanisms

### Usage
1. Navigate to Admin Panel
2. Click "AI Generate" button
3. Fill in the generation form:
   - Subject (e.g., Mathematics)
   - Class (9th-12th Grade)
   - Difficulty level
   - Question type
   - Number of questions
   - Optional topic focus
4. Review and save generated questions

## 🎨 Theme System

The application features a comprehensive dark/light theme system:

### Implementation
- **Tailwind CSS dark mode** with class-based switching
- **Redux state management** for theme persistence
- **Local storage** for theme preference
- **System preference detection** on first visit
- **Smooth transitions** between themes

### Usage
- Click the theme toggle button in the header
- Theme preference is automatically saved
- All components support both themes
- Consistent styling across the application

## 👥 User Roles

### Student
- Register and manage profile
- Take tests with real-time features
- View results and performance analytics
- Review answers and explanations

### Admin
- Full platform management
- Create and manage questions/tests
- AI-powered question generation
- Student management and analytics
- Comprehensive reporting system

## 🔒 Security Features

### Frontend Security
- Input validation and sanitization
- XSS prevention
- Secure token storage
- Route protection

### Backend Security
- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation with Joi
- CORS configuration
- Helmet security headers

### Test Security
- Tab switching detection
- Time limit enforcement
- IP address logging
- Suspicious activity flagging

## 📊 Analytics & Reporting

### Student Analytics
- Performance tracking
- Subject-wise breakdown
- Progress over time
- Category distribution

### Admin Analytics
- Platform overview statistics
- Recent activity trends
- Subject performance analysis
- Top performers leaderboard
- Test completion rates

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment:**
```bash
# Add start script to package.json
"scripts": {
  "start": "node server.js"
}
```

2. **Deploy to Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

3. **Environment Variables:**
Set all required environment variables in your deployment platform.

### Frontend Deployment (Netlify/Vercel)

1. **Build the project:**
```bash
npm run build
```

2. **Deploy to Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔄 Updates

The platform is actively maintained with regular updates for:
- Security patches
- Feature enhancements
- Bug fixes
- Performance improvements

---

**EduTest Pro** - Empowering education through intelligent testing and analytics.