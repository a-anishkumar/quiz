const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  simplifiedContent: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 15
  }
});

const quizSchema = new mongoose.Schema({
  moduleId: {
    type: Number,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: Number,
      required: true
    },
    explanation: {
      type: String,
      default: ''
    }
  }],
  passingScore: {
    type: Number,
    default: 70
  },
  timeLimit: {
    type: Number, // in minutes
    default: 10
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourcePdf: {
    filename: String,
    originalName: String,
    path: String,
    size: Number
  },
  // Raw text extracted from the uploaded PDF (truncated for storage)
  sourceText: {
    type: String,
    default: ''
  },
  extractedTopics: [{
    type: String
  }],
  modules: [moduleSchema],
  quizzes: [quizSchema],
  finalQuiz: {
    questions: [{
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number,
        required: true
      },
      explanation: {
        type: String,
        default: ''
      }
    }],
    passingScore: {
      type: Number,
      default: 80
    },
    timeLimit: {
      type: Number,
      default: 30
    }
  },
  totalModules: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  completionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
