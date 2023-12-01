const mongoose = require("mongoose");
const redis = require("redis");

const app = require("./src/app");

const mongoDB = "mongodb://127.0.0.1:27017/shree-krishna";
const redisURL = "redis://127.0.0.1:6379";

async function connectDatabase() {
  try {
    await mongoose.connect(mongoDB);
    console.log("Connected to Database.");

    // Connect to Redis cache
    const client = redis.createClient(redisURL);
    await client.connect();

    // await client.flushAll();

    console.log("Connected to Redis.");
  } catch (error) {
    console.log("Mongoose Database Error");
    console.log(error);
  }
}

const server = app.listen(3000);
connectDatabase();
