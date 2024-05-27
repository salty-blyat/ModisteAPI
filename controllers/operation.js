const { executeQuery } = require('../database/connection');
require('dotenv').config();


async function checkout(req, res) {
    const { customerId, products } = req.body; // Assuming request body contains customerId and products array
    console.log(customerId, products);

    if (!products || products.length === 0) {
        return res.status(400).send({ message: 'No products provided' });
    }

    try {
        for (const product of products) {
            const { id, inCart } = product;

            // Decrement the stock
            const decrementStockQuery = `
                UPDATE products 
                SET inStock = inStock - ? 
                WHERE id = ? AND inStock >= ?
            `;
            const decrementValues = [inCart, id, inCart];
            const decrementResult = await executeQuery(decrementStockQuery, decrementValues);

            if (decrementResult.affectedRows === 0) {
                return res.status(400).send({ message: 'Failed to decrement stock. Either product does not exist or insufficient stock.' });
            }

            // Increment the num_purchases
            const incrementPurchasesQuery = `
                UPDATE products
                SET num_purchases = num_purchases + ?
                WHERE id = ?
            `;
            const incrementValues = [inCart, id];
            await executeQuery(incrementPurchasesQuery, incrementValues);

            // Insert into carts table
            const insertCartQuery = `
                INSERT INTO carts (product_id, quantity, user_id)
                VALUES (?, ?, ?)
            `;
            const insertCartValues = [id, inCart, customerId];
            await executeQuery(insertCartQuery, insertCartValues);
        }

        // Send success message
        res.status(200).send({ message: 'Stock decremented, purchases incremented, and cart updated successfully' });
    } catch (error) {
        console.error('Error during checkout process:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        // Query to find the user based on email and password
        const findUserQuery = `
            SELECT * FROM users
            WHERE email = ? AND password = ?
        `;
        const user = await executeQuery(findUserQuery, [email, password]);

        if (user.length === 0) {
            // If user not found, send back an error response
            return res.status(404).send({ message: 'User not found' });
        }

        // If user found, send back the user information
        res.status(200).send({ user: user[0] });
    } catch (error) {
        // Handle error
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
}

async function signin(req, res) {
    const { username, email, password } = req.body;

    try {
        // Check if the email is already registered
        const existingUserQuery = `
            SELECT * FROM users
            WHERE email = ?
        `;
        const existingUser = await executeQuery(existingUserQuery, [email]);

        if (existingUser.length > 0) {
            return res.status(400).send({ message: 'Email already exists. Please use a different email.' });
        }

        // If email is not registered, create a new user
        const createUserQuery = `
            INSERT INTO users (user_name, password, email)
            VALUES (?, ?, ?)
        `;
        const newUser = await executeQuery(createUserQuery, [username, password, email]);

        // Return success response with the newly created user
        res.status(201).send({ user: newUser });
    } catch (error) {
        // Handle error
        console.error('Error during sign in:', error);
        res.status(500).send({ message: 'Internal server error' });
    }
} 


module.exports = {
    checkout,
    login,
    signin
};
