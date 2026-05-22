const express = require("express");
const router = express.Router();
const { getServiceScope } = require("../controllers/Servicescopecontroller");
const {protect} = require("./auth.middleware");


router.get("/service-scope", protect, getServiceScope);

module.exports = router;