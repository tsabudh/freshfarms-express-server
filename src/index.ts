import mongoose from "mongoose";
import * as redis from "redis";
import https from 'https'
import fs from 'fs';
import dotenv from "dotenv";
import app from "./app";
import path from "path";

dotenv.config({ path: path.join(__dirname + "../../.env") });
const mongoDB: string = (process.env.DATABASE_STRING as string).replace(
  "<password>",
  process.env.DATABASE_PASSWORD as string
);

// const mongoDB: string = "mongodb://127.0.0.1:27017/shree-krishna";
// const redisURL: string = "redis://127.0.0.1:6379";


mongoose.Promise = Promise;
async function connectDatabase() {
  try {
    await mongoose.connect(mongoDB);
    console.log("Connected to Database.");

    // Connect to Redis cache
    const client = redis.createClient({
      password: 'TBNhJVR63wtELcoCbGVPK9vzlsSyyZNT',
      socket: {
        host: 'redis-16113.c325.us-east-1-4.ec2.cloud.redislabs.com',
        port: 16113
      }
    }); await client.connect();


    console.log("Connected to Redis.");
  } catch (error) {
    console.log("Mongoose Database Error");
    console.log(error);
  }
}

// Left out from HTTPS implementation
const server = app;

server.listen(3000, () => { console.log('Server started on port 3000') });
connectDatabase();
