import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";
import connectRedis from "./utils/redis.js";

dotenv.config();

const PORT = process.env.PORT || 8000;
connectRedis();
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });
    })
    .catch((err) => console.log("Database Connection Failed"));
