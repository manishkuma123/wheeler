const ServiceScope = require("../schema/ServiceScope");


const getServiceScope = async (req, res) => {
  try {
    const { centre_id } = req.query;


    if (!centre_id || !centre_id.trim()) {
      return res.status(400).json({
        status: false,
        message: "'centre_id' query parameter is required.",
      });
    }

   
    const scopeItems = await ServiceScope.find({ is_active: true })
      .sort({ sort_order: 1 })
      .lean();

    if (!scopeItems || scopeItems.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No service scope items found.",
      });
    }

    const data = scopeItems.map((item) => ({
      scope_id: item.scope_id,
      label: item.label,
      is_mandatory: item.is_mandatory,
      default_checked: item.default_checked,
    }));

    return res.status(200).json({
      status: true,
      data,
    });
  } catch (error) {
    console.error("getServiceScope error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { getServiceScope };