const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class PDFService {
  async extractTextFromPDF(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      // Clean and format the extracted text
      let text = data.text;
      
      // Remove excessive whitespace and normalize
      text = text.replace(/\s+/g, ' ').trim();
      
      // Remove page numbers and headers/footers (basic cleanup)
      text = text.replace(/\d+\s*$/gm, ''); // Remove page numbers at end of lines
      text = text.replace(/^\s*\d+\s*$/gm, ''); // Remove standalone page numbers
      
      return {
        text: text,
        pages: data.numpages,
        info: data.info
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async validatePDF(file) {
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    return true;
  }

  async savePDF(file, userId) {
    try {
      const uploadDir = path.join(__dirname, '../uploads', userId.toString());
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `course_${Date.now()}_${file.originalname}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      return {
        filename,
        originalName: file.originalname,
        path: filepath,
        size: file.size
      };
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF file');
    }
  }

  async deletePDF(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
  }

  // Extract key sections from PDF text
  extractKeySections(text) {
    const sections = [];
    
    // Look for common section patterns
    const sectionPatterns = [
      /(?:chapter|section|part)\s*\d*[:\-\s]*([^\n]+)/gi,
      /^\d+\.\s*([^\n]+)/gm,
      /^[A-Z][A-Z\s]+$/gm // All caps headings
    ];

    sectionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.replace(/^(?:chapter|section|part)\s*\d*[:\-\s]*/i, '').trim();
          if (cleanMatch.length > 5 && cleanMatch.length < 100) {
            sections.push(cleanMatch);
          }
        });
      }
    });

    // Remove duplicates and return unique sections
    return [...new Set(sections)].slice(0, 20);
  }

  // Estimate reading time
  estimateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  }
}

module.exports = new PDFService();
