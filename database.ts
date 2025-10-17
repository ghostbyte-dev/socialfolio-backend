import mongoose from "npm:mongoose";
import { createClient } from "npm:redis@^4.5";

const MONGO_URI = Deno.env.get("MONGO_URI") ?? "";
const REDIS_URI = Deno.env.get("REDIS_URI") ?? "";

async function connectDB() {
  console.log("Mongo: " + MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

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
