# Qizz - AI-Powered E-Learning Content Generator

A comprehensive SaaS platform that transforms PDF textbooks into personalized learning experiences using AI. Upload any PDF, and our system automatically extracts key concepts, generates interactive quizzes, creates step-by-step learning modules, and provides digital certificates upon completion.

## 🚀 Features

### Core Functionality
- **PDF Upload & Processing**: Upload PDF textbooks up to 10MB
- **AI Content Analysis**: Extract 15 key topics using Gemini AI
- **Adaptive Learning Modules**: Generate personalized learning paths
- **Interactive Quizzes**: Create 30+ quiz questions per module
- **Progress Tracking**: Monitor learning progress and completion
- **Digital Certificates**: Generate e-certificates for completed courses
- **Simplified Content**: AI adapts content difficulty based on performance

### Learning Experience
- **Step-by-step Learning**: Break down complex topics into digestible modules
- **Adaptive Difficulty**: Content adjusts based on quiz performance
- **Multiple Learning Styles**: Support for visual, auditory, kinesthetic, and reading preferences
- **Progress Analytics**: Track completion rates and learning statistics
- **Roadmap Integration**: Follow structured learning paths for popular courses

### User Management
- **Authentication System**: Secure login/register with JWT
- **Profile Management**: Customize learning preferences
- **Achievement System**: Earn badges and certificates
- **Progress Persistence**: Save learning progress across sessions

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **PDF-parse** for text extraction
- **Google Gemini AI** for content generation
- **jsPDF** for certificate generation

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Dropzone** for file uploads

## 📋 Prerequisites

Before running the application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key** (free tier available)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd qizz-elearning-saas
```

### 2. Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/qizz-elearning

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 4. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Start the Application
```bash
# Start both server and client
npm run dev

# Or start individually
npm run server  # Backend only
npm run client  # Frontend only
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 📁 Project Structure

```
qizz-elearning-saas/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js
│   └── package.json
├── models/                 # MongoDB models
│   ├── User.js
│   └── Course.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── courses.js
│   ├── quiz.js
│   ├── roadmap.js
│   └── certificate.js
├── services/               # Business logic
│   ├── aiService.js
│   └── pdfService.js
├── middleware/             # Custom middleware
│   └── auth.js
├── uploads/                # PDF uploads directory
├── certificates/           # Generated certificates
├── server.js              # Main server file
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Courses
- `POST /api/courses/create-from-pdf` - Create course from PDF
- `GET /api/courses` - Get user's courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses/:id/generate-modules` - Generate learning modules
- `PUT /api/courses/:id/progress` - Update learning progress

### Quizzes
- `POST /api/quiz/:courseId/modules/:moduleId/generate` - Generate quiz
- `POST /api/quiz/:courseId/modules/:moduleId/submit` - Submit quiz answers
- `GET /api/quiz/:courseId/modules/:moduleId` - Get quiz questions

### Certificates
- `POST /api/certificate/generate/:courseId` - Generate certificate
- `GET /api/certificate/my-certificates` - Get user certificates
- `GET /api/certificate/download/:courseId` - Download certificate

### Roadmaps
- `GET /api/roadmap/popular` - Get popular roadmaps
- `GET /api/roadmap/:id` - Get roadmap details

## 🎯 Usage Guide

### For Students
1. **Register/Login**: Create an account or sign in
2. **Upload PDF**: Upload your textbook or course material
3. **Generate Course**: Let AI extract topics and create modules
4. **Learn**: Go through modules at your own pace
5. **Take Quizzes**: Test your understanding with AI-generated quizzes
6. **Earn Certificates**: Complete courses to earn digital certificates

### For Educators
1. **Create Courses**: Upload educational materials
2. **Customize Content**: Adjust difficulty and learning styles
3. **Track Progress**: Monitor student learning analytics
4. **Generate Reports**: Export learning progress data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **File Validation**: PDF type and size validation
- **Input Sanitization**: Prevent injection attacks
- **CORS Protection**: Configured for secure cross-origin requests

## 🚀 Deployment

### Production Build
```bash
# Build the React app
cd client
npm run build
cd ..

# Start production server
NODE_ENV=production npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🎉 Acknowledgments

- **Google Gemini AI** for powerful content generation
- **React Community** for excellent documentation
- **Tailwind CSS** for beautiful styling
- **Framer Motion** for smooth animations

## 🔮 Future Enhancements

- [ ] Multi-language support
- [ ] Video content integration
- [ ] Collaborative learning features
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with popular LMS platforms
- [ ] AI-powered tutoring system
- [ ] Gamification elements

---

**Built with ❤️ for the future of education**
