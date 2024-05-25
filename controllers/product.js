const { executeQuery } = require('../database/connection');

// Create a new product
async function createProduct(req, res) {
  const { name, price, category, image_url, description, inStock } = req.body;

  console.log(name, price, category, image_url, description, inStock);

  // Set other fields to null if not provided
  const formattedName = name || null;
  const formattedPrice = price || null;
  const formattedCategory = category || null;
  const formattedImageUrl = JSON.stringify([image_url]) || null; // Format image_url as JSON
  const formattedDescription = description || null;
  const formattedInStock = inStock || null;
  const formattedNumPurchases = 0;

  const sql = `
      INSERT INTO products (name, price, discount, category_name, image_url, description, reviews, created_at, num_purchases, inStock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    formattedName,
    formattedPrice,
    null, // Assuming discount is not provided
    formattedCategory,
    formattedImageUrl,
    formattedDescription,
    JSON.stringify([]), // Assuming reviews field is set to an empty array
    new Date().toISOString(), // Assuming created_at is set to the current date and time
    formattedNumPurchases,
    formattedInStock
  ];

  try {
    // Execute the SQL query
    const result = await executeQuery(sql, values);

    // Send success response
    res.status(201).json({ message: 'Product created successfully', product_id: result.insertId });
  } catch (error) {
    // Send error response
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
}






// Get all products
async function getProducts(req, res) {
  const sql = `SELECT * FROM products where inStock > 0`;

  try {
    const products = await executeQuery(sql);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
}

// Get product by ID
async function getProductById(req, res) {
  const productId = req.params.id;
  const sql = `SELECT * FROM products WHERE id = ?`;

  try {
    const [product] = await executeQuery(sql, [productId]);
    console.log(product)
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
    } else {
      res.status(200).json(product);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
}

// Update product by ID
async function updateProduct(req, res) {
  const productId = req.params.id;
  const { name, price, discount, category_name, image_url, description, colors } = req.body;
  const sql = `
    UPDATE products
    SET name = ?, price = ?, discount = ?, category_name = ?, image_url = ?, description = ?, colors = ?
    WHERE id = ?
  `;
  const values = [name, price, discount, category_name, image_url, description, JSON.stringify(colors), productId];

  try {
    await executeQuery(sql, values);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
}

// Delete product by ID
async function deleteProduct(req, res) {
  const productId = req.params.id;
  const sql = `DELETE FROM products WHERE id = ?`;

  try {
    await executeQuery(sql, [productId]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
