import express from "express";
import * as validator from "express-validator";

export const validateCustomerDetails = (isUpdateRequest = false) => {
  //- Pass argument true if it is an update/patch request

  const processIfUpdating = (req: any, field: any) => {
    //todo replace any with suitable types
    if (isUpdateRequest) {
      return req.body[field];
    } else return true;
  };

  return [
    validator
      .body("name")
      .if((value, { req }) => processIfUpdating(req, "name"))
      .notEmpty()
      .withMessage("Please provide a name.")
      .bail()
      .matches(/^(?![\s]+$)[a-zA-Z\s]*$/)
      .withMessage("Please provide a valid name."),
    validator
      .body("phone")
      .if((value, { req }) => processIfUpdating(req, "phone"))
      .notEmpty()
      .withMessage("Please provide a phone number.")
      .bail()
      .isMobilePhone(["ne-NP"])
      .withMessage("Please provide a valid phone number of Nepal"),
    validator
      .body("address")
      .if((value, { req }) => processIfUpdating(req, "address"))
      .notEmpty()
      .withMessage("Please provide an address.")
      .bail()
      .isLength({
        min: 3,
        max: 70,
      })
      .withMessage("Provide address within 70 characters."),
  ];
};

