import * as redis from "redis";
// import mongoose, { QueryOptions, mongo } from "mongoose";
import path from 'path';
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname + "../../../.env") });

declare module "mongoose" {
  interface DocumentQuery<
    T,
    DocType extends import("mongoose").Document,
    QueryHelpers = {}
  > {
    mongooseCollection: {
      name: any;
    };
    cache(): Promise<DocumentQuery<T[], Document> & QueryHelpers>;
    useCache: boolean;
    hashKey: string;
  }

  interface Query<ResultType, DocType, THelpers = {}, RawDocType = DocType>
    extends DocumentQuery<any, any> {}
}
import mongoose from "mongoose";

const client = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_SOCKET_HOST,
    port: Number(process.env.REDIS_SOCKET_PORT)
  }
}); 
client.connect();

const exec = mongoose.Query.prototype.exec;

// interface MQuery extends query{

// }
// console.log(mongoose.Query);

mongoose.Query.prototype.cache = function (options: any = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key) || 'default';

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this);
    // return exec.apply(this, arguments);
  }

  try {
    const key = JSON.stringify(
      Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
      })
    );

    const cachedResult = await client.hGet(this.hashKey, key);
    // const cachedResult = JSON.parse(await client.hGet(this.hashKey, key));

    // If cached, return the results
    if (cachedResult) {
      console.log("CACHE HIT");
      // console.log(cachedResult);
      const doc = JSON.parse(cachedResult); //* ERROR OF PARSING AND STRINGIFY
      // const doc = cachedResult;

      Array.isArray(doc) ? doc.map((d) => new this.model(d)) : doc;

      return doc;
    }

    // Otherwise hit mongodb and cache results

    const results = await exec.apply(this);

    client.hSet(this.hashKey, key, JSON.stringify(results));

    return results;
  } catch (err: any) {
    console.log(err.stack);
  }
};

export const clearHash = async function (hashKey = "default") {
  try {
    // if (typeof hashKey != typeof "") JSON.stringify(hashKey);
    await client.flushDb();
  } catch (error: any) {
    console.log(error);
  }
};
