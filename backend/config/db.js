const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are defaults in Mongoose 8 but kept for clarity
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if can't connect
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌  MongoDB connection failed: ${error.message}`);
    process.exit(1); // Exit process if DB fails to connect
  }
};

module.exports = connectDB;
