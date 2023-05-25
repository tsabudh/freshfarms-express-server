const mongoose = require("mongoose");

const Transaction = require("../model/transactionModel");

const createTransaction = async (req, res, next) => {
  try {
    const transactionDetails = req.body;
    const newTransaction = await Transaction.create(transactionDetails);

    res.send({
      status: "success",
      data: newTransaction,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

const editTransaction = (req, res, next) => {
  next();
};

const getAllTransactions = async (req, res, next) => {
  try {
    const limit = req.query.limit;
    const product = req.query.product;
    let filter = {
      _id: { $eq: "646cdb8064e7d5835ff90552" },
    };
    let date1 = new Date("2023-05-23T15:24:13.295+00:00");
    let date2 = new Date("2023-05-26T15:24:13.295+00:00");
    let quantity1 = 4;
    let quantity2 = 5;
    let itemLowerRange = 2;
    let itemUpperRange = 4;
    // const mongooseQuery = Transaction.find(filter).select("+cost");
    const mongooseQuery = Transaction.aggregate([
      {
        $unwind: "$items",
      },
      // {
      //   $match:{
      //     'items.quantity':1
      //   }
      // }
      {
        $project: {
          total: { $sum: "$items.quantity" },
        },
      },
      {
        $group: {
          _id: "$_id",
          totalQuantity: { $sum: '$total' },
        },
      },
    ]);

    const results = await mongooseQuery;
    res.send({
      status: "success",
      numberOfResults: results.length,
      data: results,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = { createTransaction, editTransaction, getAllTransactions };
