// const Address = require("../schema/address");
// const { validationResult } = require("express-validator");
// const saveOrUpdateAddress = async (req, res) => {
//   try {
   
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(422).json({
//         status: false,
//         message: "Validation failed",
//         errors: errors.array(),
//       });
//     }

//     const {
//       address_id,
//       type,
//       latitude,
//       longitude,
//       address,
//       address_line1,
//       city,
//       state,
//       pincode,
//     } = req.body;

//  const user_id = req.user.id;
// if (!user_id) {
//   return res.status(401).json({
//     status: false,
//     message: "Unauthorized",
//   });
// }
//     if (address_id) {
//       const existing = await Address.findOne({
//         address_id,
//         user_id,
//         is_deleted: false,
//       });

//       if (!existing) {
//         return res.status(404).json({
//           status: false,
//           message: "Address not found",
//         });
//       }

//       existing.type = type;
//       existing.latitude = latitude;
//       existing.longitude = longitude;
//       existing.address_line1 = address_line1;
//       existing.city = city;
//       existing.state = state;
//       existing.pincode = pincode;
//       if (address !== undefined) existing.address = address;

//       await existing.save();

//       return res.status(200).json({
//         status: true,
//         message: "Address updated successfully",
//         data: {
//           address_id: existing.address_id,
//         },
//       });
//     }
//     const newAddress = await Address.create({
//       user_id,
//       type,
//       latitude,
//       longitude,
//       address,
//       address_line1,
//       city,
//       state,
//       pincode,
//     });

//     return res.status(201).json({
//       status: true,
//       message: "Address saved successfully",
//       data: {
//         address_id: newAddress.address_id,
//       },
//     });
//   } catch (error) {
//     console.error("saveOrUpdateAddress error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Internal server error",
//     });
//   }
// };

// module.exports = { saveOrUpdateAddress };

const Address = require("../schema/address");
const { validationResult } = require("express-validator");

const addAddress = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      type,
      latitude,
      longitude,
      address,
      address_line1,
      city,
      state,
      pincode,
    } = req.body;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const newAddress = await Address.create({
      user_id,
      type,
      latitude,
      longitude,
      address,
      address_line1,
      city,
      state,
      pincode,
    });

    return res.status(201).json({
      status: true,
      message: "Address saved successfully",
      data: {
        address_id: newAddress.address_id,
      },
    });

  } catch (error) {
    console.error("addAddress error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getAddressList = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const addresses = await Address.find({ user_id, is_deleted: false })
      .sort({ is_default: -1, created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formatted = addresses.map((addr) => ({
      address_id: addr.address_id,
      type: addr.type,
      label: addr.type.charAt(0).toUpperCase() + addr.type.slice(1),
      latitude: addr.latitude,
      longitude: addr.longitude,
      address: addr.address,
      address_line1: addr.address_line1,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      is_default: addr.is_default ?? false,
      created_at: addr.created_at,
    }));

    return res.status(200).json({
      status: true,
      message: "Address list fetched successfully",
      data: formatted,
    });

  } catch (error) {
    console.error("getAddressList error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      type,
      latitude,
      longitude,
      address,
      address_line1,
      city,
      state,
      pincode,
    } = req.body;

    const { address_id } = req.params;

    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const existing = await Address.findOne({
      address_id,
      user_id,
      is_deleted: false,
    });

    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }

    existing.type = type;
    existing.latitude = latitude;
    existing.longitude = longitude;
    existing.address = address;
    existing.address_line1 = address_line1;
    existing.city = city;
    existing.state = state;
    existing.pincode = pincode;

    await existing.save();

    return res.status(200).json({
      status: true,
      message: "Address updated successfully",
      data: {
        address_id: existing.address_id,
      },
    });

  } catch (error) {
    console.error("updateAddress error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
const deleteAddress = async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

    const { address_id } = req.params; 

    const existing = await Address.findOne({
      address_id,
      user_id,
      is_deleted: false,
    });

    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }

    existing.is_deleted = true;
    await existing.save();

    return res.status(200).json({
      status: true,
      message: "Address deleted successfully",
    });

  } catch (error) {
    console.error("deleteAddress error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
module.exports = {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddressList
};