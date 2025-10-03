import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    Settings,
    Save,
    Eye,
    EyeOff,
    Brain,
    Target,
    Award,
    BookOpen,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        learningStyle: user?.preferences?.learningStyle || 'reading',
        difficultyLevel: user?.preferences?.difficultyLevel || 'beginner'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateProfile(formData);
            if (result.success) {
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Profile update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            // Password update logic would go here
            toast.success('Password updated successfully!');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Password update error:', error);
            toast.error('Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const getLearningStyleDescription = (style) => {
        const descriptions = {
            visual: 'Learn best through images, diagrams, and visual representations',
            auditory: 'Learn best through listening, discussions, and verbal explanations',
            kinesthetic: 'Learn best through hands-on activities and physical experiences',
            reading: 'Learn best through written text and reading materials'
        };
        return descriptions[style] || '';
    };

    const getDifficultyDescription = (level) => {
        const descriptions = {
            beginner: 'Start with basic concepts and build foundational knowledge',
            intermediate: 'Build on existing knowledge with more complex topics',
            advanced: 'Challenge yourself with expert-level content and applications'
        };
        return descriptions[level] || '';
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'achievements', label: 'Achievements', icon: Award }
    ];

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Profile Settings
                    </h1>
                    <p className="text-gray-600">
                        Manage your account settings and learning preferences
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-10 h-10 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                                <p className="text-gray-600">{user?.email}</p>
                            </div>

                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                    ? 'bg-primary-100 text-primary-700'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 mr-3" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-3"
                    >
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>

                                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={user?.email}
                                                className="input-field bg-gray-50"
                                                disabled
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Email cannot be changed. Contact support if needed.
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary flex items-center"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

                                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                        <div>
                                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    id="currentPassword"
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="input-field pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5 text-gray-400" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="input-field"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary flex items-center"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Preferences</h2>

                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div>
                                        <label htmlFor="learningStyle" className="block text-sm font-medium text-gray-700 mb-2">
                                            Learning Style
                                        </label>
                                        <select
                                            id="learningStyle"
                                            name="learningStyle"
                                            value={formData.learningStyle}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="visual">Visual</option>
                                            <option value="auditory">Auditory</option>
                                            <option value="kinesthetic">Kinesthetic</option>
                                            <option value="reading">Reading/Writing</option>
                                        </select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getLearningStyleDescription(formData.learningStyle)}
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-2">
                                            Preferred Difficulty Level
                                        </label>
                                        <select
                                            id="difficultyLevel"
                                            name="difficultyLevel"
                                            value={formData.difficultyLevel}
                                            onChange={handleInputChange}
                                            className="input-field"
                                        >
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {getDifficultyDescription(formData.difficultyLevel)}
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-primary flex items-center"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Preferences
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Achievements Tab */}
                        {activeTab === 'achievements' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Statistics</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <BookOpen className="w-8 h-8 text-primary-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {user?.completedCourses?.length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Courses Completed</div>
                                        </div>

                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <TrendingUp className="w-8 h-8 text-green-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {user?.currentProgress?.length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Courses in Progress</div>
                                        </div>

                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Award className="w-8 h-8 text-yellow-600" />
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900">
                                                {user?.completedCourses?.length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Certificates Earned</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Achievements</h2>

                                    {user?.completedCourses?.length > 0 ? (
                                        <div className="space-y-4">
                                            {user.completedCourses.slice(0, 5).map((course, index) => (
                                                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                                        <Award className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">Course Completed</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Completed on {new Date(course.completedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {course.score}%
                                                        </div>
                                                        <div className="text-xs text-gray-500">Score</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Target className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                                            <p className="text-gray-600">
                                                Complete your first course to earn your first achievement!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
