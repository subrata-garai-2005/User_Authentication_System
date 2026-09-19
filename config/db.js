
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
  
}

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MongoDB URI is not defined in environment variables (MONGO_URI or MONGODB_URI).");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
