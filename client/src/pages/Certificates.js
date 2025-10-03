import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Download, 
  Eye, 
  Calendar,
  Trophy,
  Star,
  Share2,
  FileText,
  ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Certificates = () => {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const response = await axios.get('/api/certificate/my-certificates');
            setCertificates(response.data.certificates);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            toast.error('Failed to load certificates');
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async (courseId) => {
        try {
            const response = await axios.get(`/api/certificate/download/${courseId}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `certificate-${courseId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Certificate downloaded successfully!');
        } catch (error) {
            console.error('Error downloading certificate:', error);
            toast.error('Failed to download certificate');
        }
    };

    const shareCertificate = async (courseId) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Learning Certificate',
                    text: 'Check out my certificate from Qizz E-Learning Platform!',
                    url: window.location.origin
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success('Link copied to clipboard!');
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                toast.error('Failed to copy link');
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        My Certificates
                    </h1>
                    <p className="text-gray-600">
                        Your achievements and learning milestones
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Average Score</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {certificates.length > 0
                                        ? Math.round(certificates.reduce((sum, cert) => sum + cert.score, 0) / certificates.length)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Latest Achievement</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {certificates.length > 0
                                        ? formatDate(certificates[0].completedAt).split(' ')[1]
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-12"
                    >
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No certificates yet</h3>
                        <p className="text-gray-600 mb-6">
                            Complete courses and pass final exams to earn your first certificate
                        </p>
                        <a href="/dashboard" className="btn-primary">
                            Browse Courses
                        </a>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((certificate, index) => (
                            <motion.div
                                key={certificate.courseId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {certificate.score}%
                                        </div>
                                        <div className="text-xs text-gray-500">Score</div>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {certificate.courseTitle}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        <span>Completed on {formatDate(certificate.completedAt)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FileText className="w-4 h-4 mr-2" />
                                        <span>Certificate ID: QIZZ-{certificate.courseId.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => downloadCertificate(certificate.courseId)}
                                        className="flex-1 btn-primary flex items-center justify-center text-sm"
                                    >
                                        <Download className="w-4 h-4 mr-1" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => shareCertificate(certificate.courseId)}
                                        className="btn-secondary flex items-center justify-center text-sm px-3"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Achievement Badges */}
                {certificates.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-12 bg-white rounded-lg shadow-sm p-6"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Achievement Badges</h2>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {certificates.length >= 1 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Trophy className="w-8 h-8 text-green-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">First Certificate</p>
                                </div>
                            )}

                            {certificates.length >= 3 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Star className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Learning Streak</p>
                                </div>
                            )}

                            {certificates.length >= 5 && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Award className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">Expert Learner</p>
                                </div>
                            )}

                            {certificates.some(cert => cert.score >= 90) && (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Star className="w-8 h-8 text-yellow-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">High Achiever</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center text-white"
                >
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Continue Your Learning Journey
                    </h2>
                    <p className="text-primary-100 mb-6">
                        Earn more certificates by completing additional courses and expanding your knowledge
                    </p>
                    <a
                        href="/dashboard"
                        className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-flex items-center"
                    >
                        Browse More Courses
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </a>
                </motion.div>
            </div>
        </div>
    );
};

export default Certificates;
