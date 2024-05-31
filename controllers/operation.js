const { executeQuery } = require('../database/connection');
require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
        res.status(500).send({ message: 'Internal server /error' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        // Query to find the user based on email
        const findUserQuery = `
            SELECT * FROM users
            WHERE email = ?
        `;
        const users = await executeQuery(findUserQuery, [email]);

        if (users.length === 0) {
            // If user not found, send back an error response
            return res.status(404).send({ message: 'User not found' });
        }

        const user = users[0];

        // Compare the hashed password with the password from the request
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: 'Incorrect password' });
        }

        // If user found and password matches, send back the user information (excluding password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).send({ user: userWithoutPassword });
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

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // If email is not registered, create a new user
        const createUserQuery = `
            INSERT INTO users (user_name, password, email, img_url)
            VALUES (?, ?, ?, "https://i.ibb.co/mCn7jkT/default-Image.jpg")
        `;
        await executeQuery(createUserQuery, [username, hashedPassword, email]);

        // Return success response (excluding password in the response)
        const newUserQuery = `
            SELECT * FROM users WHERE email = ?
        `;
        const newUser = await executeQuery(newUserQuery, [email]);

        res.status(201).send({ user: newUser[0] });
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
