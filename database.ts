import mongoose from "npm:mongoose";

const MONGO_URI = "mongodb://localhost:27017/fedistack";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

export { connectDB };