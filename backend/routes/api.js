const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Seed Database Route
router.get('/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash('password123', 10);
    const users = [
      { username: 'admin1', password: passwordHash, role: 'admin', permissions: { read: false, write: false, readWrite: true } },
      { username: 'admin2', password: passwordHash, role: 'admin', permissions: { read: false, write: true, readWrite: false } },
      { username: 'user1', password: passwordHash, role: 'normal', permissions: { read: false, write: true, readWrite: false } },
      { username: 'user2', password: passwordHash, role: 'normal', permissions: { read: false, write: false, readWrite: true } },
      { username: 'user3', password: passwordHash, role: 'normal', permissions: { read: true, write: false, readWrite: false } }
    ];
    await User.insertMany(users);
    res.json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auth Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });
      res.json({ _id: user._id, username: user.username, role: user.role, token });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users list (Protected, accessible to all logged in users)
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user permissions (Admin only endpoint)
router.patch('/users/:id/permissions', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.permissions = {
      ...user.permissions.toObject(),
      ...req.body.permissions
    };
    
    await user.save();
    
    // Return the updated user without password
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
