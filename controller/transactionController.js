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

    const aggregationPipeline = [
      {
        $addFields: {
          transactionItemsQuantity: {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this.quantity"],
              },
            },
          },
          transactionAmount: {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: {
                $add: ["$$value", "$$this.priceThen"],
              },
            },
          },
        },
      },
    ];

    let filterParams = atob(req.query.filter);
    filterParams = JSON.parse(filterParams);
    console.log(req.query.filter);
    console.log(filterParams);

    let minN = `items.${filterParams?.transactionItemsQuantity?.from}`;
    let maxN = `items.${filterParams?.transactionItemsQuantity?.to}`;

    filterParams.transactionItemsQuantity &&
      aggregationPipeline.push({
        $match: {
          $and: [{ [minN]: { $exists: true } }, { [maxN]: { $exists: false } }],
        },
      });

    filterParams.quantityPerTicketRange &&
      aggregationPipeline.push({
        $match: {
          transactionItemsQuantity: {
            $gte: filterParams.quantityPerTicketRange.from,
            $lte: filterParams.quantityPerTicketRange.to,
          },
        },
      });

    filterParams.transactionAmountRange &&
      aggregationPipeline.push({
        $match: {
          transactionAmount: {
            $gte: filterParams.transactionAmountRange.from,
            $lte: filterParams.transactionAmountRange.to,
          },
        },
      });

    filterParams.dateRange &&
      aggregationPipeline.push({
        $match: {
          issuedTime: {
            $gte: new Date(filterParams.dateRange.from),
            $lte: new Date(filterParams.dateRange.to),
          },
        },
      });
    filterParams.productArray &&
      aggregationPipeline.push({
        $match: {
          items: {
            $elemMatch: { productName: { $in: filterParams.productArray } },
          },
        },
      });

    filterParams.priceRange &&
      aggregationPipeline.push({
        $match: {
          transactionAmount: {
            $gte: filterParams.priceRange.from,
            $lte: filterParams.priceRange.to,
          },
        },
      });
    filterParams.customerArray &&
      aggregationPipeline.push({
        $match: { "customer.name": { $in: filterParams.customerArray } },
      });

    const mongooseQuery = Transaction.aggregate([...aggregationPipeline]);

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
