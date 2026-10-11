const mongoose = require('mongoose');
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI missing: configure your .env or host environment variables.');
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
module.exports = { connectDB };
