const express = require("express");
const router = express.Router();

const {protect}= require("./auth.middleware");
const {
  getServiceCentres,
  getServiceCentreById,
} = require("../controllers/service-center");


router.get("/", protect, getServiceCentres);

router.get("/:id", protect, getServiceCentreById);

module.exports = router;