import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PDFUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [courseCreated, setCourseCreated] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploadedFile(file);
        await uploadFile(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        multiple: false
    });

    const uploadFile = async (file) => {
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await axios.post('/api/courses/create-from-pdf', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { course } = response.data;
            setCourseCreated(course);

            toast.success('Course created successfully!');

            // Generate modules after a short delay
            setTimeout(async () => {
                try {
                    await axios.post(`/api/courses/${course.id}/generate-modules`);
                    toast.success('Learning modules generated!');
                } catch (error) {
                    console.error('Module generation error:', error);
                    toast.error('Failed to generate modules');
                }
            }, 2000);

        } catch (error) {
            console.error('Upload error:', error);
            const message = error.response?.data?.message || 'Upload failed';
            toast.error(message);
            setUploadedFile(null);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        setCourseCreated(null);
    };

    return (
        <div className="space-y-4">
            {!uploadedFile ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    {...getRootProps()}
                    className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        }
          `}
                >
                    <input {...getInputProps()} />

                    <div className="space-y-4">
                        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-600" />
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {isDragActive ? 'Drop your PDF here' : 'Upload PDF Textbook'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Drag and drop your PDF file here, or click to browse
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports PDF files up to 10MB
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    {/* File Info */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>

                            {!uploading && (
                                <button
                                    onClick={removeFile}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <div>
                                    <p className="font-medium text-blue-900">Processing your PDF...</p>
                                    <p className="text-sm text-blue-700">
                                        Extracting topics and generating course content
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Course Created */}
                    {courseCreated && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-green-50 border border-green-200 rounded-lg p-4"
                        >
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-green-900 mb-2">
                                        Course Created Successfully!
                                    </h4>
                                    <div className="space-y-2 text-sm text-green-800">
                                        <p>📚 <strong>{courseCreated.totalModules}</strong> learning modules generated</p>
                                        <p>⏱️ Estimated duration: <strong>{courseCreated.estimatedDuration} hours</strong></p>
                                        <p>🎯 <strong>{courseCreated.topics.length}</strong> key topics extracted</p>
                                    </div>

                                    <div className="mt-4">
                                        <a
                                            href={`/course/${courseCreated.id}`}
                                            className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                                        >
                                            View Course Details
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Features List */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">What happens next?</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>AI extracts 15 key topics from your content</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Generates 30+ quiz questions automatically</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Creates step-by-step learning modules</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Prepares summary and certificate generation</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFUpload;
