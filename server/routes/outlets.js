const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { authenticateUser, authorizeRoles, isOwnerOrAdmin } = require('../middleware/auth');

// @route   GET /outlet
// @desc    Get all courses (sorted by rating)
// @access  Private
router.get('/', authenticateUser, async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('professor', 'username')
            .sort('-averageRating');
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /outlet/:userId
// @desc    Get courses by professor
// @access  Private
router.get('/:userId', authenticateUser, async (req, res) => {
    try {
        const courses = await Course.find({ professor: req.params.userId })
            .populate('professor', 'username');
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /outlet/outletId/:outletId
// @desc    Get course by id
// @access  Private
router.get('/outletId/:outletId', authenticateUser, async (req, res) => {
    try {
        const course = await Course.findById(req.params.outletId)
            .populate('professor', 'username')
            .populate('reviews.student', 'username');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /outlet/to_reply/:outletId
// @desc    Get reviews pending reply
// @access  Private (Professor only)
router.get('/to_reply/:outletId', 
    authenticateUser, 
    authorizeRoles('professor'),
    async (req, res) => {
        try {
            const course = await Course.findOne({
                _id: req.params.outletId,
                professor: req.user.id
            });

            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            const pendingReviews = course.reviews.filter(review => !review.reply);
            res.json(pendingReviews);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   GET /outlet/regex/:pattern
// @desc    Search courses by regex pattern
// @access  Private
router.get('/regex/:pattern', authenticateUser, async (req, res) => {
    try {
        const pattern = new RegExp(req.params.pattern, 'i');
        const courses = await Course.find({
            $or: [
                { title: pattern },
                { description: pattern }
            ]
        }).populate('professor', 'username');
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /outlet
// @desc    Create a course
// @access  Private (Professor only)
router.post('/', [
    authenticateUser,
    authorizeRoles('professor'),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const newCourse = new Course({
            title: req.body.title,
            description: req.body.description,
            professor: req.user.id
        });

        const course = await newCourse.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /outlet/review/:outletId
// @desc    Add/Update a review
// @access  Private (Student only)
router.put('/review/:outletId', [
    authenticateUser,
    authorizeRoles('student'),
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const course = await Course.findById(req.params.outletId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const newReview = {
            student: req.user.id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        // Check if user already reviewed
        const reviewIndex = course.reviews.findIndex(
            review => review.student.toString() === req.user.id
        );

        if (reviewIndex > -1) {
            course.reviews[reviewIndex] = newReview;
        } else {
            course.reviews.push(newReview);
        }

        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /outlet/reply/:outletId/:reviewId
// @desc    Reply to a review
// @access  Private (Professor only)
router.put('/reply/:outletId/:reviewId', [
    authenticateUser,
    authorizeRoles('professor'),
    check('reply', 'Reply is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const course = await Course.findOne({
            _id: req.params.outletId,
            professor: req.user.id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const review = course.reviews.id(req.params.reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        if (review.reply) {
            return res.status(400).json({ message: 'Review already has a reply' });
        }

        review.reply = req.body.reply;
        await course.save();
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /outlet/:outletId
// @desc    Delete a course
// @access  Private (Professor or Admin)
router.delete('/:outletId', 
    authenticateUser,
    isOwnerOrAdmin(Course),
    async (req, res) => {
        try {
            await Course.findByIdAndDelete(req.params.outletId);
            res.json({ message: 'Course deleted' });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route   DELETE /outlet/review/:outletId/:reviewId
// @desc    Delete a review
// @access  Private (Admin only)
router.delete('/review/:outletId/:reviewId',
    authenticateUser,
    authorizeRoles('admin'),
    async (req, res) => {
        try {
            const course = await Course.findById(req.params.outletId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            course.reviews = course.reviews.filter(
                review => review._id.toString() !== req.params.reviewId
            );

            await course.save();
            res.json(course);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router; 