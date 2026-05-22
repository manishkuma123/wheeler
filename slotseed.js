require("dotenv").config();
const mongoose = require("mongoose");
const PickupSlot = require('./schema/Pickupslot');
const DeliveryPreference = require("./schema/Deliverypreference");

const slots = [
  { slot_id: "sl_01", label: "Morning",      time_range: "8-10 AM",     sort_order: 1 },
  { slot_id: "sl_02", label: "Late Morning",  time_range: "10 AM-12 PM", sort_order: 2 },
  { slot_id: "sl_03", label: "Afternoon",     time_range: "12-2 PM",     sort_order: 3 },
];

const preferences = [
  { pref_id: "dp_01", label: "As soon as service is done", description: "Immediate delivery after quality check.", sort_order: 1 },
  { pref_id: "dp_02", label: "Evening delivery (5-8 PM)",  description: null, sort_order: 2 },
  { pref_id: "dp_03", label: "Next morning (8-10 AM)",     description: null, sort_order: 3 },
];

async function seed() {
      let db ='mongodb+srv://manishpdotpitchtechnologies_db_user:A6LqD3huz2DBa7d8@cluster0.wnz83zy.mongodb.net/wheeler?retryWrites=true&w=majority'

  await mongoose.connect(db);
  console.log("Connected to MongoDB");

  await PickupSlot.deleteMany({});
  await DeliveryPreference.deleteMany({});

  await PickupSlot.insertMany(slots);
  await DeliveryPreference.insertMany(preferences);

  console.log("Seeded pickup slots and delivery preferences.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});