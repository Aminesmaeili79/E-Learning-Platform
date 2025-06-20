const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { initVectorStore } = require('./services/vectorStoreService');
require('dotenv').config();

// Import routes
const courseroutes = require('./routes/courseRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Order is important!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use(courseroutes);
app.use('/chat', chatRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elearning-platform';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        console.log('⚠️ Continuing without MongoDB - using JSON data');
    });

// Health check routes
app.get('/', (req, res) => {
    res.json({
        message: 'E-Learning Platform API is running!',
        status: 'success',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});

// Initialize vector store and start server
initVectorStore()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 Course API available at http://localhost:${PORT}/loadAllCourses`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to initialize vector store:', error);
        console.log('⚠️ Starting server without vector store functionality');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 Course API available at http://localhost:${PORT}/loadAllCourses`);
        });
    });

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
});