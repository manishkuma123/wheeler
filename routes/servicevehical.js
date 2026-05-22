const express = require("express");
const router = express.Router();
const {protect} = require("./auth.middleware");
const { addVehicleService, getVehicleServices } = require("../controllers/services");

router.post("/vehicle-services", protect, addVehicleService);
router.get("/vehicle-services",  protect, getVehicleServices);

module.exports = router;