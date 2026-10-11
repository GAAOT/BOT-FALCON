const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  targetId: { type: String, required: true, index: true },
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  reason: { type: String, default: '' },
  roleId: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('StaffAction', schema);
