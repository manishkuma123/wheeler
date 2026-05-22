const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  addAddress,
  updateAddress,getAddressList,deleteAddress
} = require("../controllers/address");

const {protect} = require("./auth.middleware");

const addressValidation = [
  body("type")
    .notEmpty().withMessage("type is required")
    .isIn(["home", "office", "other"]).withMessage("type must be home, office, or other"),

  body("latitude")
    .notEmpty().withMessage("latitude is required")
    .isFloat({ min: -90, max: 90 }).withMessage("latitude must be between -90 and 90"),

  body("longitude")
    .notEmpty().withMessage("longitude is required")
    .isFloat({ min: -180, max: 180 }).withMessage("longitude must be between -180 and 180"),

  body("address_line1")
    .notEmpty().withMessage("address_line1 is required")
    .isString().trim(),

  body("city")
    .notEmpty().withMessage("city is required")
    .isString().trim(),

  body("state")
    .notEmpty().withMessage("state is required")
    .isString().trim(),

  body("pincode")
    .notEmpty().withMessage("pincode is required")
    .isString().trim(),

  body("address_id")
    .optional()
    .isString().withMessage("address_id must be a string"),


  body("address")
    .optional()
    .isString().trim(),
];


router.get("/address",protect, getAddressList);


router.post("/address", protect,addAddress);


router.put("/address/:address_id",protect, updateAddress);

router.delete("/address/:address_id", protect, deleteAddress);
module.exports = router;