import mongoose from "npm:mongoose";
import { createClient } from "npm:redis@^4.5";

const MONGO_URI = "mongodb://localhost:27017/fedistack";
const REDIS_URI = "redis://localhost:6379";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

// Connect to Redis
const redisClient = createClient({ url: REDIS_URI });

redisClient.on("error", (err) => console.error("❌ Redis Client Error", err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected successfully");
  } catch (error) {
    console.error("❌ Redis connection error:", error);
  }
}

export { connectDB, connectRedis, redisClient };
