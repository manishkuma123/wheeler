const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("./auth.middleware");
const { addVehicle,getAllVehicles,getVehicleDetail,updateVehicle ,deleteVehicle} = require("../controllers/vehicalctr");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${req.user.user_id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/vehical/save",
  protect,
  upload.fields([
    { name: "front_photo", maxCount: 1 },
    { name: "rear_photo", maxCount: 1 },
  ]),
  addVehicle
);

router.get("/vehical/all",protect, getAllVehicles)

router.get("/vehical/:id", protect,getVehicleDetail);



router.put(
  "/vehical/:id",
  protect,
  upload.fields([
    { name: "front_photo", maxCount: 1 },
    { name: "rear_photo", maxCount: 1 },
  ]),
  
  updateVehicle
);
router.delete("/vehical/:id", protect, deleteVehicle);
module.exports = router;