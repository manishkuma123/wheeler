require("dotenv").config();
const mongoose = require("mongoose");
const ServiceScope = require("./schema/ServiceScope");

const scopeItems = [
  { scope_id: "sc_01", label: "Collect vehicle from pickup address",    is_mandatory: true,  default_checked: true,  sort_order: 1 },
  { scope_id: "sc_02", label: "Drop at authorised service centre",       is_mandatory: true,  default_checked: true,  sort_order: 2 },
  { scope_id: "sc_03", label: "Collect after service",                   is_mandatory: true,  default_checked: true,  sort_order: 3 },
  { scope_id: "sc_04", label: "Deliver back to delivery address",         is_mandatory: true,  default_checked: true,  sort_order: 4 },
  { scope_id: "sc_05", label: "This is a logistics service only",         is_mandatory: true,  default_checked: true,  sort_order: 5 },
  { scope_id: "sc_06", label: "Actual service done by authorised centre", is_mandatory: false, default_checked: false, sort_order: 6 },
  { scope_id: "sc_07", label: "I pay the service centre bill directly",   is_mandatory: false, default_checked: false, sort_order: 7 },
  { scope_id: "sc_08", label: "Company not liable for mechanical work",   is_mandatory: false, default_checked: false, sort_order: 8 },
];

async function seed() {
     let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'

  await mongoose.connect(db);
  console.log("Connected to MongoDB");
  await ServiceScope.deleteMany({});
  await ServiceScope.insertMany(scopeItems);
  console.log("Seeded 8 service scope items.");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });