require("dotenv").config();
const connectDB = require("./db");
const ServiceCentre = require("./schema/Service-Centres");

const serviceCentres = [
  {
    centre_id: "sc_001",
    name: "Elite Servicing",
    address: "Koramangala, Sector 4",
    area: "Koramangala",
    pincode: "560034",
    location: { type: "Point", coordinates: [77.6245, 12.9352] },
    is_authorised: true,
    is_registered: true,
    is_active: true,
    operating_hours: "9 AM - 7 PM",
    rating: 4.8,
    review_count: 120,
    centre_image: "https://cdn.app.com/centres/sc_001.jpg",
  },
  {
    centre_id: "sc_002",
    name: "AutoCare Hub",
    address: "Indiranagar, 12th Main",
    area: "Indiranagar",
    pincode: "560038",
    location: { type: "Point", coordinates: [77.6408, 12.9784] },
    is_authorised: true,
    is_registered: true,
    is_active: true,
    operating_hours: "8 AM - 6 PM",
    rating: 4.5,
    review_count: 95,
    centre_image: "https://cdn.app.com/centres/sc_002.jpg",
  },
  {
    centre_id: "sc_003",
    name: "Swift Motors",
    address: "HSR Layout, Sector 2",
    area: "HSR Layout",
    pincode: "560102",
    location: { type: "Point", coordinates: [77.6376, 12.9116] },
    is_authorised: true,
    is_registered: true,
    is_active: true,
    operating_hours: "9 AM - 8 PM",
    rating: 4.6,
    review_count: 210,
    centre_image: "https://cdn.app.com/centres/sc_003.jpg",
  },
  {
    centre_id: "sc_004",
    name: "Prestige Auto Works",
    address: "Whitefield, ITPL Road",
    area: "Whitefield",
    pincode: "560066",
    location: { type: "Point", coordinates: [77.7480, 12.9698] },
    is_authorised: true,
    is_registered: true,
    is_active: true,
    operating_hours: "10 AM - 7 PM",
    rating: 4.3,
    review_count: 78,
    centre_image: "https://cdn.app.com/centres/sc_004.jpg",
  },
  {
    // Unregistered — should NOT appear in results
    centre_id: "sc_005",
    name: "Roadside Repairs",
    address: "BTM Layout",
    area: "BTM Layout",
    pincode: "560076",
    location: { type: "Point", coordinates: [77.6146, 12.9165] },
    is_authorised: false,
    is_registered: false,
    is_active: true,
    operating_hours: "8 AM - 9 PM",
    rating: 3.2,
    review_count: 30,
    centre_image: "https://cdn.app.com/centres/sc_005.jpg",
  },
];

const seedDB = async () => {
  try {
     let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'

    await connectDB(db);
    await ServiceCentre.deleteMany({});
    console.log("Existing service centres cleared.");
    await ServiceCentre.insertMany(serviceCentres);
    console.log(`${serviceCentres.length} service centres seeded.`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
};

seedDB();