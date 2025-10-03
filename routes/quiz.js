const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Helper function to check if course is 100% complete
async function checkCourseCompletion(course, progress) {
  try {
    // Check if all modules are completed
    const totalModules = course.modules.length;
    const completedModules = progress.completedModules.length;

    // Course is complete if all modules are completed
    return totalModules > 0 && completedModules >= totalModules;
  } catch (error) {
    console.error('Error checking course completion:', error);
    return false;
  }
}

// Generate quiz for a module
router.post('/:courseId/modules/:moduleId/generate', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const moduleId = parseInt(req.params.moduleId);
    const module = course.modules.find(m => m.order === moduleId);

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Generate quiz questions using AI
    const sourceContext = (course.sourceText || module.content || '').toString();
    const questions = await aiService.generateQuizQuestions(
      `${module.title} (based on uploaded material)`,
      module.content,
      sourceContext,
      5
    );

    // Save quiz to course
    const existingQuizIndex = course.quizzes.findIndex(q => q.moduleId === moduleId);
    const quizData = {
      moduleId: moduleId,
      questions: questions,
      passingScore: 70,
      timeLimit: 10
    };

    if (existingQuizIndex >= 0) {
      course.quizzes[existingQuizIndex] = quizData;
    } else {
      course.quizzes.push(quizData);
    }

    await course.save();

    res.json({
      message: 'Quiz generated successfully',
      quiz: {
        moduleId: moduleId,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options
        })),
        timeLimit: 10
      }
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
});

// Submit quiz answers
router.post('/:courseId/modules/:moduleId/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const moduleId = parseInt(req.params.moduleId);
    const quiz = course.quizzes.find(q => q.moduleId === moduleId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      results.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Update user progress
    const user = await User.findById(req.userId);
    let progress = user.currentProgress.find(p => p.courseId.toString() === req.params.courseId);

    if (!progress) {
      progress = {
        courseId: req.params.courseId,
        currentModule: 1,
        completedModules: [],
        quizAttempts: []
      };
      user.currentProgress.push(progress);
    }

    // Update quiz attempts
    const existingAttempt = progress.quizAttempts.find(a => a.moduleId === moduleId);
    if (existingAttempt) {
      existingAttempt.attempts += 1;
      existingAttempt.passed = passed;
      existingAttempt.lastAttempt = new Date();
    } else {
      progress.quizAttempts.push({
        moduleId: moduleId,
        attempts: 1,
        passed: passed,
        lastAttempt: new Date()
      });
    }

    // If passed, mark module as completed and check for course completion
    if (passed && !progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
      progress.currentModule = Math.max(progress.currentModule, moduleId + 1);

      // Check if course is 100% complete
      const isCourseComplete = await checkCourseCompletion(course, progress);
      if (isCourseComplete) {
        // Mark course as completed
        const existingCompletion = user.completedCourses.find(c => c.courseId.toString() === req.params.courseId);
        if (!existingCompletion) {
          user.completedCourses.push({
            courseId: req.params.courseId,
            completedAt: new Date(),
            score: 100, // Perfect score for completing all modules
            autoCompleted: true
          });

          // Save user after adding completed course
          await user.save();
        }
      }
    }

    // If failed, generate simplified content
    let simplifiedContent = null;
    if (!passed) {
      const module = course.modules.find(m => m.order === moduleId);
      if (module && !module.simplifiedContent) {
        simplifiedContent = await aiService.generateSimplifiedContent(
          module.content,
          module.title
        );

        module.simplifiedContent = simplifiedContent;
        await course.save();
      }
    }

    await user.save();

    // Generate AI feedback
    const feedback = await aiService.analyzeLearningProgress(
      answers,
      quiz.questions.map(q => q.correctAnswer),
      quiz.questions[0]?.question || 'the quiz'
    );

    res.json({
      message: 'Quiz submitted successfully',
      results: {
        score: score,
        passed: passed,
        correctAnswers: correctAnswers,
        totalQuestions: quiz.questions.length,
        results: results,
        feedback: feedback,
        simplifiedContent: simplifiedContent
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
});

// Generate final exam
router.post('/:courseId/final-exam/generate', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate final exam questions
    const questions = await aiService.generateFinalQuiz(
      course.extractedTopics,
      course.modules,
      20
    );

    course.finalQuiz = {
      questions: questions,
      passingScore: 80,
      timeLimit: 30
    };

    await course.save();

    res.json({
      message: 'Final exam generated successfully',
      exam: {
        questions: questions.map(q => ({
          question: q.question,
          options: q.options
        })),
        timeLimit: 30,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('Final exam generation error:', error);
    res.status(500).json({ message: 'Failed to generate final exam' });
  }
});

// Submit final exam
router.post('/:courseId/final-exam/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!course.finalQuiz || !course.finalQuiz.questions.length) {
      return res.status(404).json({ message: 'Final exam not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const results = [];

    course.finalQuiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) correctAnswers++;

      results.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / course.finalQuiz.questions.length) * 100);
    const passed = score >= course.finalQuiz.passingScore;

    // Update user's completed courses if passed
    if (passed) {
      const user = await User.findById(req.userId);

      // Check if course is already completed
      const existingCompletion = user.completedCourses.find(c => c.courseId.toString() === req.params.courseId);

      if (!existingCompletion) {
        user.completedCourses.push({
          courseId: req.params.courseId,
          completedAt: new Date(),
          score: score
        });

        await user.save();
      }
    }

    res.json({
      message: 'Final exam submitted successfully',
      results: {
        score: score,
        passed: passed,
        correctAnswers: correctAnswers,
        totalQuestions: course.finalQuiz.questions.length,
        results: results,
        certificateEligible: passed
      }
    });
  } catch (error) {
    console.error('Final exam submission error:', error);
    res.status(500).json({ message: 'Failed to submit final exam' });
  }
});

// Get quiz for a module
router.get('/:courseId/modules/:moduleId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const moduleId = parseInt(req.params.moduleId);
    const quiz = course.quizzes.find(q => q.moduleId === moduleId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
      quiz: {
        moduleId: quiz.moduleId,
        questions: quiz.questions.map(q => ({
          question: q.question,
          options: q.options
        })),
        timeLimit: quiz.timeLimit
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Failed to get quiz' });
  }
});

// Debug course completion status
router.get('/:courseId/completion-status', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const user = await User.findById(req.userId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const progress = user.currentProgress.find(p => p.courseId.toString() === req.params.courseId);
    const isCompleted = user.completedCourses.some(c => c.courseId.toString() === req.params.courseId);

    res.json({
      courseId: req.params.courseId,
      totalModules: course.modules.length,
      completedModules: progress?.completedModules || [],
      currentModule: progress?.currentModule || 1,
      isCourseCompleted: isCompleted,
      progress: progress,
      completedCourse: user.completedCourses.find(c => c.courseId.toString() === req.params.courseId)
    });
  } catch (error) {
    console.error('Debug completion status error:', error);
    res.status(500).json({ message: 'Failed to get completion status' });
  }
});

