const express = require('express');
const router = express.Router();
const { chatWithCourses } = require('../controllers/chatController');

router.post('/', chatWithCourses);
module.exports = router;