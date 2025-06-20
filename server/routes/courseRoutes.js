const express = require('express');
const {
    loadAllCourses,
    getCourseById,
    getFreeCourses,
    getPaidCourses
} = require('../controllers/courseController');

const router = express.Router();

// GET route for /loadAllCourses - Fetch all courses from database
router.get('/loadAllCourses', loadAllCourses);

// Additional routes for future use
router.get('/free', getFreeCourses);
router.get('/paid', getPaidCourses);
router.get('/:id', getCourseById);

module.exports = router;