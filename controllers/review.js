const { executeQuery } = require('../database/connection');

// Create a new review
async function createReview(req, res) {
  const { user_id, user_comment_heading, user_comment, rating, date, review_likes } = req.body;
  const sql = `
    INSERT INTO reviews (user_id, user_comment_heading, user_comment, rating, date, review_likes)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [user_id, user_comment_heading, user_comment, rating, date, review_likes];

  try {
    const result = await executeQuery(sql, values);
    res.status(201).json({ message: 'Review created successfully', review_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
}

// Get all reviews
async function getReviews(req, res) {
  const sql = `SELECT * FROM reviews`;

  try {
    const reviews = await executeQuery(sql);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
}

// Get review by ID
async function getReviewById(req, res) {
  const reviewId = req.params.id;
  const sql = `SELECT * FROM reviews WHERE review_id = ?`;

  try {
    const [review] = await executeQuery(sql, [reviewId]);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
    } else {
      res.status(200).json(review);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch review', error: error.message });
  }
}

// Update review by ID
async function updateReview(req, res) {
  const reviewId = req.params.id;
  const { user_comment_heading, user_comment, rating, review_likes } = req.body;
  const sql = `
    UPDATE reviews
    SET user_comment_heading = ?, user_comment = ?, rating = ?, review_likes = ?
    WHERE review_id = ?
  `;
  const values = [user_comment_heading, user_comment, rating, review_likes, reviewId];

  try {
    await executeQuery(sql, values);
    res.status(200).json({ message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
}

// Delete review by ID
async function deleteReview(req, res) {
  const reviewId = req.params.id;
  const sql = `DELETE FROM reviews WHERE review_id = ?`;

  try {
    await executeQuery(sql, [reviewId]);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
}

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
