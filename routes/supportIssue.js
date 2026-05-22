const express            = require("express");
const router             = express.Router();
const { protect }        = require("./auth.middleware");
const { issueUpload }    = require("../utils/cloudinary");
const { raiseIssue }     = require("../controllers/supportIssueController");

// POST /api/support/issue
// Headers: Authorization: Bearer <token>
// Body:    multipart/form-data  (issue_type, description, images[], booking_id?, vehicle_id?)
router.post(
  "/support/issue",
  protect,
  issueUpload.array("images[]", 5),
  raiseIssue
);

module.exports = router;
