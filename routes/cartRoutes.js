const express = require('express');
const cartController = require('../controllers/cart');


const router = express.Router();
// Add a product to the cart
router.post('/cart', cartController.addToCart);
router.get('/cart', cartController.getCartItems);

router.get('/sales/:year/:month', cartController.getMonthlySales);
router.get('/sales/:year', cartController.getSalesAnnually);

// Get all cart items for a user
router.get('/cart/:userId', cartController.getCartItems);

// Update cart item quantity
router.put('/cart', cartController.updateCartItem);

// Remove a product from the cart
router.delete('/cart/:cartId', cartController.removeFromCart);

module.exports = router;
