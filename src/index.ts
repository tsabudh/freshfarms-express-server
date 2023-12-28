import mongoose = require("mongoose");
import redis = require("redis");
import dotenv from "dotenv";
import app from "./app";
import path from "path";

dotenv.config({ path: path.join(__dirname) + "../../.env" });

const mongoDB: string = (process.env.DATABASE_STRING as string).replace(
  "<password>",
  process.env.DATABASE_PASSWORD as string
);
// const mongoDB: string = "mongodb://127.0.0.1:27017/shree-krishna";

const redisURL: string = "redis://127.0.0.1:6379";

mongoose.Promise = Promise;
async function connectDatabase() {
  try {
    await mongoose.connect(mongoDB);
    console.log("Connected to Database.");

    // Connect to Redis cache
    const client = redis.createClient({ url: redisURL });
    await client.connect();

    // await client.flushAll();

    console.log("Connected to Redis.");
  } catch (error) {
    console.log("Mongoose Database Error");
    console.log(error);
  }
}

app.listen(3000);
connectDatabase();
