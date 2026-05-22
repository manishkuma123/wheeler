
const mongoose = require("mongoose");
const CommonIssue = require("./schema/commonIssue");

async function seed() {
  let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'

  try {
    await mongoose.connect(db);

    console.log("MongoDB Connected");

    await CommonIssue.deleteMany({});

    await CommonIssue.insertMany([
      {
        issue_id: "iss_01",
        service_type_id: "st_02",
        label: "Engine noise",
      },
      {
        issue_id: "iss_02",
        service_type_id: "st_02",
        label: "Brake issue",
      },
      {
        issue_id: "iss_03",
        service_type_id: "st_02",
        label: "Starting problem",
      },
      {
        issue_id: "iss_04",
        service_type_id: "st_02",
        label: "Mileage drop",
      },
      {
        issue_id: "iss_05",
        service_type_id: "st_02",
        label: "Gear issue",
      },
      {
        issue_id: "iss_06",
        service_type_id: "st_02",
        label: "Routine service",
      },
      {
        issue_id: "iss_07",
        service_type_id: "st_02",
        label: "Body work",
      },
    ]);

    console.log("✅ Common Issues Seeded");

    process.exit();
  } catch (error) {
    console.log("❌ Seed Error:", error);

    process.exit(1);
  }
}

seed();