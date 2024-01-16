import express from "express";
import * as validator from "express-validator";

export const checkValidationErrors = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.log('jdjdjsnd cm j')

  const validationErrors = validator.validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res
      .status(400)
      .json({ status: "failure", errors: validationErrors.array() });
  } else {
    next();
  }
};

