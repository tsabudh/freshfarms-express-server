const mongoose = require("mongoose");
const app = require("./app");
const mongoDB = "mongodb://localhost:27017";

const server = app.listen(3000);

console.log("server started");

async function connectDatabase() {
  try {
    await mongoose.connect(mongoDB);
  } catch (error) {
    console.log("Mongoose Database Error");
  }
  console.log("Connected to Database");
}
connectDatabase();
    // cd "C:/Program Files/MongoDB/Server/6.0/bin"
