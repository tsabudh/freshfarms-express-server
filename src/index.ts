import mongoose from "mongoose";

import dotenv from "dotenv";
import path from "path";

import {server} from './webSocket';

dotenv.config({ path: path.join(__dirname + "../../.env") });

// const mongoDB: string = (process.env.DATABASE_STRING as string).replace(
//   "<password>",
//   process.env.DATABASE_PASSWORD as string
// );

const mongoDB: string = "mongodb://127.0.0.1:27017/shree-krishna";
// const redisURL: string = "redis://127.0.0.1:6379";


mongoose.Promise = Promise;
async function connectDatabase() {
  try {
    await mongoose.connect(mongoDB);
    console.log("Connected to Database.");
  } catch (error) {
    console.log("Mongoose Database Error");
    console.log(error);
  }
}


connectDatabase();
server.listen(3000, () => { console.log('Server started on port 3000') });