// Auto-generate certificate for completed course
router.post('/:courseId/auto-certificate', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const user = await User.findById(req.userId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has completed the course
    const completedCourse = user.completedCourses.find(c => c.courseId.toString() === req.params.courseId);
    if (!completedCourse) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    // Check if certificate already exists
    if (completedCourse.certificateUrl) {
      return res.json({
        message: 'Certificate already exists',
        certificate: {
          url: completedCourse.certificateUrl,
          exists: true
        }
      });
    }

    // Generate certificate
    const certificate = await generateCertificate(user, course, completedCourse.score);

    // Save certificate path to user's completed course
    completedCourse.certificateUrl = certificate.path;
    await user.save();

    res.json({
      message: 'Certificate generated successfully',
      certificate: {
        url: certificate.url,
        path: certificate.path
      }
    });
  } catch (error) {
    console.error('Auto certificate generation error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

// Generate certificate function (moved from certificate.js for auto-generation)
async function generateCertificate(user, course, score) {
  try {
    const jsPDF = require('jspdf');
    const path = require('path');
    const fs = require('fs');

    // Create PDF document
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Set background color
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add border
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(3);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Add decorative elements
    doc.setFillColor(0, 102, 204);
    doc.circle(pageWidth / 2, 40, 25, 'F');

    // Add certificate title
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 80, { align: 'center' });

    // Add subtitle
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 100, { align: 'center' });

    // Add student name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    // Add course completion text
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', pageWidth / 2, 140, { align: 'center' });

    // Add course title
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`"${course.title}"`, pageWidth / 2, 160, { align: 'center' });

    // Add score
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`with a score of ${score}%`, pageWidth / 2, 180, { align: 'center' });

    // Add completion date
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Completed on ${completionDate}`, pageWidth / 2, 200, { align: 'center' });

    // Add signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(pageWidth - 100, pageHeight - 60, pageWidth - 20, pageHeight - 60);
    doc.setFontSize(12);
    doc.text('Qizz E-Learning Platform', pageWidth - 60, pageHeight - 45, { align: 'center' });

    // Add certificate ID
    const certificateId = `QIZZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${certificateId}`, 20, pageHeight - 20);

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, '..', 'certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Save certificate
    const filename = `certificate-${user._id}-${course._id}-${Date.now()}.pdf`;
    const filepath = path.join(certificatesDir, filename);
    doc.save(filepath);

    return {
      path: `certificates/${filename}`,
      url: `/api/certificate/download/${course._id}`
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

module.exports = router;
