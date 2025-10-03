const axios = require('axios');

class RoadmapService {
    constructor() {
        this.apiKey = process.env.ROADMAP_API_KEY;
        this.apiUrl = process.env.ROADMAP_API_URL || 'https://api.roadmap.io/v1';
    }

    async generateRoadmap(topics, sourceText) {
        try {
            // If no API key, fallback to AI-generated roadmaps
            if (!this.apiKey || this.apiKey === 'your-roadmap-api-key-here') {
                console.log('No roadmap API key found, using AI fallback');
                return this.generateAIRoadmap(topics, sourceText);
            }

            // Create roadmap using roadmap.io API
            const roadmapData = {
                title: `Learning Path: ${topics[0] || 'Advanced Topics'}`,
                description: `Comprehensive learning roadmap based on: ${topics.join(', ')}`,
                topics: topics,
                source_context: sourceText.substring(0, 1000),
                difficulty: 'intermediate',
                estimated_duration: '8-12 weeks'
            };

            const response = await axios.post(`${this.apiUrl}/roadmaps`, roadmapData, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return this.formatRoadmapResponse(response.data);
        } catch (error) {
            console.error('Error generating roadmap via API:', error);
            // Fallback to AI-generated roadmaps
            return this.generateAIRoadmap(topics, sourceText);
        }
    }

    async generateAIRoadmap(topics, sourceText) {
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `
        Create a comprehensive learning roadmap based on these topics: ${topics.join(', ')}
        
        Source Context: ${sourceText.substring(0, 2000)}
        
        Generate a structured roadmap with:
        1. Clear phases (Foundation, Intermediate, Advanced)
        2. Specific topics for each phase
        3. Learning objectives
        4. Estimated time for each phase
        5. Prerequisites
        6. Resources and next steps
        
        Return ONLY a valid JSON object in this format:
        {
          "title": "Learning Path Title",
          "description": "Detailed description",
          "phases": [
            {
              "name": "Foundation",
              "description": "Phase description",
              "topics": ["Topic 1", "Topic 2", "Topic 3"],
              "duration": "2-3 weeks",
              "objectives": ["Objective 1", "Objective 2"],
              "prerequisites": ["Prerequisite 1"]
            }
          ],
          "totalDuration": "8-12 weeks",
          "difficulty": "intermediate",
          "learningOutcomes": ["Outcome 1", "Outcome 2"],
          "nextSteps": ["Step 1", "Step 2"]
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let roadmapText = response.text();

            // Clean up the response
            roadmapText = roadmapText.replace(/```json\n?|\n?```/g, '').trim();

            // Parse JSON response
            const roadmapData = JSON.parse(roadmapText);

            return [roadmapData]; // Return as array to match expected format
        } catch (error) {
            console.error('Error generating AI roadmap:', error);
            return this.generateFallbackRoadmap(topics);
        }
    }

    generateFallbackRoadmap(topics) {
        return [
            {
                title: `Advanced ${topics[0] || 'Subject'} Learning Path`,
                description: `Continue your learning journey with advanced concepts related to ${topics[0] || 'the subject'}`,
                phases: [
                    {
                        name: "Foundation",
                        description: "Build fundamental understanding",
                        topics: topics.slice(0, 3),
                        duration: "2-3 weeks",
                        objectives: ["Understand basic concepts", "Build foundation knowledge"],
                        prerequisites: ["Basic understanding of core concepts"]
                    },
                    {
                        name: "Intermediate",
                        description: "Apply concepts in practical scenarios",
                        topics: topics.slice(3, 6),
                        duration: "3-4 weeks",
                        objectives: ["Apply knowledge practically", "Solve intermediate problems"],
                        prerequisites: ["Completed Foundation phase"]
                    },
                    {
                        name: "Advanced",
                        description: "Master complex applications and analysis",
                        topics: topics.slice(6, 9),
                        duration: "4-5 weeks",
                        objectives: ["Master advanced concepts", "Create complex solutions"],
                        prerequisites: ["Completed Intermediate phase"]
                    }
                ],
                totalDuration: "9-12 weeks",
                difficulty: "intermediate",
                learningOutcomes: [
                    "Master advanced concepts",
                    "Apply knowledge practically",
                    "Solve complex problems",
                    "Create innovative solutions"
                ],
                nextSteps: [
                    "Practice with real-world projects",
                    "Join study groups or communities",
                    "Teach others to reinforce learning",
                    "Explore related advanced topics"
                ]
            }
        ];
    }

    formatRoadmapResponse(apiResponse) {
        // Format the API response to match our expected structure
        return [{
            title: apiResponse.title || 'Learning Roadmap',
            description: apiResponse.description || 'A comprehensive learning path',
            phases: apiResponse.phases || [],
            totalDuration: apiResponse.estimated_duration || '8-12 weeks',
            difficulty: apiResponse.difficulty || 'intermediate',
            learningOutcomes: apiResponse.outcomes || [],
            nextSteps: apiResponse.next_steps || []
        }];
    }
}

module.exports = new RoadmapService();
