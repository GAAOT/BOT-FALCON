const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  folk: { type: Number, default: 0, min: 0 },
  bank: { type: Number, default: 0, min: 0 },
  points: { type: Number, default: 0, min: 0 },
  lastWorkAt: { type: Date, default: null },
  warnings: { type: [{ moderatorId: String, reason: String, at: { type: Date, default: Date.now } }], default: [] }
}, { timestamps: true });
module.exports = mongoose.models.FolkUser || mongoose.model('FolkUser', schema);
