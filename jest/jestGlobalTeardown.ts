import mongoose from 'mongoose';

export default async function globalTeardown() {
  await mongoose.disconnect();
  console.log("Global Teardown: Disconnected from Database.");
}
