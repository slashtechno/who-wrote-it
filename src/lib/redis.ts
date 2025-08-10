import { createClient } from "redis";

declare global {
  // eslint-disable-next-line no-var
  var redisClient: any | undefined;
}

export async function getRedis(): Promise<any> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL is not set");
  }

  if (!global.redisClient) {
    const client = createClient({ url: redisUrl });
    client.on("error", (err) => {
      console.error("Redis client error:", err);
    });
    await client.connect();
    global.redisClient = client;
  }

  return global.redisClient;
}

