const express = require('express');
const multer = require('multer');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');
const pdfService = require('../services/pdfService');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Create course from PDF
router.post('/create-from-pdf', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    // Validate PDF
    await pdfService.validatePDF(req.file);

    // Save PDF
    const pdfData = await pdfService.savePDF(req.file, req.userId);

    // Extract text from PDF
    const { text, pages } = await pdfService.extractTextFromPDF(pdfData.path);

    if (!text || text.length < 100) {
      return res.status(400).json({ message: 'PDF appears to be empty or unreadable' });
    }

    // Extract topics using AI
    let topics = await aiService.extractTopicsFromText(text);
    // Fallback to structural extraction if AI returns nothing
    if (!topics || topics.length === 0) {
      const sectionTopics = pdfService.extractKeySections(text);
      topics = sectionTopics && sectionTopics.length > 0 ? sectionTopics : [];
    }
    // Last-resort fallback: derive topics from frequent sentences/phrases
    if (topics.length === 0) {
      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 20);
      topics = sentences.slice(0, 15).map((s, i) => s.substring(0, 80) + (s.length > 80 ? '…' : ''));
    }

    // Create course
    const course = new Course({
      title: `Course from ${pdfData.originalName}`,
      description: `AI-generated course based on ${pdfData.originalName}`,
      subject: 'General',
      level: 'beginner',
      createdBy: req.userId,
      sourcePdf: pdfData,
      sourceText: text.substring(0, 25000),
      extractedTopics: topics,
      totalModules: topics.length,
      estimatedDuration: Math.ceil(topics.length * 0.5) // 30 minutes per module
    });

    await course.save();

    res.json({
      message: 'Course created successfully',
      course: {
        id: course._id,
        title: course.title,
        topics: course.extractedTopics,
        totalModules: course.totalModules,
        estimatedDuration: course.estimatedDuration
      }
    });
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ message: error.message || 'Failed to create course' });
  }
});

// Generate modules for a course
router.post('/:courseId/generate-modules', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.userId);
    const { difficulty, learningStyle } = user.preferences;

    // Guard: ensure we have topics
    if (!course.extractedTopics || course.extractedTopics.length === 0) {
      return res.status(400).json({ message: 'No topics found for this course. Use Regenerate from PDF first.' });
    }

    // Generate modules for each topic
    const modules = [];
    for (let i = 0; i < course.extractedTopics.length; i++) {
      const topic = course.extractedTopics[i];
      const content = await aiService.generateModuleContent(
        topic,
        difficulty,
        learningStyle,
        course.sourceText || ''
      );

      modules.push({
        title: topic,
        content: content,
        order: i + 1,
        difficulty: difficulty,
        estimatedTime: 15
      });
    }

    course.modules = modules;
    await course.save();

    res.json({
      message: 'Modules generated successfully',
      modules: modules.map(module => ({
        id: module._id,
        title: module.title,
        order: module.order,
        estimatedTime: module.estimatedTime
      }))
    });
  } catch (error) {
    console.error('Module generation error:', error);
    res.status(500).json({ message: 'Failed to generate modules' });
  }
});

// Regenerate topics and modules from original PDF text
router.post('/:courseId/regenerate', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Ensure we have source text; if missing, try to re-extract from PDF
    let sourceText = course.sourceText || '';
    if (!sourceText && course.sourcePdf && course.sourcePdf.path) {
      const extracted = await pdfService.extractTextFromPDF(course.sourcePdf.path);
      sourceText = extracted.text || '';
      course.sourceText = sourceText.substring(0, 25000);
    }

    if (!sourceText) {
      return res.status(400).json({ message: 'No source PDF text available to regenerate from.' });
    }

    // Re-extract topics and regenerate modules
    const topics = await aiService.extractTopicsFromText(sourceText);

    const user = await User.findById(req.userId);
    const { difficulty, learningStyle } = user.preferences;

    const modules = [];
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      const content = await aiService.generateModuleContent(
        topic,
        difficulty,
        learningStyle,
        sourceText
      );

      modules.push({
        title: topic,
        content,
        order: i + 1,
        difficulty,
        estimatedTime: 15
      });
    }

    course.extractedTopics = topics;
    course.modules = modules;
    course.totalModules = modules.length;
    course.estimatedDuration = Math.ceil(modules.length * 0.5);
    course.quizzes = [];
    course.finalQuiz = undefined;

    await course.save();

    res.json({
      message: 'Course regenerated from PDF successfully',
      course: {
        id: course._id,
        title: course.title,
        topics: course.extractedTopics,
        totalModules: course.totalModules,
        estimatedDuration: course.estimatedDuration
      }
    });
  } catch (error) {
    console.error('Course regeneration error:', error);
    res.status(500).json({ message: 'Failed to regenerate course from PDF' });
  }
});

// Get course details
router.get('/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('createdBy', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Failed to get course' });
  }
});

// Get user's courses
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.userId })
      .select('title description subject level totalModules estimatedDuration createdAt')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Failed to get courses' });
  }
});

// Get module content
router.get('/:courseId/modules/:moduleId', auth, async (req, res) => {
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

    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ message: 'Failed to get module' });
  }
});

// Update module progress
router.put('/:courseId/progress', auth, async (req, res) => {
  try {
    const { moduleId, completed } = req.body;

    const user = await User.findById(req.userId);
    const courseId = req.params.courseId;

    // Find or create progress entry
    let progress = user.currentProgress.find(p => p.courseId.toString() === courseId);

    if (!progress) {
      progress = {
        courseId: courseId,
        currentModule: 1,
        completedModules: [],
        quizAttempts: []
      };
      user.currentProgress.push(progress);
    }

    if (completed && !progress.completedModules.includes(moduleId)) {
      progress.completedModules.push(moduleId);
      progress.currentModule = Math.max(progress.currentModule, moduleId + 1);
    }

    await user.save();

    res.json({
      message: 'Progress updated successfully',
      progress: progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

// Generate related roadmaps for a course
router.get('/:courseId/related-roadmaps', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate related roadmaps based on course topics and source material
    const relatedRoadmaps = await aiService.generateRelatedRoadmaps(
      course.extractedTopics,
      course.sourceText || ''
    );

    res.json({
      message: 'Related roadmaps generated successfully',
      roadmaps: relatedRoadmaps
    });
  } catch (error) {
    console.error('Generate related roadmaps error:', error);
    res.status(500).json({ message: 'Failed to generate related roadmaps' });
  }
});

// Delete course
router.delete('/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete PDF file
    if (course.sourcePdf && course.sourcePdf.path) {
      await pdfService.deletePDF(course.sourcePdf.path);
    }

    await Course.findByIdAndDelete(req.params.courseId);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

module.exports = router;
