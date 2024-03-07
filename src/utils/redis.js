import { Redis } from "ioredis";

let redisClient = null;
export default function connectRedis() {
    const client = new Redis();
    client.on("connect", () => {
        console.log("Redis connected");
    });
    client.on("error", (err) => {
        console.log("Redis error: ", err);
    });
    redisClient = client;
}

export { redisClient };
