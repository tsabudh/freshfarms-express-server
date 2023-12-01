const redis = require("redis");
const mongoose = require("mongoose");

const { Transaction } = require("../models");

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function () {
  // Check if query is cached
  const client = redis.createClient();
  client.connect();

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cachedResult = await client.get(key);

  // If cached, return the results
  if (cachedResult) {
    console.log("CACHE HIT");

    const doc = JSON.parse(cachedResult);

    Array.isArray(doc) ? doc.map((d) => new this.model(d)) : doc;

    return doc;
  }

  // Otherwise hit mongodb and cache results

  const results = await exec.apply(this, arguments);

  client.set(key, JSON.stringify(results));

  return results;
};

exports.testCache = async function (req, res) {
  try {
    let customerId = "64678ca1aacc08d81728332a";

    const transactions = await Transaction.find({
      "customer.customerId": customerId,
    });

    res.status(200).json({
      status: "success",
      data: transactions,
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "failure",
    });
  }
};
