"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const mongoose = require("mongoose");
const redis = require("redis");
const app = require("./app");
const mongoDB = "mongodb://127.0.0.1:27017/shree-krishna";
const redisURL = "redis://127.0.0.1:6379";
function connectDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose.connect(mongoDB);
            console.log("Connected to Database.");
            // Connect to Redis cache
            const client = redis.createClient(redisURL);
            yield client.connect();
            // await client.flushAll();
            console.log("Connected to Redis.");
        }
        catch (error) {
            console.log("Mongoose Database Error");
            console.log(error);
        }
    });
}
const server = app.listen(3000);
connectDatabase();
//# sourceMappingURL=index.js.map