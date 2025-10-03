const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const RoadmapProgress = require('../models/RoadmapProgress');

const router = express.Router();

// In-memory demo roadmaps (acts as a simple data source)
const sampleRoadmaps = [
  {
    id: 'frontend-development',
    title: 'Frontend Development',
    description: 'Complete roadmap for becoming a frontend developer',
    duration: '6-12 months',
    difficulty: 'Beginner to Intermediate',
    topics: [
      'HTML & CSS Fundamentals',
      'JavaScript Basics',
      'Responsive Design',
      'CSS Frameworks (Bootstrap, Tailwind)',
      'JavaScript ES6+',
      'DOM Manipulation',
      'React.js',
      'State Management',
      'API Integration',
      'Testing',
      'Build Tools',
      'Deployment'
    ],
    resources: [
      'MDN Web Docs',
      'FreeCodeCamp',
      'React Documentation',
      'CSS Tricks'
    ]
  },
  {
    id: 'backend-development',
    title: 'Backend Development',
    description: 'Learn server-side development and APIs',
    duration: '8-12 months',
    difficulty: 'Intermediate to Advanced',
    topics: [
      'Programming Language (Node.js/Python/Java)',
      'Database Design',
      'SQL & NoSQL',
      'API Design',
      'Authentication & Authorization',
      'Server Architecture',
      'Cloud Services',
      'DevOps Basics',
      'Testing',
      'Security',
      'Performance Optimization',
      'Microservices'
    ],
    resources: [
      'Node.js Documentation',
      'MongoDB University',
      'AWS Documentation',
      'Docker Documentation'
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'Complete data science learning path',
    duration: '12-18 months',
    difficulty: 'Intermediate to Advanced',
    topics: [
      'Mathematics & Statistics',
      'Python Programming',
      'Data Manipulation (Pandas)',
      'Data Visualization',
      'Machine Learning',
      'Deep Learning',
      'SQL for Data Analysis',
      'Big Data Tools',
      'Data Engineering',
      'Model Deployment',
      'A/B Testing',
      'Business Intelligence'
    ],
    resources: [
      'Kaggle Learn',
      'Coursera ML Course',
      'Python Data Science Handbook',
      'TensorFlow Documentation'
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Learn to protect systems and data',
    duration: '10-15 months',
    difficulty: 'Intermediate to Advanced',
    topics: [
      'Network Security',
      'Operating System Security',
      'Cryptography',
      'Web Application Security',
      'Penetration Testing',
      'Incident Response',
      'Risk Management',
      'Compliance & Regulations',
      'Security Tools',
      'Ethical Hacking',
      'Digital Forensics',
      'Security Architecture'
    ],
    resources: [
      'OWASP',
      'NIST Cybersecurity Framework',
      'SANS Training',
      'Cybrary'
    ]
  },
  {
    id: 'mobile-development',
    title: 'Mobile Development',
    description: 'Build mobile applications for iOS and Android',
    duration: '8-12 months',
    difficulty: 'Beginner to Intermediate',
    topics: [
      'Programming Fundamentals',
      'Mobile UI/UX Design',
      'Native Development (Swift/Kotlin)',
      'Cross-platform Development',
      'React Native/Flutter',
      'Mobile APIs',
      'App Store Guidelines',
      'Performance Optimization',
      'Testing',
      'Deployment',
      'Push Notifications',
      'Analytics'
    ],
    resources: [
      'Apple Developer Documentation',
      'Android Developer Guide',
      'React Native Documentation',
      'Flutter Documentation'
    ]
  }
];

// Get popular roadmaps
router.get('/popular', async (req, res) => {
  try {
    res.json({
      message: 'Popular roadmaps retrieved successfully',
      roadmaps: sampleRoadmaps
    });
  } catch (error) {
    console.error('Get roadmaps error:', error);
    res.status(500).json({ message: 'Failed to get roadmaps' });
  }
});

// Get specific roadmap details
router.get('/:roadmapId', async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    // Build details for the requested roadmap id from our sample list
    const summary = sampleRoadmaps.find(r => r.id === roadmapId);
    if (!summary) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Simple generated learning path from topics
    const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
    const topicGroups = chunk(summary.topics, 2);
    const learningPath = topicGroups.map((group, idx) => ({
      phase: idx === 0 ? 'Foundation' : idx === 1 ? 'Intermediate' : 'Advanced',
      duration: idx === 0 ? '2-3 months' : idx === 1 ? '3-4 months' : '2-3 months',
      topics: group.map(t => ({
        title: t,
        description: `Learn ${t} with curated resources and hands-on practice`,
        resources: summary.resources.slice(0, 2),
        estimatedTime: '30-60 hours'
      }))
    }));

    const roadmap = {
      id: summary.id,
      title: summary.title,
      description: summary.description,
      duration: summary.duration,
      difficulty: summary.difficulty,
      prerequisites: ['Basic computer skills', 'Consistent study schedule'],
      learningPath,
      careerOpportunities: [
        `${summary.title} Engineer/Developer`,
        `${summary.title.split(' ')[0]} Specialist`
      ],
      averageSalary: 'Varies by region and experience'
    };

    res.json({ message: 'Roadmap details retrieved successfully', roadmap });
  } catch (error) {
    console.error('Get roadmap details error:', error);
    res.status(500).json({ message: 'Failed to get roadmap details' });
  }
});

