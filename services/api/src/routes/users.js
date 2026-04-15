const express = require('express');
const router = express.Router();
const UserModel = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        level: user.level,
        role: user.role,
        createdAt: user.created_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        level: user.level,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, level, role, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !level || !role || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields (firstName, lastName, email, level, role, password)',
      });
    }

    const user = await UserModel.createUser({
      firstName,
      lastName,
      email,
      level,
      role,
      password,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update user
router.patch('/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, level, role } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !level || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const user = await UserModel.updateUser(req.params.id, {
      firstName,
      lastName,
      email,
      level,
      role,
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await UserModel.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
