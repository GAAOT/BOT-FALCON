const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  credits: { type: Number, default: 0, min: 0 },
  inventory: { type: [String], default: [] },
  lastDaily: { type: Date, default: null },
  lastWork: { type: Date, default: null },
  lastWeekly: { type: Date, default: null },
}, { timestamps: true });
module.exports = mongoose.model('User', schema);
