const CourseModel = require('../models/courseModel');
const data = require('../data/courses.json');

// Insert courses using async/await (no callbacks)
const insertCourses = async () => {
    try {
        const inserted = await CourseModel.insertMany(data);
        console.log("Courses inserted successfully:\n", inserted);
    } catch (err) {
        console.error("Error inserting courses:", err.message);
    }
};

const loadAllCourses = async (req, res) => {
    try {
        // Optional: Only insert if collection is empty
        const existingCourses = await CourseModel.find();
        if (existingCourses.length === 0) {
            await insertCourses();
        }

        const results = await CourseModel.find();
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.json(results);
    } catch (error) {
        console.error("Error loading courses:", error.message);
        res.status(500).json({ error: "Failed to load courses" });
    }
};

// Additional controller functions for future use
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await CourseModel.findById(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });

    } catch (error) {
        console.error('Error getting course by ID:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get course'
        });
    }
};

const getFreeCourses = async (req, res) => {
    try {
        const freeCourses = await CourseModel.findFreeCourses();

        res.status(200).json({
            success: true,
            count: freeCourses.length,
            data: freeCourses
        });

    } catch (error) {
        console.error('Error getting free courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get free courses'
        });
    }
};

const getPaidCourses = async (req, res) => {
    try {
        const paidCourses = await CourseModel.findPaidCourses();

        res.status(200).json({
            success: true,
            count: paidCourses.length,
            data: paidCourses
        });

    } catch (error) {
        console.error('Error getting paid courses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get paid courses'
        });
    }
};

module.exports = {
    loadAllCourses,
    getCourseById,
    getFreeCourses,
    getPaidCourses,
    insertCourses
};