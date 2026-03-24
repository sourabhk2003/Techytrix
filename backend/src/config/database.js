import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.warn("Continuing without database connection...");
    // Don't exit, allow server to continue
  }
};

export default connectDB;
