import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Target,
    Play,
    CheckCircle,
    Lock,
    Brain,
    FileText,
    Award,
    Map,
    Download,
    Sparkles
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generatingModules, setGeneratingModules] = useState(false);
    const [relatedRoadmaps, setRelatedRoadmaps] = useState([]);
    const [loadingRoadmaps, setLoadingRoadmaps] = useState(false);
    const [generatingCertificate, setGeneratingCertificate] = useState(false);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            const response = await axios.get(`/api/courses/${courseId}`);
            setCourse(response.data);
        } catch (error) {
            console.error('Error fetching course:', error);
            toast.error('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const generateModules = async () => {
        setGeneratingModules(true);
        try {
            await axios.post(`/api/courses/${courseId}/generate-modules`);
            toast.success('Learning modules generated successfully!');
            fetchCourse(); // Refresh course data
        } catch (error) {
            console.error('Error generating modules:', error);
            toast.error('Failed to generate modules');
        } finally {
            setGeneratingModules(false);
        }
    };

    const regenerateFromPdf = async () => {
        setGeneratingModules(true);
        try {
            await axios.post(`/api/courses/${courseId}/regenerate`);
            toast.success('Regenerated from PDF successfully');
            fetchCourse();
        } catch (error) {
            console.error('Error regenerating course:', error);
            toast.error(error.response?.data?.message || 'Failed to regenerate from PDF');
        } finally {
            setGeneratingModules(false);
        }
    };

    const fetchRelatedRoadmaps = async () => {
        setLoadingRoadmaps(true);
        try {
            const response = await axios.get(`/api/courses/${courseId}/related-roadmaps`);
            setRelatedRoadmaps(response.data.roadmaps);
        } catch (error) {
            console.error('Error fetching related roadmaps:', error);
            toast.error('Failed to load related roadmaps');
        } finally {
            setLoadingRoadmaps(false);
        }
    };

    const generateCertificate = async () => {
        setGeneratingCertificate(true);
        try {
            const response = await axios.post(`/api/quiz/${courseId}/auto-certificate`);
            toast.success('Certificate generated successfully!');
            // Optionally redirect to certificates page or show download link
        } catch (error) {
            console.error('Error generating certificate:', error);
            toast.error(error.response?.data?.message || 'Failed to generate certificate');
        } finally {
            setGeneratingCertificate(false);
        }
    };

    const isCourseCompleted = () => {
        return user?.completedCourses?.some(c => c.courseId === courseId);
    };

    const getModuleStatus = (moduleOrder) => {
        const progress = user?.currentProgress?.find(p => p.courseId === courseId);

        // If no progress exists, first module should be available
        if (!progress) {
            return moduleOrder === 1 ? 'available' : 'locked';
        }

        const isCompleted = progress.completedModules?.includes(moduleOrder);
        const isCurrent = progress.currentModule === moduleOrder;

        if (isCompleted) return 'completed';
        if (isCurrent) return 'current';
        if (moduleOrder <= progress.currentModule) return 'available';
        return 'locked';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'current':
                return <Play className="w-5 h-5 text-blue-600" />;
            case 'available':
                return <Play className="w-5 h-5 text-gray-600" />;
            default:
                return <Lock className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'current':
                return 'bg-blue-50 border-blue-200';
            case 'available':
                return 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer';
            default:
                return 'bg-gray-50 border-gray-200 opacity-60';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="bg-white rounded-lg p-8">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
                        <Link to="/dashboard" className="btn-primary">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>

                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {course.title}
                                </h1>
                                <p className="text-gray-600 mb-4">
                                    {course.description}
                                </p>

                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-2" />
                                        <span>{course.estimatedDuration} hours</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        <span>{course.totalModules} modules</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Target className="w-4 h-4 mr-2" />
                                        <span className="capitalize">{course.level}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-8 h-8 text-primary-600" />
                            </div>
                        </div>

                        {/* Course Topics */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Topics</h3>
                            <div className="flex flex-wrap gap-2">
                                {course.extractedTopics?.map((topic, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                                    >
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Generate Modules Button */}
                        {course.modules?.length === 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-1">
                                            Ready to start learning?
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            Generate personalized learning modules from your PDF content
                                        </p>
                                    </div>
                                    <button
                                        onClick={generateModules}
                                        disabled={generatingModules}
                                        className="btn-primary flex items-center"
                                    >
                                        {generatingModules ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Brain className="w-4 h-4 mr-2" />
                                                Generate Modules
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Regenerate from PDF */}
                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-700">
                                    Not aligned with your PDF? Regenerate topics and modules directly from the uploaded PDF text.
                                </p>
                                <button
                                    onClick={regenerateFromPdf}
                                    disabled={generatingModules}
                                    className="btn-secondary"
                                >
                                    Regenerate from PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Modules Section */}
                {course.modules?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Modules</h2>

                        <div className="space-y-4">
                            {course.modules.map((module, index) => {
                                const status = getModuleStatus(module.order);
                                const isClickable = status !== 'locked';

                                return (
                                    <motion.div
                                        key={module._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 * index }}
                                        className={`border rounded-lg p-6 transition-all duration-200 ${getStatusColor(status)} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    {getStatusIcon(status)}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <span className="text-sm font-medium text-gray-500">
                                                            Module {module.order}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            status === 'current' ? 'bg-blue-100 text-blue-800' :
                                                                status === 'available' ? 'bg-gray-100 text-gray-800' :
                                                                    'bg-gray-100 text-gray-500'
                                                            }`}>
                                                            {status === 'completed' ? 'Completed' :
                                                                status === 'current' ? 'Current' :
                                                                    status === 'available' ? 'Start' : 'Locked'}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                        {module.title}
                                                    </h3>

                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            <span>{module.estimatedTime} min</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Target className="w-4 h-4 mr-1" />
                                                            <span className="capitalize">{module.difficulty}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {isClickable && (
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/course/${courseId}/module/${module.order}`}
                                                        className="btn-primary flex items-center"
                                                    >
                                                        {status === 'completed' ? 'Review' :
                                                            status === 'current' ? 'Continue' : 'Start'}
                                                        <Play className="w-4 h-4 ml-2" />
                                                    </Link>

                                                    {status === 'completed' && (
                                                        <Link
                                                            to={`/course/${courseId}/quiz/${module.order}`}
                                                            className="btn-secondary flex items-center"
                                                        >
                                                            Quiz
                                                            <Target className="w-4 h-4 ml-2" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Final Exam Section */}
                {course.finalQuiz && course.finalQuiz.questions?.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Final Exam
                                    </h3>
                                    <p className="text-gray-600">
                                        Complete all modules to unlock the final exam and earn your certificate
                                    </p>
                                </div>
                            </div>

                            <button className="btn-primary flex items-center">
                                Take Final Exam
                                <Award className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Certificate Generation Section */}
                {isCourseCompleted() && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm p-6 mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Course Completed! 🎉
                                    </h3>
                                    <p className="text-gray-600">
                                        Congratulations! You've completed this course. Generate your certificate now.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={generateCertificate}
                                disabled={generatingCertificate}
                                className="btn-primary flex items-center"
                            >
                                {generatingCertificate ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Generate Certificate
                                        <Download className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Related Roadmaps Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white rounded-lg shadow-sm p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Map className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Continue Your Learning Journey
                                </h3>
                                <p className="text-gray-600">
                                    Explore related roadmaps based on your course content
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={fetchRelatedRoadmaps}
                            disabled={loadingRoadmaps}
                            className="btn-secondary flex items-center"
                        >
                            {loadingRoadmaps ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate Roadmaps
                                </>
                            )}
                        </button>
                    </div>

                    {relatedRoadmaps.length > 0 && (
                        <div className="space-y-6">
                            {relatedRoadmaps.map((roadmap, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 * index }}
                                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-purple-50"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{roadmap.title}</h4>
                                            <p className="text-gray-600 mb-4">{roadmap.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                <span>{roadmap.totalDuration}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Target className="w-4 h-4 mr-1" />
                                                <span className="capitalize">{roadmap.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Learning Phases */}
                                    <div className="mb-4">
                                        <h5 className="text-lg font-medium text-gray-700 mb-3">Learning Phases:</h5>
                                        <div className="space-y-3">
                                            {roadmap.phases.map((phase, phaseIndex) => (
                                                <div key={phaseIndex} className="bg-white rounded-lg p-4 border border-gray-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h6 className="font-medium text-gray-900">{phase.name}</h6>
                                                        <span className="text-sm text-gray-500">{phase.duration}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{phase.description}</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {phase.topics.map((topic, topicIndex) => (
                                                            <span key={topicIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                {topic}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Learning Outcomes */}
                                    {roadmap.learningOutcomes && roadmap.learningOutcomes.length > 0 && (
                                        <div className="mb-4">
                                            <h5 className="text-lg font-medium text-gray-700 mb-2">Learning Outcomes:</h5>
                                            <ul className="list-disc list-inside space-y-1">
                                                {roadmap.learningOutcomes.map((outcome, outcomeIndex) => (
                                                    <li key={outcomeIndex} className="text-sm text-gray-600">{outcome}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Next Steps */}
                                    {roadmap.nextSteps && roadmap.nextSteps.length > 0 && (
                                        <div>
                                            <h5 className="text-lg font-medium text-gray-700 mb-2">Next Steps:</h5>
                                            <ul className="list-disc list-inside space-y-1">
                                                {roadmap.nextSteps.map((step, stepIndex) => (
                                                    <li key={stepIndex} className="text-sm text-gray-600">{step}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {relatedRoadmaps.length === 0 && !loadingRoadmaps && (
                        <div className="text-center py-8">
                            <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Click "Generate Roadmaps" to discover related learning paths</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default CourseDetail;
