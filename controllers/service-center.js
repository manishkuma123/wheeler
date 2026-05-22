const ServiceCentre = require("../schema/Service-Centres");


const getServiceCentres = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseInt(req.query.radius) || 10;
    const search = req.query.search?.trim();

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        status: false,
        message: "lat and lng query parameters are required and must be valid numbers.",
      });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        status: false,
        message: "Invalid coordinates. lat must be -90 to 90 and lng must be -180 to 180.",
      });
    }

    if (radius < 1 || radius > 100) {
      return res.status(400).json({
        status: false,
        message: "radius must be between 1 and 100 km.",
      });
    }

    const radiusInMeters = radius * 1000;

   
    const pipeline = [
     
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance_meters",
          maxDistance: radiusInMeters,
          spherical: true,
          query: {
            is_authorised: true,
            is_registered: true,
            is_active: true,
          },
        },
      },


      ...(search
        ? [
            {
              $match: {
                $or: [
                  { area: { $regex: search, $options: "i" } },
                  { pincode: { $regex: search, $options: "i" } },
                  { name: { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),

      // Stage 3: shape the response fields
      {
        $project: {
          _id: 0,
          centre_id: 1,
          name: 1,
          address: 1,
          distance_km: {
            $round: [{ $divide: ["$distance_meters", 1000] }, 1],
          },
          is_authorised: 1,
          operating_hours: 1,
          rating: 1,
          review_count: 1,
          centre_image: 1,
          lat: { $arrayElemAt: ["$location.coordinates", 1] },
          lng: { $arrayElemAt: ["$location.coordinates", 0] },
        },
      },

      // Stage 4: nearest first
      { $sort: { distance_km: 1 } },
    ];

    const centres = await ServiceCentre.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      data: centres,
    });
  } catch (error) {
    console.error("Error fetching service centres:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};


const getServiceCentreById = async (req, res) => {
  try {
    const centre = await ServiceCentre.findOne({
      centre_id: req.params.id,
      is_authorised: true,
      is_registered: true,
      is_active: true,
    }).select(
      "-_id centre_id name address area pincode is_authorised operating_hours rating review_count centre_image location"
    );

    if (!centre) {
      return res.status(404).json({
        status: false,
        message: "Service centre not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: {
        centre_id: centre.centre_id,
        name: centre.name,
        address: centre.address,
        area: centre.area,
        pincode: centre.pincode,
        is_authorised: centre.is_authorised,
        operating_hours: centre.operating_hours,
        rating: centre.rating,
        review_count: centre.review_count,
        centre_image: centre.centre_image,
        lat: centre.location.coordinates[1],
        lng: centre.location.coordinates[0],
      },
    });
  } catch (error) {
    console.error("Error fetching service centre:", error.message);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  getServiceCentres,
  getServiceCentreById,
};