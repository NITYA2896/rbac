const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'normal'], default: 'normal' },
  permissions: {
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    readWrite: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('User', userSchema);
