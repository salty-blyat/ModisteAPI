const express = require('express');
const reviewController = require('../controllers/review');

const router = express.Router();

// Create a new review
router.post('/reviews', reviewController.createReview);

// Get all reviews
router.get('/reviews', reviewController.getReviews);

// Get review by ID
router.get('/reviews/:id', reviewController.getReviewById);

// Update review by ID
router.put('/reviews/:id', reviewController.updateReview);

// Delete review by ID
router.delete('/reviews/:id', reviewController.deleteReview);

module.exports = router;
