const express = require("express");
const router = express.Router();
const { getAvailableSlots } = require("../controllers/slotcontroller");
const {protect} = require("./auth.middleware");
 

router.get("/available-slots", protect, getAvailableSlots);
 
module.exports = router;
 
