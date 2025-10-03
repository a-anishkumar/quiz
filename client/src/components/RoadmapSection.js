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
    Brain
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const RoadmapSection = () => {
    const { user } = useAuth();
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                    <div key={index} className="card animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Featured Roadmaps */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map((roadmap, index) => {
                    const Icon = getRoadmapIcon(roadmap.id);
                    return (
                        <motion.div
                            key={roadmap.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="card hover:shadow-lg transition-shadow duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <Icon className="w-6 h-6 text-primary-600" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(roadmap.difficulty)}`}>
                                    {roadmap.difficulty}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {roadmap.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-2">
                                {roadmap.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{roadmap.duration}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Users className="w-4 h-4" />
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

                            {user ? (
                                <Link
                                    to={`/roadmaps/${roadmap.id}`}
                                    className="w-full btn-primary flex items-center justify-center group-hover:bg-primary-700 transition-colors"
                                >
                                    Start Learning
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            ) : (
                                <Link
                                    to="/register"
                                    className="w-full btn-primary flex items-center justify-center group-hover:bg-primary-700 transition-colors"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Call to Action */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white"
            >
                <div className="max-w-2xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Ready to Start Your Learning Journey?
                    </h3>
                    <p className="text-primary-100 mb-6">
                        Choose from our curated roadmaps or upload your own PDF to create a personalized learning experience
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link
                                to="/roadmaps"
                                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                            >
                                Explore All Roadmaps
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                                >
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                                <Link
                                    to="/roadmaps"
                                    className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center justify-center"
                                >
                                    Browse Roadmaps
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">5+</div>
                    <div className="text-gray-600">Learning Paths</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                    <div className="text-gray-600">Topics Covered</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
                    <div className="text-gray-600">Learning Hours</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
                    <div className="text-gray-600">Available</div>
                </div>
            </motion.div>
        </div>
    );
};

export default RoadmapSection;
