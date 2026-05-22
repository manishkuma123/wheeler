const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ── Configure SDK ─────────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Helper: upload a buffer/stream directly (used for programmatic uploads) ──
const uploadToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

// ── Multer storage factory ────────────────────────────────────────────────────
const makeCloudinaryStorage = ({ folder, allowedFormats, resourceType = "auto" }) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: allowedFormats,
      resource_type:   resourceType,
    },
  });

// ── Pre-built multer instances ────────────────────────────────────────────────

/** Profile images  →  wheeler/profiles */
const profileUpload = multer({
  storage: makeCloudinaryStorage({
    folder:         "wheeler/profiles",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

/** Support issue images  →  wheeler/support_issues */
const issueUpload = multer({
  storage: makeCloudinaryStorage({
    folder:         "wheeler/support_issues",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

/** Service bills  →  wheeler/service_bills  (images + PDF) */
const serviceBillUpload = multer({
  storage: makeCloudinaryStorage({
    folder:         "wheeler/service_bills",
    allowedFormats: ["jpg", "jpeg", "png", "pdf"],
    resourceType:   "auto",
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
    }
    cb(null, true);
  },
});

module.exports = {
  cloudinary,
  uploadToCloudinary,
  profileUpload,
  issueUpload,
  serviceBillUpload,
};
