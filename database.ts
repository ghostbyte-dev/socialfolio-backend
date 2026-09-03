import mongoose from "npm:mongoose";
import { connect as connectToRedis, Redis } from "https://deno.land/x/redis@v0.34.0/mod.ts";

const MONGO_URI = Deno.env.get("MONGO_URI") ?? "";
const REDIS_URI = Deno.env.get("REDIS_URI") ?? ""; // expects e.g. "redis://host:6379" or set REDIS_HOST/REDIS_PORT below

async function connectDB() {
  console.log("Mongo: " + MONGO_URI);
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

// deno-redis needs hostname/port rather than a single URL string.
// Parse REDIS_URI (redis://[:password@]host:port[/db]) into its parts.
function parseRedisUri(uri: string) {
  try {
    const url = new URL(uri);
    return {
      hostname: url.hostname || "127.0.0.1",
      port: url.port ? Number(url.port) : 6379,
      password: url.password || undefined,
      db: url.pathname && url.pathname !== "/" ? Number(url.pathname.slice(1)) : undefined,
    };
  } catch {
    // Fallback if REDIS_URI isn't a valid URL (e.g. just "redis_cache")
    return { hostname: uri || "127.0.0.1", port: 6379 };
  }
}

// deno-redis's client is created via an async connect() call, and doesn't
// expose a "disconnected" client you can hand out before connecting (unlike
// node-redis's createClient()). We lazily connect on first use and cache the
// promise so concurrent callers share the same connection attempt.
let redisClientPromise: Promise<Redis> | null = null;

function getRedisClient(): Promise<Redis> {
  if (!redisClientPromise) {
    const { hostname, port, password, db } = parseRedisUri(REDIS_URI);
    const promise: Promise<Redis> = connectToRedis({
      hostname,
      port,
      password,
      db,
      maxRetryCount: 10, // built-in exponential-backoff reconnect, unlike node-redis this won't desync the reply queue
    }).then((client) => {
      console.log("✅ Redis connected successfully");
      return client;
    }).catch((error) => {
      console.error("❌ Redis connection error:", error);
      redisClientPromise = null; // allow a retry on next call instead of caching a rejected promise forever
      throw error;
    });
    redisClientPromise = promise;
    return promise;
  }
  return redisClientPromise;
}

async function connectRedis() {
  await getRedisClient();
}

// redisClient is now a Proxy that forwards method calls (get/set/expire/etc.)
// to the underlying deno-redis client once it's connected, so existing call
// sites like `redisClient.get("key")` keep working without changes.
const redisClient = new Proxy({} as Redis, {
  get(_target, prop: string | symbol) {
    return (...args: unknown[]) => {
      return getRedisClient().then((client) => {
        // deno-lint-ignore no-explicit-any
        const fn = (client as any)[prop];
        if (typeof fn !== "function") {
          throw new TypeError(`redisClient.${String(prop)} is not a function on the deno-redis client`);
        }
        return fn.apply(client, args);
      });
    };
  },
});

export { connectDB, connectRedis, redisClient };