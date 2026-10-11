const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  guildId: String, channelId: String, openerId: String, type: String,
  status: { type: String, default: 'open' }, createdAt: { type: Date, default: Date.now },
  closedAt: Date
}, { timestamps: true });
schema.index({ guildId: 1, channelId: 1 }, { unique: true });
module.exports = mongoose.model('Ticket', schema);
