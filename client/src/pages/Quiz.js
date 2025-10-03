import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Brain,
    RotateCcw,
    Trophy,
    AlertCircle,
    Target
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Quiz = () => {
    const { courseId, moduleId } = useParams();
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
    }, [courseId, moduleId]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !submitted) {
            handleSubmit();
        }
    }, [timeLeft, submitted]);

    const fetchQuiz = async () => {
        try {
            const response = await axios.get(`/api/quiz/${courseId}/modules/${moduleId}`);
            const quizData = response.data.quiz;

            if (quizData && quizData.questions && Array.isArray(quizData.questions)) {
                setQuiz(quizData);
                setAnswers(new Array(quizData.questions.length).fill(null));
            } else {
                throw new Error('Invalid quiz data received');
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            toast.error('Failed to load quiz. Please generate the quiz first.');
            setQuiz(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionIndex, answerIndex) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = answerIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (submitted) return;

        setSubmitting(true);
        try {
            const response = await axios.post(`/api/quiz/${courseId}/modules/${moduleId}/submit`, {
                answers: answers
            });

            setResults(response.data.results);
            setSubmitted(true);

            if (response.data.results.passed) {
                toast.success('Congratulations! You passed the quiz!');
            } else {
                toast.error('Quiz not passed. Review the material and try again.');
            }
        } catch (error) {
            console.error('Error submitting quiz:', error);
            toast.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const retakeQuiz = () => {
        setSubmitted(false);
        setResults(null);
        setAnswers(new Array(quiz.questions.length).fill(null));
        setCurrentQuestion(0);
        setTimeLeft(600);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
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

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not available</h2>
                        <p className="text-gray-600 mb-6">
                            The quiz for this module hasn't been generated yet. Please generate the quiz first.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={`/course/${courseId}/module/${moduleId}`} className="btn-primary">
                                Back to Module
                            </Link>
                            <Link to={`/course/${courseId}`} className="btn-secondary">
                                Back to Course
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (submitted && results) {
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

                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${results.passed ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                {results.passed ? (
                                    <Trophy className="w-10 h-10 text-green-600" />
                                ) : (
                                    <XCircle className="w-10 h-10 text-red-600" />
                                )}
                            </div>

                            <h1 className={`text-3xl font-bold mb-4 ${results.passed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {results.passed ? 'Congratulations!' : 'Try Again'}
                            </h1>

                            <p className="text-gray-600 mb-6">
                                {results.passed
                                    ? 'You have successfully completed this module quiz!'
                                    : 'You need to score at least 70% to pass. Review the material and try again.'
                                }
                            </p>

                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>
                                            {results.score}%
                                        </div>
                                        <div className="text-sm text-gray-600">Score</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {results.correctAnswers}
                                        </div>
                                        <div className="text-sm text-gray-600">Correct</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-gray-900">
                                            {results.totalQuestions}
                                        </div>
                                        <div className="text-sm text-gray-600">Total</div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Feedback */}
                            {results.feedback && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <Brain className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                                        <div className="text-left">
                                            <h4 className="font-medium text-blue-900 mb-1">AI Feedback</h4>
                                            <p className="text-sm text-blue-800">{results.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Simplified Content */}
                            {!results.passed && results.simplifiedContent && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                                        <div className="text-left">
                                            <h4 className="font-medium text-yellow-900 mb-1">Simplified Content Available</h4>
                                            <p className="text-sm text-yellow-800 mb-3">
                                                We've generated simplified content to help you understand better.
                                            </p>
                                            <div className="bg-white rounded p-3 text-sm text-gray-800">
                                                {results.simplifiedContent}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {!results.passed && (
                                    <button
                                        onClick={retakeQuiz}
                                        className="btn-primary flex items-center justify-center"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Retake Quiz
                                    </button>
                                )}

                                <Link
                                    to={`/course/${courseId}`}
                                    className="btn-secondary flex items-center justify-center"
                                >
                                    Back to Course
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Question Results */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-4"
                    >
                        <h2 className="text-xl font-bold text-gray-900">Question Review</h2>

                        {results.results && results.results.map((result, index) => (
                            <div
                                key={index}
                                className={`border rounded-lg p-6 ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-medium text-gray-900">
                                        Question {index + 1}
                                    </h3>
                                    {result.isCorrect ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                </div>

                                <p className="text-gray-800 mb-4">{result.question}</p>

                                <div className="space-y-2 mb-4">
                                    {result.options && result.options.map((option, optionIndex) => (
                                        <div
                                            key={optionIndex}
                                            className={`p-3 rounded-lg ${optionIndex === result.correctAnswer
                                                ? 'bg-green-100 border border-green-300'
                                                : optionIndex === result.userAnswer && !result.isCorrect
                                                    ? 'bg-red-100 border border-red-300'
                                                    : 'bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="font-medium mr-2">
                                                    {String.fromCharCode(65 + optionIndex)}.
                                                </span>
                                                <span>{option}</span>
                                                {optionIndex === result.correctAnswer && (
                                                    <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                                                )}
                                                {optionIndex === result.userAnswer && !result.isCorrect && (
                                                    <XCircle className="w-4 h-4 text-red-600 ml-2" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {result.explanation && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
                                        <p className="text-sm text-blue-800">{result.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>
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
                                    Module Quiz
                                </h1>
                                <p className="text-gray-600">
                                    Test your understanding of the module content
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>Time remaining: {formatTime(timeLeft)}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Question {currentQuestion + 1} of {quiz.questions ? quiz.questions.length : 0}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${quiz.questions ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0}%` }}
                            ></div>
                        </div>
                    </div>
                </motion.div>

                {/* Question */}
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {quiz.questions && quiz.questions[currentQuestion] ? quiz.questions[currentQuestion].question : 'Loading question...'}
                        </h2>

                        <div className="space-y-3">
                            {quiz.questions && quiz.questions[currentQuestion] && quiz.questions[currentQuestion].options && quiz.questions[currentQuestion].options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleAnswerSelect(currentQuestion, index)}
                                    className={`w-full p-4 text-left border rounded-lg transition-colors ${answers[currentQuestion] === index
                                        ? 'border-primary-500 bg-primary-50 text-primary-900'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <span className="font-medium mr-3">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <span>{option}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Navigation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex items-center justify-between"
                >
                    <button
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                        className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                    </button>

                    <div className="flex space-x-2">
                        {quiz.questions && quiz.questions.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentQuestion(index)}
                                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === currentQuestion
                                    ? 'bg-primary-600 text-white'
                                    : answers[index] !== null
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {quiz.questions && currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting || !quiz.questions || answers.some(answer => answer === null)}
                            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Quiz
                                    <CheckCircle className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(Math.min((quiz.questions ? quiz.questions.length - 1 : 0), currentQuestion + 1))}
                            className="btn-primary flex items-center"
                        >
                            Next
                            <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Quiz;
