const express = require('express');
const operationController = require('../controllers/operation');

const router = express.Router();

// Add a product to the cart
router.post('/checkout', operationController.checkout);
router.post('/login', operationController.login);
router.post('/signin', operationController.signin);


module.exports = router;