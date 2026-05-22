const PickupSlot = require("../schema/Pickupslot");
const DeliveryPreference = require("../schema/Deliverypreference");
const SlotAvailability = require("../schema/slotAvailabilitySchema");


const getAvailableSlots = async (req, res) => {
  try {
    const { date, centre_id } = req.query;

    if (!date || !centre_id) {
      return res.status(400).json({
        status: false,
        message: "Both 'date' and 'centre_id' query parameters are required.",
      });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        status: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(date);
    if (requestedDate < today) {
      return res.status(400).json({
        status: false,
        message: "Cannot fetch slots for a past date.",
      });
    }

    
    const [allSlots, blockedSlots, deliveryPreferences] = await Promise.all([
      PickupSlot.find({ is_active: true }).sort({ sort_order: 1 }).lean(),
      SlotAvailability.find({
        centre_id,
        date,
        is_blocked: true,
      })
        .select("slot_id")
        .lean(),
      DeliveryPreference.find({ is_active: true }).sort({ sort_order: 1 }).lean(),
    ]);

    if (allSlots.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No pickup slots configured.",
      });
    }


    const blockedSlotIds = new Set(blockedSlots.map((b) => b.slot_id));

  
    const pickup_slots = allSlots.map((slot) => ({
      slot_id: slot.slot_id,
      label: slot.label,
      time_range: slot.time_range,
      is_available: !blockedSlotIds.has(slot.slot_id),
    }));


    const delivery_preferences = deliveryPreferences.map((pref) => ({
      pref_id: pref.pref_id,
      label: pref.label,
      description: pref.description || null,
    }));

    return res.status(200).json({
      status: true,
      data: {
        date,
        pickup_slots,
        delivery_preferences,
      },
    });
  } catch (error) {
    console.error("getAvailableSlots error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { getAvailableSlots };