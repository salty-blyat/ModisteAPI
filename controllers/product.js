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

  // Function to format date to 'YYYY-MM-DD HH:MM:SS'
  function formatDateToSQL(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  const formattedCreatedAt = formatDateToSQL(new Date());

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
    formattedCreatedAt, // Using formatted created_at
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


async function leastSaleProduct(req, res) {
  const sql = `
    SELECT *
    FROM products
    ORDER BY num_purchases ASC
    LIMIT 1;
  `;

  try {
    const [product] = await executeQuery(sql); // Destructure the result to get the first product
    res.status(200).json(product); // Return the product directly
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
}

async function lowStockProducts(req, res) {
  const sql = `SELECT * FROM products WHERE inStock <= 15;`;

  try {
    const products = await executeQuery(sql); // Fetch all products matching the condition
    res.status(200).json(products); // Return all products
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
}


async function topSaleProduct(req, res) {
  const sql = `
    SELECT *
    FROM products
    ORDER BY num_purchases DESC
    LIMIT 1;
  `;

  try {
    const [product] = await executeQuery(sql); // Destructure the result to get the first product
    res.status(200).json(product); // Return the product directly
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
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


async function totalRevenueToday(req, res) {
  const sql = `
    SELECT 
      issue_date AS date,
      COALESCE(
          (SELECT SUM(c.quantity * p.price) 
          FROM carts c
          JOIN products p ON c.product_id = p.id
          WHERE DATE(c.issue_date) = CURDATE()),
          (SELECT SUM(c1.quantity * p1.price) 
          FROM carts c1
          JOIN products p1 ON c1.product_id = p1.id
          WHERE DATE(c1.issue_date) = (SELECT MAX(DATE(issue_date)) FROM carts))
      ) AS total_revenue
    FROM carts
    LIMIT 1;
  `;

  try {
    const product = await executeQuery(sql);
    console.log(product)
    if (!product || !product[0].total_revenue) {
      res.status(404).json({ message: 'No revenue for today.' });
    } else {
      res.status(200).json({
        date: product[0].date,
        total_revenue: product[0].total_revenue
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  leastSaleProduct,
  topSaleProduct,
  lowStockProducts,
  totalRevenueToday
};
