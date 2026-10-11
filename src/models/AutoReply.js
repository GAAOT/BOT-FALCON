const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  trigger: { type: String, required: true, trim: true, maxlength: 100 },
  response: { type: String, required: true, trim: true, maxlength: 1800 },
  matchType: { type: String, enum: ['contains', 'exact'], default: 'contains' },
  enabled: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });
schema.index({ guildId: 1, trigger: 1 }, { unique: true });
module.exports = mongoose.model('AutoReply', schema);
