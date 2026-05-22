
const mongoose = require("mongoose");
const ServiceType = require("./schema/servicetype");

async function seed() {
     let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'

  try {
    await mongoose.connect(db);

    console.log("Connected to DB");

    await ServiceType.deleteMany({});

    await ServiceType.insertMany([
      {
        service_type_id: "st_01",
        title: "Regular/Periodic Service",
        description:
          "Routine check-ups, oil changes, and preventive maintenance.",
        icon: "calendar",
        is_active: true,
      },
      {
        service_type_id: "st_02",
        title: "Specific Complaint or Repair",
        description:
          "Fixing specific noises, engine issues, or mechanical failures.",
        icon: "wrench",
        is_active: true,
      },
      {
        service_type_id: "st_03",
        title: "Accidental Repair",
        description:
          "Insurance claims and restoring damage from road accidents.",
        icon: "shield",
        is_active: true,
      },
      {
        service_type_id: "st_04",
        title: "Other",
        description:
          "Cleaning, custom modifications, or unlisted requirements.",
        icon: "dots",
        is_active: true,
      },
    ]);

    console.log("✅ Seed Data Inserted Successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
}

seed();