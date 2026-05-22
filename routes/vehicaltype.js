const express = require("express");
const router = express.Router();
const VehicleType = require("../schema/vehicaltype");
const Brand = require("../schema/brand");
const VehicleModel = require("../schema/modeltype");
const { protect } = require("./auth.middleware");


router.get("/types", protect, async (req, res) => {
  try {
    const vehicleTypes = await VehicleType.find({}, { _id: 1, name: 1 });
    return res.status(200).json({
      status: true,
      data: vehicleTypes.map((t) => ({ type_id: t._id, name: t.name })),
    });
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.post("/types", protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ status: false, message: "Vehicle type name is required" });

    const existing = await VehicleType.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing)
      return res.status(409).json({ status: false, message: "Vehicle type already exists" });

    const vehicleType = new VehicleType({ name: name.trim() });
    await vehicleType.save();

    return res.status(201).json({
      status: true,
      message: "Vehicle type created successfully",
      data: { type_id: vehicleType._id, name: vehicleType.name },
    });
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});

router.get("/brands", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.type_id) filter.type_id = req.query.type_id;

    const brands = await Brand.find(filter, { _id: 1, name: 1 });
    return res.status(200).json({
      status: true,
      data: brands.map((b) => ({ brand_id: b._id, name: b.name })),
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.post("/brands", protect, async (req, res) => {
  try {
    const { name, type_id } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ status: false, message: "Brand name is required" });
    if (!type_id)
      return res.status(400).json({ status: false, message: "type_id is required" });

    const typeExists = await VehicleType.findById(type_id);
    if (!typeExists)
      return res.status(404).json({ status: false, message: "Vehicle type not found" });

    const existing = await Brand.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      type_id,
    });
    if (existing)
      return res.status(409).json({ status: false, message: "Brand already exists for this vehicle type" });

    const brand = new Brand({ name: name.trim(), type_id });
    await brand.save();

    return res.status(201).json({
      status: true,
      message: "Brand created successfully",
      data: { brand_id: brand._id, name: brand.name },
    });
  } catch (error) {
    console.error("Error creating brand:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.get("/models", protect, async (req, res) => {
  try {
    const { brand_id } = req.query;
    if (!brand_id)
      return res.status(400).json({ status: false, message: "brand_id is required" });

    const models = await VehicleModel.find({ brand_id }, { _id: 1, name: 1 });
    return res.status(200).json({
      status: true,
      data: models.map((m) => ({ model_id: m._id, name: m.name })),
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


router.post("/models", protect, async (req, res) => {
  try {
    const { name, brand_id } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ status: false, message: "Model name is required" });
    if (!brand_id)
      return res.status(400).json({ status: false, message: "brand_id is required" });

    const brandExists = await Brand.findById(brand_id);
    if (!brandExists)
      return res.status(404).json({ status: false, message: "Brand not found" });

    const existing = await VehicleModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      brand_id,
    });
    if (existing)
      return res.status(409).json({ status: false, message: "Model already exists for this brand" });

    const model = new VehicleModel({ name: name.trim(), brand_id });
    await model.save();

    return res.status(201).json({
      status: true,
      message: "Model created successfully",
      data: { model_id: model._id, name: model.name },
    });
  } catch (error) {
    console.error("Error creating model:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
});


module.exports = router;