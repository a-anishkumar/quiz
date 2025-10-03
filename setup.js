#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Qizz E-Learning Platform...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required. Current version:', nodeVersion);
    process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Create necessary directories
const directories = ['uploads', 'certificates', 'client/public'];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
    }
});

// Create .env file if it doesn't exist
if (!fs.existsSync('.env')) {
    const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/qizz-elearning

# JWT Secret
JWT_SECRET=${generateRandomString(32)}

# Gemini AI API
GEMINI_API_KEY=your-gemini-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

    fs.writeFileSync('.env', envContent);
    console.log('📝 Created .env file with default configuration');
    console.log('⚠️  Please update GEMINI_API_KEY in .env file with your actual API key');
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Server dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install server dependencies:', error.message);
    process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
    execSync('cd client && npm install', { stdio: 'inherit' });
    console.log('✅ Client dependencies installed successfully');
} catch (error) {
    console.error('❌ Failed to install client dependencies:', error.message);
    process.exit(1);
}

// Create a simple start script
const startScript = `#!/bin/bash
echo "🚀 Starting Qizz E-Learning Platform..."
echo "📝 Make sure MongoDB is running on your system"
echo "🔑 Make sure you've set your GEMINI_API_KEY in .env file"
echo ""
npm run dev
`;

fs.writeFileSync('start.sh', startScript);
fs.chmodSync('start.sh', '755');

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Get your Gemini API key from: https://makersuite.google.com/app/apikey');
console.log('3. Update GEMINI_API_KEY in .env file');
console.log('4. Run: npm run dev (or ./start.sh)');
console.log('\n🌐 The application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5000');
console.log('\n📚 Check README.md for detailed documentation');

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
