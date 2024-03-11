import { Redis } from "ioredis";

let redisClient = null;
export default function connectRedis() {
    const client = new Redis({
        host: "redis",
        port: 6379,
    });
    client.on("connect", () => {
        console.log("Redis connected");
    });
    client.on("error", (err) => {
        console.log("Redis error: ", err);
    });
    redisClient = client;
}

export { redisClient };
