const express = require('express');
const { handleChatQuery, getChatConfig, chatWithCourses } = require('../controllers/chatController');
const { getVectorStoreStats, searchSimilarCourses } = require('../services/vectorStoreService');

const router = express.Router();

// POST /api/chat/chat - Main chatbot endpoint with course integration
router.post('/chat', chatWithCourses);

// POST /api/chat - Handle chat queries
router.post('/', handleChatQuery);

// GET /api/chat/config - Get chat configuration
router.get('/config', getChatConfig);

// GET /api/chat/stats - Get vector store statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = getVectorStoreStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/chat/search - Test vector store search
router.post('/search', async (req, res) => {
    try {
        const { query, limit = 3 } = req.body;

        if (!query) {
            return res.status(400).json({ success: false, error: 'Query is required' });
        }

        const results = await searchSimilarCourses(query, limit);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;