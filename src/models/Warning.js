const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  guildId: String, userId: String, moderatorId: String, reason: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Warning', schema);
