const { executeQuery } = require('../database/connection')


// Create a new user
async function createUser(req, res) {
  const { user_name, user_password, user_role } = req.body;
  const sql = `INSERT INTO users (user_name, user_password, user_role) VALUES (?, ?, ?)`;
  const values = [user_name, user_password, user_role];

  try {
    const result = await executeQuery(sql, values);
    res.status(201).json({ message: 'User created successfully', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
}

// Get all users
async function getUsers(req, res) {
  const sql = `SELECT * FROM users`;

  try {
    const users = await executeQuery(sql);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
}

// Get user by ID
async function getUserById(req, res) {
  const userId = req.params.id;
  const sql = `SELECT * FROM users WHERE user_id = ?`;

  try {
    const [user] = await executeQuery(sql, [userId]);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
}

// Update user by ID
async function updateUser(req, res) {
  const userId = req.params.id;
  const { user_name, user_password, user_role } = req.body;
  const sql = `UPDATE users SET user_name = ?, user_password = ?, user_role = ? WHERE user_id = ?`;
  const values = [user_name, user_password, user_role, userId];

  try {
    await executeQuery(sql, values);
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
}

// Delete user by ID
async function deleteUser(req, res) {
  const userId = req.params.id;
  const sql = `DELETE FROM users WHERE user_id = ?`;

  try {
    await executeQuery(sql, [userId]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
