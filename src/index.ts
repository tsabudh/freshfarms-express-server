import mongoose = require("mongoose");
import redis = require("redis");

import app from "./app";

const mongoDB: string = "mongodb://127.0.0.1:27017/shree-krishna";
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
