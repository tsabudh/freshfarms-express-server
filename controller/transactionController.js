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

    const aggregationPipeline = [
      {
        $addFields: {
          totalQuantity: {
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
          itemsVariety: {
            $size: "$items",
          },
        },
      },
    ];

    if (req.query.filter) {
      let filterParams = atob(req.query.filter);
      console.log(req.query.filter);
      filterParams = JSON.parse(filterParams);
      console.log(req.query.filter);
      console.log(filterParams);

      // let minN = `items.${filterParams?.totalQuantity?.from}`;
      // let maxN = `items.${filterParams?.totalQuantity?.to}`;

      // filterParams.totalQuantity &&
      //   aggregationPipeline.push({
      //     $match: {
      //       $and: [
      //         { [minN]: { $exists: true } },
      //         { [maxN]: { $exists: false } },
      //       ],
      //     },
      //   });

      filterParams.itemsVariety &&
        aggregationPipeline.push({
          $match: {
            itemsVariety: {
              $gte: filterParams.itemsVariety.from,
              $lte: filterParams.itemsVariety.to,
            },
          },
        });

      filterParams.totalQuantity &&
        aggregationPipeline.push({
          $match: {
            totalQuantity: {
              $gte: filterParams.totalQuantity.from,
              $lte: filterParams.totalQuantity.to,
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

      filterParams.issuedTime &&
        aggregationPipeline.push({
          $match: {
            issuedTime: {
              $gte: new Date(filterParams.issuedTime.from),
              $lte: new Date(filterParams.issuedTime.to),
            },
          },
        });
      //* use all with elemMatch for AND operation of productArray
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

      console.log("message");
      // console.log(filterParams.sort.byDate);
      if (filterParams.sortBy) {
        let sortBy = {};

        if (filterParams.sortBy.issuedTime)
          sortBy.issuedTime = filterParams.sortBy.issuedTime;
        if (filterParams.sortBy.customer)
          sortBy.customer = filterParams.sortBy.customer;
        if (filterParams.sortBy.totalQuantity)
          sortBy.totalQuantity = filterParams.sortBy.totalQuantity;
        if (filterParams.sortBy.itemsVariety)
          sortBy.itemsVariety = filterParams.sortBy.itemsVariety;

        if (Object.values(sortBy).find((e) => e)) {
          aggregationPipeline.push({
            $sort: sortBy,
          });
        }
      }
      filterParams.customerId &&
        aggregationPipeline.push({
          $match: {
            "customer.customerId": {
              $eq: new mongoose.Types.ObjectId(filterParams.customerId),
            },
          },
        });
    }

    const mongooseQuery = Transaction.aggregate([...aggregationPipeline]);

    const results = await mongooseQuery;
    res.send({
      status: "success",
      numberOfResults: results.length,
      data: results,
    });
  } catch (error) {
    console.log(error);
    console.log(error.message);
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

module.exports = { createTransaction, editTransaction, getAllTransactions };
