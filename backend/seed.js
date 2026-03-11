require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard_users');

const seedData = async () => {
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

    console.log('Database seeded successfully with dashboard users!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
