const express = require('express');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const chatbotService = require('../services/chatbotService');

const router = express.Router();

// Chat with the doubt bot
router.post('/chat', auth, async (req, res) => {
    try {
        const { question, courseId } = req.body;

        if (!question || question.trim().length === 0) {
            return res.status(400).json({ message: 'Please provide a question' });
        }

        let context = '';
        let courseTopics = [];

        // If courseId is provided, get course context
        if (courseId) {
            const course = await Course.findById(courseId);
            if (course) {
                context = course.sourceText || '';
                courseTopics = course.extractedTopics || [];
            }
        }

        // Generate response using chatbot service
        const response = await chatbotService.generateResponse(question, context, courseTopics);

        res.json({
            message: 'Response generated successfully',
            response: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ message: 'Failed to generate response' });
    }
});

// Get suggested questions for a course
router.get('/suggested-questions/:courseId', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.createdBy.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const suggestedQuestions = await chatbotService.generateSuggestedQuestions(
            course.extractedTopics || []
        );

        res.json({
            message: 'Suggested questions generated successfully',
            questions: suggestedQuestions
        });
    } catch (error) {
        console.error('Suggested questions error:', error);
        res.status(500).json({ message: 'Failed to generate suggested questions' });
    }
});

// Get chatbot status and capabilities
router.get('/status', auth, async (req, res) => {
    try {
        res.json({
            message: 'Chatbot is active',
            capabilities: [
                'Answer questions about course content',
                'Provide learning guidance',
                'Suggest study strategies',
                'Help with concept clarification',
                'Generate practice questions'
            ],
            status: 'online'
        });
    } catch (error) {
        console.error('Chatbot status error:', error);
        res.status(500).json({ message: 'Failed to get chatbot status' });
    }
});

module.exports = router;
