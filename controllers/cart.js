const { executeQuery } = require('../database/connection');

// Add a product to the cart
async function addToCart(req, res) {
  const { prod_id, quantity, user_id, cart_checkout } = req.body;
  const sql = `
    INSERT INTO carts (prod_id, quantity, user_id, cart_checkout)
    VALUES (?, ?, ?, ?)
  `;
  const values = [prod_id, quantity, user_id, cart_checkout];

  try {
    const result = await executeQuery(sql, values);
    res.status(201).json({ message: 'Product added to cart successfully', cart_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add product to cart', error: error.message });
  }
}


async function getCartItems(req, res) {
  const userId = req.params.userId;
  const sql = `SELECT * FROM carts WHERE user_id = ?`;

  try {
    const cartItems = await executeQuery(sql, [userId]);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart items', error: error.message });
  }
}

async function getMonthlySales(req, res) {
  try {
    // Get the month and year from the request parameters
    const { month, year } = req.params;

    // Validate the month and year
    if (!month || !year) {
      return res.status(400).json({ error: "Month and year are required parameters." });
    }

    // Construct the SQL query to fetch sales data for the specified month and year
    const sql = `
          SELECT
              p.name AS product_name,
              p.price AS product_price,
              p.discount AS product_discount,
              COUNT(c.product_id) AS total_quantity_sold,
              SUM(c.quantity * p.price * (1 - p.discount / 100)) AS total_revenue
          FROM
              carts c
          INNER JOIN
              products p ON c.product_id = p.id
          WHERE
              MONTH(c.issue_date) = ? AND YEAR(c.issue_date) = ?
          GROUP BY
              c.product_id
          ORDER BY
              total_revenue DESC;
      `;

    // Execute the SQL query
    const salesData = await executeQuery(sql, [month, year]);

    // Send the response with the sales data
    res.status(200).json({ salesData });
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}



async function getSalesAnnually(req, res) {
  try {
    const { year } = req.params;

    if (!year) {
      return res.status(400).json({ error: 'Year query parameter is required' });
    }

    const sql = `
      SELECT
        DATE_FORMAT(c.issue_date, '%Y') AS year,
        DATE_FORMAT(c.issue_date, '%M') AS month,
        ROUND(SUM(p.price * c.quantity * (1 - p.discount / 100)), 2) AS total_sales
      FROM
        carts c
      INNER JOIN
        products p ON c.product_id = p.id
      WHERE
        DATE_FORMAT(c.issue_date, '%Y') = ?
      GROUP BY
        year, month
      ORDER BY
        DATE_FORMAT(c.issue_date, '%m')
    `;

    const salesData = await executeQuery(sql, [year]);

    if (salesData.length === 0) {
      return res.status(404).json({ message: 'No sales data found for the specified year' });
    }

    // Calculate the annual total sales by summing up the monthly totals
    const annualTotalSales = salesData.reduce((acc, monthData) => acc + monthData.total_sales, 0);

    // Format sales data to have two decimal places
    const formattedSalesData = salesData.map(monthData => ({
      month: monthData.month,
      total_sales: parseFloat(monthData.total_sales.toFixed(2))
    }));

    res.json({
      year,
      annualTotalSales: parseFloat(annualTotalSales.toFixed(2)),
      monthlySales: formattedSalesData
    });
  } catch (error) {
    console.error('Error fetching annual sales:', error);
    res.status(500).json({ error: 'An error occurred while fetching annual sales data' });
  }
}




// Get all cart items for a user
async function getCartItems(req, res) {
  const sql = `SELECT * FROM carts`;

  try {
    const cartItems = await executeQuery(sql);
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart items', error: error.message });
  }
}

// Update cart item quantity
async function updateCartItem(req, res) {
  const { cart_id, quantity } = req.body;
  const sql = `UPDATE carts SET quantity = ? WHERE cart_id = ?`;
  const values = [quantity, cart_id];

  try {
    await executeQuery(sql, values);
    res.status(200).json({ message: 'Cart item updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart item', error: error.message });
  }
}

// Remove a product from the cart
async function removeFromCart(req, res) {
  const cartId = req.params.cartId;
  const sql = `DELETE FROM carts WHERE cart_id = ?`;

  try {
    await executeQuery(sql, [cartId]);
    res.status(200).json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove product from cart', error: error.message });
  }
}

module.exports = {
  addToCart,
  getCartItems,
  updateCartItem,
  removeFromCart,
  getSalesAnnually,
  getMonthlySales
};
