const express = require('express');
const productController = require('../controllers/product');

const router = express.Router();

// Create a new product
router.post('/products', productController.createProduct);

router.get('/leastSaleProduct', productController.leastSaleProduct);

router.get('/topSaleProduct', productController.topSaleProduct);

router.get('/lowStockProducts', productController.lowStockProducts);

router.get('/getRevenueToday', productController.totalRevenueToday);

router.get('/revenueWeekly/:week/:month/:year', productController.RevenueWeekly);

// Get all products
router.get('/products', productController.getProducts);

// Get product by ID
router.get('/products/:id', productController.getProductById);

// Update product by ID
router.put('/products/:id', productController.updateProduct);

// Delete product by ID
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
