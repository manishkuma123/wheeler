const SupportIssue = require("../schema/SupportIssue");

/**
 * @desc    Raise a support issue
 * @route   POST /api/support/issue
 * @access  Private (Bearer token)
 */
const raiseIssue = async (req, res) => {
  try {
    const { issue_type, description, booking_id, vehicle_id } = req.body;

    // ── Validation ───────────────────────────────────────────────────────────
    if (!issue_type || !description) {
      return res.status(400).json({
        status: false,
        message: "issue_type and description are required",
      });
    }

    // ── Collect Cloudinary image URLs ─────────────────────────────────────────
    // multer-storage-cloudinary puts the secure URL in file.path
    const imagePaths = req.files
      ? req.files.map((file) => file.path)
      : [];

    // ── Generate unique IDs ───────────────────────────────────────────────────
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const issueId   = `iss_${randomNum}`;
    const referenceNo = `#ISS-${randomNum}`;

    // ── Save to DB ────────────────────────────────────────────────────────────
    const issue = await SupportIssue.create({
      issue_id:   issueId,
      reference_no: referenceNo,
      user_id:    req.user.id || req.user._id,
      issue_type,
      description,
      images:     imagePaths,
      booking_id: booking_id || null,
      vehicle_id: vehicle_id || null,
    });

    return res.status(201).json({
      status: true,
      message: "Issue raised successfully",
      data: {
        issue_id:               issue.issue_id,
        reference_no:           issue.reference_no,
        status:                 issue.status,
        created_at:             issue.createdAt,
        expected_response_time: issue.expected_response_time,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { raiseIssue };
