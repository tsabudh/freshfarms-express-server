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

const getAllTransactions = async (req, res, next) => {
  try {
    const results = await Transaction.find();
    res.send({
      status: "success",
      data: results,
    });
  } catch (error) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = { createTransaction, getAllTransactions };
