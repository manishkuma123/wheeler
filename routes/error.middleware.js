const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: false,
      message: Object.values(err.errors).map((e) => e.message).join(", "),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      status: false,
      message: "Duplicate entry detected",
    });
  }

  return res.status(500).json({
    status: false,
    message: "Internal server error",
  });
};

module.exports = { errorHandler };
