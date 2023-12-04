const redis = require("redis");
const mongoose = require("mongoose");

const client = redis.createClient();
client.connect();

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "default");

  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  try {
    const key = JSON.stringify(
      Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name,
      })
    );

    const cachedResult = JSON.parse(await client.hGet(this.hashKey, key));

    // If cached, return the results
    if (cachedResult) {
      console.log("CACHE HIT");

      // const doc = JSON.parse(cachedResult);
      const doc = cachedResult;

      Array.isArray(doc) ? doc.map((d) => new this.model(d)) : doc;

      return doc;
    }

    // Otherwise hit mongodb and cache results

    const results = await exec.apply(this, arguments);

    client.hSet(this.hashKey, key, JSON.stringify(results));

    return results;
  } catch (err) {
    console.log(err.stack);
  }
};

const clearHash = async function (hashKey = "default") {
  await client.del(JSON.stringify(hashKey));
};

module.exports = { clearHash };
