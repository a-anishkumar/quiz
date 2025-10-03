import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Target, 
  Brain,
  BookOpen,
  CheckCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const LearningModule = () => {
    const { courseId, moduleId } = useParams();
    const { user } = useAuth();
    const [module, setModule] = useState(null);
    const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSimplified, setShowSimplified] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

    useEffect(() => {
        fetchModule();
    }, [courseId, moduleId]);

    const fetchModule = async () => {
        try {
            const [moduleResponse, courseResponse] = await Promise.all([
                axios.get(`/api/courses/${courseId}/modules/${moduleId}`),
                axios.get(`/api/courses/${courseId}`)
            ]);

            setModule(moduleResponse.data);
            setCourse(courseResponse.data);
        } catch (error) {
            console.error('Error fetching module:', error);
            toast.error('Failed to load module');
        } finally {
            setLoading(false);
        }
    };

  const generateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      await axios.post(`/api/quiz/${courseId}/modules/${moduleId}/generate`);
      toast.success('Quiz generated successfully!');
      
      // Navigate to quiz
      window.location.href = `/course/${courseId}/quiz/${moduleId}`;
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      await axios.put(`/api/courses/${courseId}/progress`, {
        moduleId: parseInt(moduleId),
        completed: true
      });
      
      toast.success('Module completed!');
      
      // Navigate to next module or quiz
      const nextModuleId = parseInt(moduleId) + 1;
      if (nextModuleId <= course.totalModules) {
        window.location.href = `/course/${courseId}/module/${nextModuleId}`;
      } else {
        window.location.href = `/course/${courseId}/quiz/${moduleId}`;
      }
    } catch (error) {
      console.error('Error marking module as completed:', error);
      toast.error('Failed to update progress');
    }
  };

    const getCurrentContent = () => {
        if (showSimplified && module.simplifiedContent) {
            return module.simplifiedContent;
        }
        return module.content;
    };

    const getNextModuleId = () => {
        const currentModuleId = parseInt(moduleId);
        return currentModuleId + 1;
    };

    const getPreviousModuleId = () => {
        const currentModuleId = parseInt(moduleId);
        return currentModuleId - 1;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="bg-white rounded-lg p-8">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Module not found</h2>
                        <Link to={`/course/${courseId}`} className="btn-primary">
                            Back to Course
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
                        to={`/course/${courseId}`}
                        className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </Link>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {module.title}
                                </h1>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>{module.estimatedTime} minutes</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Target className="w-4 h-4 mr-1" />
                                        <span className="capitalize">{module.difficulty}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <BookOpen className="w-4 h-4 mr-1" />
                                        <span>Module {module.order}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                <Brain className="w-6 h-6 text-primary-600" />
                            </div>
                        </div>

                        {/* Simplified Content Toggle */}
                        {module.simplifiedContent && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                                        <div>
                                            <h4 className="font-medium text-blue-900">
                                                Simplified content available
                                            </h4>
                                            <p className="text-sm text-blue-700">
                                                Switch to simplified content for easier understanding
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSimplified(!showSimplified)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showSimplified
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                                            }`}
                                    >
                                        {showSimplified ? 'Show Original' : 'Show Simplified'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        {getCurrentContent() && getCurrentContent().length > 0 ? (
                            <div className="prose prose-lg max-w-none">
                                <div 
                                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                                    style={{ 
                                        lineHeight: '1.8',
                                        fontSize: '16px'
                                    }}
                                >
                                    {getCurrentContent()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No content available</h3>
                                <p className="text-gray-600 mb-4">
                                    This module doesn't have content yet. Please regenerate the modules.
                                </p>
                                <Link
                                  to={`/course/${courseId}`}
                                  className="btn-primary"
                                >
                                  Back to Course
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex items-center justify-between"
                >
                    {/* Previous Module */}
                    <div>
                        {getPreviousModuleId() > 0 ? (
                            <Link
                                to={`/course/${courseId}/module/${getPreviousModuleId()}`}
                                className="btn-secondary flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Previous Module
                            </Link>
                        ) : (
                            <Link
                                to={`/course/${courseId}`}
                                className="btn-secondary flex items-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Course
                            </Link>
                        )}
                    </div>

          {/* Quiz and Complete Module */}
          <div className="flex space-x-4">
            <button
              onClick={generateQuiz}
              disabled={generatingQuiz}
              className="btn-secondary flex items-center"
            >
              {generatingQuiz ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Take Quiz
                </>
              )}
            </button>
            
            <button
              onClick={markAsCompleted}
              className="btn-primary flex items-center"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Complete
            </button>
          </div>

                    {/* Next Module or Quiz */}
                    <div>
                        {getNextModuleId() <= course.totalModules ? (
                            <Link
                                to={`/course/${courseId}/module/${getNextModuleId()}`}
                                className="btn-primary flex items-center"
                            >
                                Next Module
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        ) : (
                            <Link
                                to={`/course/${courseId}/quiz/${moduleId}`}
                                className="btn-primary flex items-center"
                            >
                                Take Quiz
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8 bg-white rounded-lg shadow-sm p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Module {module.order} of {course.totalModules}</span>
                            <span className="text-gray-900 font-medium">
                                {Math.round((module.order / course.totalModules) * 100)}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(module.order / course.totalModules) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LearningModule;
