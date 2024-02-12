import mongoose, { PipelineStage } from "mongoose";
import express from "express";

import Transaction from "../models/Transaction";

export const createTransaction = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const transactionDetails = req.body;
    transactionDetails.createdBy = res.locals.currentUser;
    const newTransaction = await Transaction.create(transactionDetails);

    res.send({
      status: "success",
      data: newTransaction,
    });
  } catch (error: any) {
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};



export const getAllTransactions = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const limit = req.query.limit;

    const aggregationPipeline: PipelineStage[] = [
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
          purchaseAmount: {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: {
                // $add: ["$$value", "$$this.priceThen"],
                $add: [
                  "$$value",
                  { $multiply: ["$$this.priceThen", "$$this.quantity"] },
                ],
              },
            },
          },
          itemsVariety: {
            $size: "$items",
          },
        },
      },
    ];

    interface filterParams {
      itemsVariety?: {
        from: String;
        to: String;
      };

      totalQuantity?: {
        from: String;
        to: String;
      };

      purchaseAmountRange?: {
        from: String;
        to: String;
      };
      issuedTime?: {
        from: Date;
        to: Date;
      };

      priceRange?: {
        from: String;
        to: String;
      };
      productArray?: Array<string>;
      customerArray?: Array<string>;
      customerIdArray?: Array<string>;
      sortBy: {
        issuedTime?: any;
        customer?: any;
        totalQuantity?: any;
        itemsVariety?: any;
      };
      customerId?: string;
      limit?: number;
    }

    if (req.query.filter) {
      let filterParamsX = atob(req.query.filter as string);
      let filterParams: filterParams = JSON.parse(filterParamsX);

      console.log(filterParamsX);
      // console.log(req.query.filter);
      //* EXPERIMENTAL
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
      // * --------------------------

      filterParams?.itemsVariety &&
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

      filterParams.purchaseAmountRange &&
        aggregationPipeline.push({
          $match: {
            purchaseAmount: {
              $gte: filterParams.purchaseAmountRange.from,
              $lte: filterParams.purchaseAmountRange.to,
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
            purchaseAmount: {
              $gte: filterParams.priceRange.from,
              $lte: filterParams.priceRange.to,
            },
          },
        });
      filterParams.customerArray &&
        aggregationPipeline.push({
          $match: { "customer.name": { $in: filterParams.customerArray } },
        });

      //todo TEST CUSTOMER ID ARRAY, CHECK MONGOOSE OBJECTID TO STRING CASTING
      filterParams.customerIdArray &&
        aggregationPipeline.push({
          $match: {
            "customer.customerId": {
              $in: filterParams.customerIdArray,
            },
          },
        });
      // console.log(filterParams.sort.byDate);
      if (filterParams.sortBy) {
        let sortBy: filterParams["sortBy"] = {};

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
      filterParams.limit &&
        aggregationPipeline.push({
          $limit: filterParams.limit,
        });
    }

    //- Populating createBy field with admin's name & _id
    aggregationPipeline.push({
      $lookup: {
        from: "admins",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1 } }],
        as: "issuedBy",
      },
    })
    aggregationPipeline.push({
      $unwind: "$issuedBy"
    });



    const mongooseQuery = Transaction.aggregate([...aggregationPipeline]);

    const results = await mongooseQuery;

    res.send({
      status: "success",
      numberOfResults: results.length,
      data: results,
    });
  } catch (error: any) {
    console.log(error);
    console.log(error.message);
    res.send({
      status: "failure",
      message: error.message,
    });
  }
};

