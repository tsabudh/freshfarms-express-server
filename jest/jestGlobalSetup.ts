import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoDB: string = (process.env["DATABASE_STRING"] as string).replace(
  "<password>",
  process.env["DATABASE_PASSWORD"] as string
);

export default async function globalSetup() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoDB);
    console.log("Global Setup: Connected to Database.");
  }
  // Important: you might want to save some global state or nothing here
}
