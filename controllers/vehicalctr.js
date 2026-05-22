const Vehicle = require("../schema/vehical");

const addVehicle = async (req, res) => {
  try {
    const {
      type_id,
      brand_id,
      model_id,
      fuel_type,
      Is_active,
      registration_number,
      motor_policy_number,
    } = req.body;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const vehicle = await Vehicle.create({
      user_id,
      type_id,
      brand_id,
      model_id,
      fuel_type,
      is_active: Is_active,
      registration_number,
      motor_policy_number,
      front_photo: req.files?.front_photo?.[0]?.path || null,
      rear_photo: req.files?.rear_photo?.[0]?.path || null,
    });

    return res.status(201).json({
      status: true,
      message: "Vehicle added successfully",
      data: vehicle,
    });

  } catch (err) {
    console.error("addVehicle error:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "All vehicles fetched successfully",
      data: vehicles,
    });
  } catch (err) {
    console.error("getAllVehicles error:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
    });
  }
};


const getVehicleDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        status: false,
        message: "Vehicle not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Vehicle details fetched successfully",
      data: vehicle,
    });

  } catch (err) {
    console.error("getVehicleDetail error:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
    });
  }
};


const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Safe fallback
    const body = req.body || {};

    const {
      type_id,
      brand_id,
      model_id,
      fuel_type,
      is_active,
      registration_number,
      motor_policy_number,
    } = body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        status: false,
        message: "Vehicle not found",
      });
    }

    // Update fields only if provided
    if (type_id) vehicle.type_id = type_id;
    if (brand_id) vehicle.brand_id = brand_id;
    if (model_id) vehicle.model_id = model_id;
    if (fuel_type) vehicle.fuel_type = fuel_type;

    if (typeof is_active !== "undefined") {
      vehicle.is_active = is_active;
    }

    if (registration_number) {
      vehicle.registration_number = registration_number;
    }

    if (motor_policy_number) {
      vehicle.motor_policy_number = motor_policy_number;
    }

    // Update images if uploaded
    if (req.files?.front_photo?.[0]?.path) {
      vehicle.front_photo = req.files.front_photo[0].path;
    }

    if (req.files?.rear_photo?.[0]?.path) {
      vehicle.rear_photo = req.files.rear_photo[0].path;
    }

    await vehicle.save();

    return res.status(200).json({
      status: true,
      message: "Vehicle updated successfully",
      data: vehicle,
    });

  } catch (err) {
    console.error("updateVehicle error:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
    });
  }
};


const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        status: false,
        message: "Vehicle not found",
      });
    }

    await Vehicle.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      message: "Vehicle deleted successfully",
    });

  } catch (err) {
    console.error("deleteVehicle error:", err);

    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
    });
  }
};
module.exports = { addVehicle, getAllVehicles, getVehicleDetail, updateVehicle, deleteVehicle}
