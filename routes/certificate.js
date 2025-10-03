const express = require('express');
const jsPDF = require('jspdf');
const Course = require('../models/Course');
const User = require('../models/User');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Generate certificate for completed course
router.post('/generate/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    const user = await User.findById(req.userId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has completed the course
    const completedCourse = user.completedCourses.find(c => c.courseId.toString() === req.params.courseId);
    if (!completedCourse) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    // Generate certificate
    const certificate = await generateCertificate(user, course, completedCourse.score);

    // Save certificate path to user's completed course
    completedCourse.certificateUrl = certificate.path;
    await user.save();

    res.json({
      message: 'Certificate generated successfully',
      certificate: {
        url: certificate.url,
        path: certificate.path
      }
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
});

// Get user's certificates
router.get('/my-certificates', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('completedCourses.courseId');
    
    const certificates = user.completedCourses
      .filter(course => course.certificateUrl)
      .map(course => ({
        courseId: course.courseId._id,
        courseTitle: course.courseId.title,
        completedAt: course.completedAt,
        score: course.score,
        certificateUrl: course.certificateUrl
      }));

    res.json({
      message: 'Certificates retrieved successfully',
      certificates: certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Failed to get certificates' });
  }
});

// Download certificate
router.get('/download/:courseId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const completedCourse = user.completedCourses.find(c => c.courseId.toString() === req.params.courseId);

    if (!completedCourse || !completedCourse.certificateUrl) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    const certificatePath = path.join(__dirname, '..', completedCourse.certificateUrl);
    
    if (!fs.existsSync(certificatePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    res.download(certificatePath, `certificate-${req.params.courseId}.pdf`);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Failed to download certificate' });
  }
});

// Generate certificate function
async function generateCertificate(user, course, score) {
  try {
    // Create PDF document
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Set background color
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add border
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(3);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Add decorative elements
    doc.setFillColor(0, 102, 204);
    doc.circle(pageWidth / 2, 40, 25, 'F');
    
    // Add certificate title
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 80, { align: 'center' });

    // Add subtitle
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 100, { align: 'center' });

    // Add student name
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name.toUpperCase(), pageWidth / 2, 120, { align: 'center' });

    // Add course completion text
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', pageWidth / 2, 140, { align: 'center' });

    // Add course title
    doc.setTextColor(0, 102, 204);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`"${course.title}"`, pageWidth / 2, 160, { align: 'center' });

    // Add score
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`with a score of ${score}%`, pageWidth / 2, 180, { align: 'center' });

    // Add completion date
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Completed on ${completionDate}`, pageWidth / 2, 200, { align: 'center' });

    // Add signature line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.line(pageWidth - 100, pageHeight - 60, pageWidth - 20, pageHeight - 60);
    doc.setFontSize(12);
    doc.text('Qizz E-Learning Platform', pageWidth - 60, pageHeight - 45, { align: 'center' });

    // Add certificate ID
    const certificateId = `QIZZ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${certificateId}`, 20, pageHeight - 20);

    // Create certificates directory if it doesn't exist
    const certificatesDir = path.join(__dirname, '..', 'certificates');
    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, { recursive: true });
    }

    // Save certificate
    const filename = `certificate-${user._id}-${course._id}-${Date.now()}.pdf`;
    const filepath = path.join(certificatesDir, filename);
    doc.save(filepath);

    return {
      path: `certificates/${filename}`,
      url: `/api/certificate/download/${course._id}`
    };
  } catch (error) {
    console.error('Error generating certificate:', error);
    throw error;
  }
}

module.exports = router;
