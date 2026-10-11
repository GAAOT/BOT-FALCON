const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  guildId: String, channelId: String, messageId: String, hostId: String,
  prize: String, endsAt: Date, entrants: { type: [String], default: [] },
  ended: { type: Boolean, default: false }
}, { timestamps: true });
module.exports = mongoose.model('Giveaway', schema);