// Get user's roadmap progress (if they're following a roadmap)
router.get('/:roadmapId/progress', auth, async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    let progress = await RoadmapProgress.findOne({ userId: req.userId, roadmapId });
    if (!progress) {
      progress = await RoadmapProgress.create({ userId: req.userId, roadmapId });
    }
    res.json({ message: 'Roadmap progress retrieved successfully', progress });
  } catch (error) {
    console.error('Get roadmap progress error:', error);
    res.status(500).json({ message: 'Failed to get roadmap progress' });
  }
});

// Update roadmap progress
router.put('/:roadmapId/progress', auth, async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    const { completedTopic, currentPhase } = req.body;
    const progress = await RoadmapProgress.findOneAndUpdate(
      { userId: req.userId, roadmapId },
      {
        $set: { currentPhase: currentPhase || 'Foundation', updatedAt: new Date() },
        ...(completedTopic ? { $addToSet: { completedTopics: completedTopic } } : {})
      },
      { new: true, upsert: true }
    );

    // recompute percent
    const roadmap = sampleRoadmaps.find(r => r.id === roadmapId);
    const totalTopics = roadmap ? roadmap.topics.length : Math.max(progress.completedTopics.length, 1);
    const percent = Math.min(100, Math.round((progress.completedTopics.length / totalTopics) * 100));
    progress.percentComplete = percent;
    await progress.save();

    res.json({ message: 'Roadmap progress updated successfully', progress });
  } catch (error) {
    console.error('Update roadmap progress error:', error);
    res.status(500).json({ message: 'Failed to update roadmap progress' });
  }
});

// Follow (start) a roadmap
router.post('/:roadmapId/follow', auth, async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    let progress = await RoadmapProgress.findOne({ userId: req.userId, roadmapId });
    if (!progress) {
      progress = await RoadmapProgress.create({ userId: req.userId, roadmapId });
    }
    res.json({ message: 'Roadmap followed successfully', progress });
  } catch (error) {
    console.error('Follow roadmap error:', error);
    res.status(500).json({ message: 'Failed to follow roadmap' });
  }
});

// Unfollow a roadmap
router.delete('/:roadmapId/follow', auth, async (req, res) => {
  try {
    const roadmapId = req.params.roadmapId;
    await RoadmapProgress.deleteOne({ userId: req.userId, roadmapId });
    res.json({ message: 'Roadmap unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow roadmap error:', error);
    res.status(500).json({ message: 'Failed to unfollow roadmap' });
  }
});

module.exports = router;
