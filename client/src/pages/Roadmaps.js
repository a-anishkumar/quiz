import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Map,
    Clock,
    Users,
    Star,
    ArrowRight,
    Code,
    Database,
    Shield,
    Smartphone,
    Brain,
    CheckCircle,
    Play,
    X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Roadmaps = () => {
    const { user } = useAuth();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoadmap, setSelectedRoadmap] = useState(null);
    const [starting, setStarting] = useState(false);

    useEffect(() => {
        fetchRoadmaps();
    }, []);

    const fetchRoadmaps = async () => {
        try {
            const response = await axios.get('/api/roadmap/popular');
            setRoadmaps(response.data.roadmaps);
        } catch (error) {
            console.error('Error fetching roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const startLearningPath = async (roadmapId) => {
        try {
            setStarting(true);
            await axios.post(`/api/roadmap/${roadmapId}/follow`);
            toast.success('Learning path started!');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to start learning path';
            toast.error(msg);
        } finally {
            setStarting(false);
            setSelectedRoadmap(null);
        }
    };

    const getRoadmapIcon = (roadmapId) => {
        const icons = {
            'frontend-development': Code,
            'backend-development': Database,
            'data-science': Brain,
            'cybersecurity': Shield,
            'mobile-development': Smartphone
        };
        return icons[roadmapId] || Map;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner':
                return 'bg-green-100 text-green-800';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800';
            case 'advanced':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg p-6">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Learning Roadmaps
                    </h1>
                    <p className="text-gray-600">
                        Follow structured learning paths for popular courses and technologies
                    </p>
                </motion.div>

                {/* Roadmaps Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map((roadmap, index) => {
                        const Icon = getRoadmapIcon(roadmap.id);
                        return (
                            <motion.div
                                key={roadmap.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Icon className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(roadmap.difficulty)}`}>
                                        {roadmap.difficulty}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {roadmap.title}
                                </h3>

                                <p className="text-gray-600 mb-4 line-clamp-2">
                                    {roadmap.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{roadmap.duration}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        <span>Popular</span>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <h4 className="font-medium text-gray-900 text-sm">Key Topics:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {roadmap.topics.slice(0, 3).map((topic, topicIndex) => (
                                            <span
                                                key={topicIndex}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                            >
                                                {topic}
                                            </span>
                                        ))}
                                        {roadmap.topics.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                +{roadmap.topics.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <h4 className="font-medium text-gray-900 text-sm">Resources:</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {roadmap.resources.slice(0, 2).map((resource, resourceIndex) => (
                                            <span
                                                key={resourceIndex}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                            >
                                                {resource}
                                            </span>
                                        ))}
                                        {roadmap.resources.length > 2 && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                +{roadmap.resources.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedRoadmap(roadmap)}
                                    className="w-full btn-primary flex items-center justify-center"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Roadmap Detail Modal */}
                {selectedRoadmap && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        {(() => {
                                            const Icon = getRoadmapIcon(selectedRoadmap.id);
                                            return (
                                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-primary-600" />
                                                </div>
                                            );
                                        })()}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedRoadmap.title}
                                            </h2>
                                            <p className="text-gray-600">{selectedRoadmap.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedRoadmap(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Course Details</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-medium">{selectedRoadmap.duration}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Difficulty:</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(selectedRoadmap.difficulty)}`}>
                                                    {selectedRoadmap.difficulty}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Topics:</span>
                                                <span className="font-medium">{selectedRoadmap.topics.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Learning Path</h3>
                                        <div className="space-y-2">
                                            {selectedRoadmap.topics.slice(0, 5).map((topic, index) => (
                                                <div key={index} className="flex items-center text-sm">
                                                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-primary-600 font-medium text-xs">{index + 1}</span>
                                                    </div>
                                                    <span className="text-gray-700">{topic}</span>
                                                </div>
                                            ))}
                                            {selectedRoadmap.topics.length > 5 && (
                                                <div className="text-sm text-gray-500 ml-9">
                                                    +{selectedRoadmap.topics.length - 5} more topics
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Resources</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedRoadmap.resources.map((resource, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                            >
                                                {resource}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => startLearningPath(selectedRoadmap.id)}
                                        disabled={starting}
                                        className="btn-primary flex items-center justify-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {starting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Starting...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Learning Path
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedRoadmap(null)}
                                        className="btn-secondary flex items-center justify-center flex-1"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-primary-100 mb-6">
                        Choose a roadmap that matches your goals and start building your skills today
                    </p>
                    <Link
                        to="/"
                        className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center"
                    >
                        Upload Your Own PDF
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default Roadmaps;
