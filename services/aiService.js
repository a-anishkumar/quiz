const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async extractTopicsFromText(text) {
    try {
      const prompt = `
        You are an expert curriculum designer. From ONLY the text below, extract 15 distinct, ordered topics
        suitable for a learning path. Use the original terminology from the text when possible. Avoid generic
        placeholders. If the source does not cover a topic, DO NOT fabricate it.

        Return ONLY a valid JSON array of strings. No prose, no markdown.

        SOURCE TEXT (truncate if needed):
        """
        ${text.substring(0, 6000)}
        """
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let topicsText = response.text();
      topicsText = topicsText.replace(/```json\s*|```/g, '').trim();
      let topics = [];
      try {
        topics = JSON.parse(topicsText);
      } catch (_) {
        topics = topicsText
          .split(/\n|,|;|\u2022|\-/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      topics = Array.from(new Set(topics.map(t => t.replace(/^\d+\.?\s*/, '').trim())));
      return topics.slice(0, 15);
    } catch (error) {
      console.error('Error extracting topics:', error);
      return [];
    }
  }

  async generateModuleContent(topic, difficulty = 'beginner', learningStyle = 'reading', contextText = '') {
    try {
      const prompt = `
        Create comprehensive educational content for the topic: "${topic}"
        
        Difficulty Level: ${difficulty}
        Learning Style: ${learningStyle}
        Context (from the student's uploaded material, use this to align terminology and focus; you may ignore irrelevant parts):
        """
        ${contextText.substring(0, 3500)}
        """
        
        Generate detailed, well-structured content that includes:
        
        1. **Introduction**: Brief overview of the topic
        2. **Key Concepts**: Main ideas and definitions
        3. **Detailed Explanation**: In-depth coverage with examples
        4. **Practical Applications**: Real-world uses and scenarios
        5. **Step-by-Step Process**: If applicable, break down complex procedures
        6. **Common Examples**: Illustrative examples to aid understanding
        7. **Summary**: Key takeaways and important points
        
        Requirements:
        - Use clear, simple language appropriate for ${difficulty} level
        - Include specific examples and analogies
        - Make it engaging and easy to follow
        - Ensure content is comprehensive (800-1200 words)
        - Use proper formatting with clear sections
        - Include practical insights and applications
        
        Format the content with clear headings and bullet points where appropriate.

        IMPORTANT:
        - Use ONLY information that is present in the provided context. Do not invent details.
        - If the context lacks specific details for a subsection, acknowledge briefly and keep focus on available content.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      // Ensure we have substantial content
      if (content.length < 200) {
        return this.generateFallbackContent(topic, difficulty);
      }

      return content;
    } catch (error) {
      console.error('Error generating module content:', error);
      return this.generateFallbackContent(topic, difficulty);
    }
  }

  generateFallbackContent(topic, difficulty) {
    return `
# ${topic}

## Introduction
This module provides a comprehensive overview of ${topic}. Understanding this topic is essential for building a strong foundation in your learning journey.

## Key Concepts
- **Definition**: ${topic} refers to the fundamental principles and practices in this area
- **Importance**: This topic is crucial for understanding advanced concepts
- **Applications**: Used in various real-world scenarios

## Detailed Explanation
${topic} involves several important aspects that we'll explore in detail:

1. **Core Principles**: The fundamental ideas that govern this topic
2. **Key Components**: The main elements that make up this subject
3. **Relationships**: How different parts connect and interact

## Practical Applications
Understanding ${topic} helps you:
- Apply knowledge in real-world situations
- Solve problems more effectively
- Make informed decisions
- Build upon this knowledge for advanced topics

## Examples
Here are some common examples of ${topic} in action:
- Example 1: [Specific application]
- Example 2: [Another practical use]
- Example 3: [Real-world scenario]

## Summary
Key takeaways from this module:
- ${topic} is fundamental to understanding this subject area
- The concepts covered here provide a solid foundation
- Practice and application will help reinforce your understanding
- This knowledge prepares you for more advanced topics

## Next Steps
After completing this module, you should be able to:
- Explain the basic concepts of ${topic}
- Identify practical applications
- Apply this knowledge in various contexts
- Move confidently to the next learning module
    `;
  }

  async generateSimplifiedContent(originalContent, topic) {
    try {
      const prompt = `
        The following content was too difficult for a student to understand. Please create a simplified, more beginner-friendly version of this content.
        
        Topic: ${topic}
        Original Content: ${originalContent.substring(0, 2000)}
        
        Requirements:
        1. Use simpler language and shorter sentences
        2. Add more examples and analogies
        3. Break down complex concepts into smaller parts
        4. Use bullet points and clear structure
        5. Make it more engaging and easier to follow
        
        Keep the same core information but make it much more accessible.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating simplified content:', error);
      return `Let's break down ${topic} into simpler terms. This topic covers important concepts that we'll explore step by step with clear examples.`;
    }
  }

  async generateQuizQuestions(topic, moduleContent, contextText = '', numQuestions = 5) {
    try {
      const prompt = `
        Generate ${numQuestions} high-quality multiple-choice quiz questions based on the following topic, module content, and source material.
        
        Topic: ${topic}
        Module Content: ${moduleContent.substring(0, 2000)}
        Source Material Context: ${contextText.substring(0, 3000)}
        
        CRITICAL REQUIREMENTS:
        1. Questions MUST be directly related to the specific content in the source material
        2. Use exact terminology, concepts, and examples from the source material
        3. Create questions that test deep understanding, not just memorization
        4. Include exactly 4 options for each question (A, B, C, D)
        5. Make incorrect options plausible but clearly distinguishable from correct answers
        6. Provide detailed explanations that reference specific content from the source material
        7. Mix question types: definition, application, analysis, and synthesis
        8. Focus on the most important and specific concepts from the source material
        9. Ensure questions are clear, unambiguous, and directly testable from the content
        
        QUESTION TYPES TO INCLUDE:
        - Definition questions: "What is [specific term from source]?"
        - Application questions: "How would you apply [concept from source] in [specific scenario]?"
        - Analysis questions: "Based on the source material, what is the relationship between [concept A] and [concept B]?"
        - Synthesis questions: "According to the source, what are the key factors that influence [specific topic]?"
        
        Return ONLY a valid JSON object in this exact format:
        {
          "questions": [
            {
              "question": "Based on the source material, what is the primary purpose of [specific concept mentioned in source]?",
              "options": ["Specific option A from source", "Specific option B from source", "Specific option C from source", "Specific option D from source"],
              "correctAnswer": 0,
              "explanation": "Detailed explanation referencing specific content from the source material and why other options are incorrect"
            }
          ]
        }
        
        Do not include any text before or after the JSON object.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let questionsText = response.text();

      // Clean up the response
      questionsText = questionsText.replace(/```json\n?|\n?```/g, '').trim();

      // Parse JSON response
      const questionsData = JSON.parse(questionsText);

      // Validate the response
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
        throw new Error('Invalid response format');
      }

      // Ensure each question has all required fields
      const validatedQuestions = questionsData.questions.map((q, index) => ({
        question: q.question || `Question ${index + 1} about ${topic}?`,
        options: q.options && q.options.length === 4 ? q.options : [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
          ? q.correctAnswer : 0,
        explanation: q.explanation || 'This is the correct answer based on the module content.'
      }));

      return validatedQuestions;
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      // Enhanced fallback questions
      return this.generateFallbackQuestions(topic, numQuestions);
    }
  }

  generateFallbackQuestions(topic, numQuestions) {
    const questions = [];
    const questionTemplates = [
      {
        question: `What is the primary purpose of ${topic}?`,
        options: [
          'To provide a structured approach to understanding complex concepts',
          'To simplify advanced topics for beginners',
          'To create visual representations of data',
          'To automate repetitive tasks'
        ],
        correctAnswer: 0,
        explanation: `${topic} serves as a structured approach to understanding complex concepts, providing a foundation for deeper learning.`
      },
      {
        question: `Which of the following best describes ${topic}?`,
        options: [
          'A comprehensive framework for systematic learning',
          'A quick reference guide for experts',
          'A collection of random facts',
          'A simple dictionary definition'
        ],
        correctAnswer: 0,
        explanation: `${topic} is best described as a comprehensive framework that enables systematic learning and understanding.`
      },
      {
        question: `How does ${topic} contribute to learning?`,
        options: [
          'By providing clear structure and progression',
          'By offering quick shortcuts to mastery',
          'By replacing the need for practice',
          'By memorizing facts without understanding'
        ],
        correctAnswer: 0,
        explanation: `${topic} contributes to learning by providing clear structure and logical progression through concepts.`
      },
      {
        question: `What makes ${topic} effective for students?`,
        options: [
          'Its systematic approach and clear explanations',
          'Its ability to skip difficult concepts',
          'Its focus on memorization only',
          'Its avoidance of practical applications'
        ],
        correctAnswer: 0,
        explanation: `${topic} is effective because it uses a systematic approach with clear explanations that help students understand.`
      },
      {
        question: `In what way does ${topic} support learning objectives?`,
        options: [
          'By breaking down complex topics into manageable parts',
          'By providing all answers without thinking',
          'By focusing only on theoretical knowledge',
          'By avoiding real-world applications'
        ],
        correctAnswer: 0,
        explanation: `${topic} supports learning objectives by breaking down complex topics into manageable, understandable parts.`
      }
    ];

    for (let i = 0; i < numQuestions; i++) {
      const template = questionTemplates[i % questionTemplates.length];
      questions.push({
        question: template.question,
        options: [...template.options], // Create a copy to avoid reference issues
        correctAnswer: template.correctAnswer,
        explanation: template.explanation
      });
    }

    return questions;
  }

  async generateFinalQuiz(courseTopics, allModules, numQuestions = 20) {
    try {
      const prompt = `
        Generate a comprehensive final exam with ${numQuestions} multiple-choice questions covering all the topics from this course.
        
        Course Topics: ${courseTopics.join(', ')}
        
        Requirements:
        1. Include questions from all major topics
        2. Mix difficulty levels (60% intermediate, 40% advanced)
        3. Test both knowledge and application
        4. Include scenario-based questions
        5. Provide detailed explanations for answers
        
        Return in JSON format:
        {
          "questions": [
            {
              "question": "Question text",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": 0,
              "explanation": "Detailed explanation"
            }
          ]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const questionsText = response.text();

      const questionsData = JSON.parse(questionsText.replace(/```json\n?|\n?```/g, ''));
      return questionsData.questions;
    } catch (error) {
      console.error('Error generating final quiz:', error);
      return [];
    }
  }

  async analyzeLearningProgress(userAnswers, correctAnswers, topic) {
    try {
      const prompt = `
        Analyze the student's quiz performance and provide personalized feedback.
        
        Topic: ${topic}
        Student's performance: ${userAnswers.filter((answer, index) => answer === correctAnswers[index]).length}/${userAnswers.length} correct
        
        Provide:
        1. Encouraging feedback
        2. Areas that need improvement
        3. Suggestions for better understanding
        4. Whether they should proceed or review the material
        
        Keep the feedback positive and constructive.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing progress:', error);
      return 'Great effort! Continue practicing to improve your understanding.';
    }
  }

  async generateRelatedRoadmaps(topics, sourceText) {
    try {
      // Use the new roadmap service
      const roadmapService = require('./roadmapService');
      return await roadmapService.generateRoadmap(topics, sourceText);
    } catch (error) {
      console.error('Error generating related roadmaps:', error);
      return this.generateFallbackRoadmaps(topics);
    }
  }

  generateFallbackRoadmaps(topics) {
    return [
      {
        title: `Advanced ${topics[0] || 'Subject'} Learning Path`,
        description: `Continue your learning journey with advanced concepts related to ${topics[0] || 'the subject'}`,
        phases: [
          {
            name: "Foundation",
            topics: topics.slice(0, 3),
            duration: "2-3 weeks",
            description: "Build fundamental understanding"
          },
          {
            name: "Intermediate",
            topics: topics.slice(3, 6),
            duration: "3-4 weeks",
            description: "Apply concepts in practical scenarios"
          },
          {
            name: "Advanced",
            topics: topics.slice(6, 9),
            duration: "4-5 weeks",
            description: "Master complex applications"
          }
        ],
        totalDuration: "9-12 weeks",
        difficulty: "intermediate",
        prerequisites: ["Basic understanding of core concepts"],
        learningOutcomes: ["Master advanced concepts", "Apply knowledge practically", "Solve complex problems"]
      }
    ];
  }
}

module.exports = new AIService();
