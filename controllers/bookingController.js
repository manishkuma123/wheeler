const Booking        = require("../schema/booking");
const Vehicle        = require("../schema/vehical");
const ServiceType    = require("../schema/servicetype");
const CommonIssue    = require("../schema/commonIssue");
const ServiceCentre  = require("../schema/Service-Centres");
const PickupSlot     = require("../schema/Pickupslot");
const DeliveryPref   = require("../schema/Deliverypreference");
const Brand          = require("../schema/brand");
const VehicleModel   = require("../schema/modeltype");
const ServiceBill    = require("../schema/ServiceBill");
const User           = require("../schema/User.model");
const SLOT_START_TIMES = {
  sl_01: "08:00:00",
  sl_02: "10:00:00",
  sl_03: "12:00:00",
};


function slotStartTime(slotId, timeRange) {
  if (SLOT_START_TIMES[slotId]) return SLOT_START_TIMES[slotId];
  if (timeRange) {
    const match = timeRange.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (match) {
      let hour = parseInt(match[1], 10);
      const min  = match[2] ? parseInt(match[2], 10) : 0;
      const ampm = match[3] ? match[3].toUpperCase() : null;
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`;
    }
  }
  return "08:00:00";
}
async function resolveVehicleDetails(vehicle) {
  let brandName = vehicle.brand_id;
  let modelName = vehicle.model_id;
  try {
    const brand = await Brand.findById(vehicle.brand_id).lean();
    if (brand) brandName = brand.name;
  } catch (_) {}
  try {
    const model = await VehicleModel.findById(vehicle.model_id).lean();
    if (model) modelName = model.name;
  } catch (_) {}
  return { brandName, modelName };
}

const saveBooking = async (req, res) => {
  try {
    const {
      razorpay_payment_id, razorpay_order_id, pay_after_delivery,
      vehicle_id, service_type_id, selected_issue_ids,
      approval_type, threshold_amount, complaint_text,
      centre_id, pickup_address_id, pickup_address,
      delivery_address_id, delivery_address,
      pickup_date, pickup_slot_id, delivery_preference_id,
    } = req.body;

    // ── 1. Required-field validation ────────────────────────────────────────
    const required = {
      vehicle_id, service_type_id, approval_type,
      centre_id, pickup_date, pickup_slot_id, delivery_preference_id,
    };
    for (const [key, val] of Object.entries(required)) {
      if (!val || (typeof val === "string" && !val.trim())) {
        return res.status(400).json({ status: false, message: `'${key}' is required.` });
      }
    }

    const validApproval = ["call_always", "threshold", "custom"];
    if (!validApproval.includes(approval_type)) {
      return res.status(400).json({
        status: false,
        message: `Invalid approval_type. Must be one of: ${validApproval.join(", ")}.`,
      });
    }

    if (approval_type === "threshold" && threshold_amount == null) {
      return res.status(400).json({
        status: false,
        message: "'threshold_amount' is required when approval_type is 'threshold'.",
      });
    }

    if (!pickup_address_id && !pickup_address) {
      return res.status(400).json({
        status: false,
        message: "Either 'pickup_address_id' or 'pickup_address' object is required.",
      });
    }

    if (pickup_address && (!pickup_address.address_line1 || !pickup_address.city || !pickup_address.pincode)) {
      return res.status(400).json({
        status: false,
        message: "'pickup_address' must include address_line1, city, and pincode.",
      });
    }

    if (!pay_after_delivery && (!razorpay_payment_id || !razorpay_order_id)) {
      return res.status(400).json({
        status: false,
        message: "'razorpay_payment_id' and 'razorpay_order_id' are required unless 'pay_after_delivery' is true.",
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickup_date)) {
      return res.status(400).json({ status: false, message: "Invalid pickup_date. Use YYYY-MM-DD." });
    }

    console.log("BODY:", req.body);
console.log("USER:", req.user);
// const found = await Vehicle.findOne({ vehicle_id }).lean();
// console.log("VEHICLE FOUND:", found);
    const [vehicle, serviceType, centre, slot, delivPref] = await Promise.all([
  
      Vehicle.findOne({ _id: vehicle_id }).lean(),
      ServiceType.findOne({ service_type_id, is_active: true }).lean(),
      ServiceCentre.findOne({ centre_id, is_active: true, is_authorised: true, is_registered: true }).lean(),
      PickupSlot.findOne({ slot_id: pickup_slot_id, is_active: true }).lean(),
      DeliveryPref.findOne({ pref_id: delivery_preference_id, is_active: true }).lean(),
    ]);

    if (!vehicle) {
      return res.status(404).json({ status: false, message: "Vehicle not found or does not belong to you." });
    }
    if (!serviceType) {
      return res.status(404).json({ status: false, message: "Invalid or inactive service_type_id." });
    }
    if (!centre) {
      return res.status(404).json({ status: false, message: "Service centre not found, unauthorised, or inactive." });
    }
    if (!slot) {
      return res.status(404).json({ status: false, message: "Invalid or inactive pickup_slot_id." });
    }
    if (!delivPref) {
      return res.status(404).json({ status: false, message: "Invalid or inactive delivery_preference_id." });
    }

    // ── 3. Resolve issue labels from DB ─────────────────────────────────────
    const issueIds = Array.isArray(selected_issue_ids) ? selected_issue_ids : [];
    let issueLabels = [];
    if (issueIds.length > 0) {
      const issues = await CommonIssue.find({ issue_id: { $in: issueIds }, is_active: true }).lean();
      const issueMap = Object.fromEntries(issues.map((i) => [i.issue_id, i.label]));
      issueLabels = issueIds.map((id) => issueMap[id] || id);
    }

    // ── 4. Resolve vehicle brand/model names ────────────────────────────────
    const { brandName, modelName } = await resolveVehicleDetails(vehicle);

    // ── 5. Save booking ─────────────────────────────────────────────────────
    const booking = new Booking({
      razorpay_payment_id: razorpay_payment_id || null,
      razorpay_order_id:   razorpay_order_id   || null,
      pay_after_delivery:  pay_after_delivery  || false,
      payment_status:      pay_after_delivery  ? "pending" : "success",
      amount_paid:         pay_after_delivery  ? 0 : 1249.00,
      user_id:             req.user.id,
      vehicle_id,
      service_type_id,
      selected_issue_ids:  issueIds,
      complaint_text:      complaint_text      || null,
      approval_type,
      threshold_amount:    approval_type === "threshold" ? threshold_amount : null,
      centre_id,
      pickup_address_id:   pickup_address_id   || null,
      pickup_address:      pickup_address      || null,
      delivery_address_id: delivery_address_id || null,
      delivery_address:    delivery_address    || null,
      pickup_date,
      pickup_slot_id,
      delivery_preference_id,
      booking_status: "confirmed",
    });

    await booking.save();

    // ── 6. Build response ───────────────────────────────────────────────────
    const startTime   = slotStartTime(pickup_slot_id, slot.time_range);
    const centreLabel = `${centre.name}, ${centre.address}`;

    return res.status(201).json({
      status:  true,
      message: "Booking saved successfully.",
      data: {
        booking_id:     booking.booking_id,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        amount_paid:    booking.amount_paid,
        currency:       booking.currency,
        created_at:     booking.createdAt,

        vehicle: {
          vehicle_id:          vehicle.vehicle_id,
          brand:               brandName,
          model:               modelName,
          registration_number: vehicle.registration_number,
        },

        service: {
          service_type_id: serviceType.service_type_id,
          title:           serviceType.title,
          issues:          issueLabels,
          centre_name:     centre.name,
          centre_address:  centre.address,
        },

        schedule: {
          pickup_date:         pickup_date,
          pickup_slot:         slot.label,
          delivery_preference: delivPref.label,
        },

        rider_assignment_notice: "Rider assigned 30 min before pickup.",

        calendar_event: {
          title:    "Vehicle Service Pickup",
          start:    `${pickup_date}T${startTime}`,
          location: centreLabel,
        },
      },
    });
  } catch (error) {
    console.error("saveBooking error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};



const getBookingConfirmation = async (req, res) => {
  try {
    const { booking_id } = req.query;

    if (!booking_id || !booking_id.trim()) {
      return res.status(400).json({
        status:  false,
        message: "'booking_id' query parameter is required.",
      });
    }

    // ── 1. Fetch booking scoped to authenticated user ────────────────────────
    const booking = await Booking.findOne({ booking_id, user_id: req.user.id }).lean();

    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found." });
    }

    // ── 2. Parallel DB lookups using IDs stored in the booking ──────────────
    const [vehicle, serviceType, centre, slot, delivPref] = await Promise.all([
      Vehicle.findOne({ vehicle_id: booking.vehicle_id }).lean(),
      ServiceType.findOne({ service_type_id: booking.service_type_id }).lean(),
      ServiceCentre.findOne({ centre_id: booking.centre_id }).lean(),
      PickupSlot.findOne({ slot_id: booking.pickup_slot_id }).lean(),
      DeliveryPref.findOne({ pref_id: booking.delivery_preference_id }).lean(),
    ]);

    // ── 3. Resolve issue labels ──────────────────────────────────────────────
    const issueIds = booking.selected_issue_ids || [];
    let issueLabels = [];
    if (issueIds.length > 0) {
      const issues = await CommonIssue.find({ issue_id: { $in: issueIds } }).lean();
      const issueMap = Object.fromEntries(issues.map((i) => [i.issue_id, i.label]));
      issueLabels = issueIds.map((id) => issueMap[id] || id);
    }

    // ── 4. Resolve vehicle brand/model ───────────────────────────────────────
    const { brandName, modelName } = vehicle
      ? await resolveVehicleDetails(vehicle)
      : { brandName: booking.vehicle_id, modelName: "" };

    // ── 5. Build pickup ISO timestamp ────────────────────────────────────────
    const startTime  = slotStartTime(booking.pickup_slot_id, slot ? slot.time_range : null);
    const pickupTime = `${booking.pickup_date}T${startTime}`;

    // ── 6. Graceful fallbacks if related docs no longer exist ────────────────
    const centreName    = centre      ? centre.name       : booking.centre_id;
    const centreAddress = centre      ? centre.address    : "";
    const slotLabel     = slot        ? slot.label        : booking.pickup_slot_id;
    const delivLabel    = delivPref   ? delivPref.label   : booking.delivery_preference_id;
    const serviceTitle  = serviceType ? serviceType.title : booking.service_type_id;

    return res.status(200).json({
      status: true,
      data: {
        booking_id:     booking.booking_id,
        booking_status: booking.booking_status,
        payment_status: booking.payment_status,
        amount_paid:    booking.amount_paid,
        currency:       booking.currency,
        created_at:     booking.createdAt,

        vehicle: {
          vehicle_id:          booking.vehicle_id,
          brand:               brandName,
          model:               modelName,
          registration_number: vehicle ? vehicle.registration_number : null,
        },

        service: {
          service_type_id: booking.service_type_id,
          title:           serviceTitle,
          issues:          issueLabels,
          complaint_text:  booking.complaint_text || null,
          centre_name:     centreName,
          centre_address:  centreAddress,
        },

        schedule: {
          pickup_date:         booking.pickup_date,
          pickup_time:         pickupTime,
          pickup_slot:         slotLabel,
          delivery_preference: delivLabel,
        },

        approval: {
          approval_type:    booking.approval_type,
          threshold_amount: booking.threshold_amount || null,
        },

        rider_assignment_notice: "Rider will be assigned 30 minutes before pickup.",

        calendar_event: {
          title:    "Vehicle Service Pickup",
          start:    pickupTime,
          location: `${centreName}, ${centreAddress}`,
        },
      },
    });
  } catch (error) {
    console.error("getBookingConfirmation error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};






function to12h(time24) {
  if (!time24) return null;
  const [hStr, mStr = "00"] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0)     h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, "0")}:${mStr} ${ampm}`;
}

async function resolveVehicleDetails(vehicle) {
  let brandName = vehicle.brand_id;
  let modelName = vehicle.model_id;
  try {
    const brand = await Brand.findById(vehicle.brand_id).lean();
    if (brand) brandName = brand.name;
  } catch (_) {}
  try {
    const model = await VehicleModel.findById(vehicle.model_id).lean();
    if (model) modelName = model.name;
  } catch (_) {}
  return { brandName, modelName };
}


const getBookingList = async (req, res) => {
  try {

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip  = (page - 1) * limit;

    const VALID_STATUSES = ["confirmed", "picked_up", "in_service", "completed", "cancelled"];
    const status = req.query.status ? req.query.status.trim() : null;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        status:  false,
        message: `Invalid status filter. Allowed values: ${VALID_STATUSES.join(", ")}.`,
      });
    }

    // ── 2. Build filter & fetch bookings ─────────────────────────────────────
    const filter = { user_id: req.user.id };
    if (status) filter.booking_status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Booking.countDocuments(filter),
    ]);

    if (!bookings.length) {
      return res.status(200).json({
        status: true,
        data:   [],
        pagination: { page, limit, total: 0, total_pages: 0 },
      });
    }

    // ── 3. Batch-fetch all related docs in 4 parallel queries ─────────────────
    const vehicleIds     = [...new Set(bookings.map((b) => b.vehicle_id))];
    const serviceTypeIds = [...new Set(bookings.map((b) => b.service_type_id))];
    const centreIds      = [...new Set(bookings.map((b) => b.centre_id))];
    const slotIds        = [...new Set(bookings.map((b) => b.pickup_slot_id))];

    const [vehicles, serviceTypes, centres, slots] = await Promise.all([
      Vehicle.find({ vehicle_id: { $in: vehicleIds } }).lean(),
      ServiceType.find({ service_type_id: { $in: serviceTypeIds } }).lean(),
      ServiceCentre.find({ centre_id: { $in: centreIds } }).lean(),
      PickupSlot.find({ slot_id: { $in: slotIds } }).lean(),
    ]);

    // Build O(1) lookup maps
    const vehicleMap     = Object.fromEntries(vehicles.map((v) => [v.vehicle_id, v]));
    const serviceTypeMap = Object.fromEntries(serviceTypes.map((s) => [s.service_type_id, s]));
    const centreMap      = Object.fromEntries(centres.map((c) => [c.centre_id, c]));
    const slotMap        = Object.fromEntries(slots.map((s) => [s.slot_id, s]));

    // Resolve brand/model for each unique vehicle (concurrent, result cached by vehicle_id)
    const vehicleNameCache = {};
    await Promise.all(
      vehicles.map(async (v) => {
        const { brandName, modelName } = await resolveVehicleDetails(v);
        vehicleNameCache[v.vehicle_id] = [brandName, modelName].filter(Boolean).join(" ");
      })
    );

    // ── 4. Build response array ───────────────────────────────────────────────
    const data = bookings.map((b) => {
      const vehicle     = vehicleMap[b.vehicle_id]          || null;
      const serviceType = serviceTypeMap[b.service_type_id] || null;
      const centre      = centreMap[b.centre_id]            || null;
      const slot        = slotMap[b.pickup_slot_id]         || null;

      const startTime24 = slotStartTime(b.pickup_slot_id, slot?.time_range);

      return {
        booking_id: b.booking_id,
        vehicle: {
          name:                vehicleNameCache[b.vehicle_id] || b.vehicle_id,
          registration_number: vehicle?.registration_number   || null,
          image:               vehicle?.image_url             || null,
        },
        service_center: centre?.name       || b.centre_id,
        service_type:   serviceType?.title || b.service_type_id,
        booking_date:   b.pickup_date,
        booking_time:   to12h(startTime24),
        status:         b.booking_status,
        logistics_fee:  b.amount_paid,
        currency:       b.currency         || "INR",
      };
    });

    return res.status(200).json({
      status: true,
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getBookingList error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};



const getBookingDetails = async (req, res) => {
  try {
    
    const booking_id = req.query.booking_id?.trim();
    if (!booking_id) {
      return res.status(400).json({
        status:  false,
        message: "'booking_id' query parameter is required.",
      });
    }

    // ── 2. Fetch booking (user-scoped) ────────────────────────────────────────
    const booking = await Booking.findOne({ booking_id, user_id: req.user.id }).lean();
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found." });
    }

    // ── 3. Parallel lookups ───────────────────────────────────────────────────
    const [vehicle, serviceType, centre] = await Promise.all([
      Vehicle.findOne({ vehicle_id: booking.vehicle_id }).lean(),
      ServiceType.findOne({ service_type_id: booking.service_type_id }).lean(),
      ServiceCentre.findOne({ centre_id: booking.centre_id }).lean(),
    ]);

    // ── 4. Resolve vehicle display name ───────────────────────────────────────
    let vehicleName = booking.vehicle_id;
    if (vehicle) {
      const { brandName, modelName } = await resolveVehicleDetails(vehicle);
      vehicleName = [brandName, modelName].filter(Boolean).join(" ");
    }

    // ── 5. Graceful fallbacks ─────────────────────────────────────────────────
    const centreName   = centre?.name       || booking.centre_id;
    const serviceTitle = serviceType?.title || booking.service_type_id;

    // ── 6. Derive status flags ────────────────────────────────────────────────
    const isCompleted = booking.booking_status === "completed";

    // ── 7. Reference number (stored or deterministically generated) ───────────
    const referenceNo = booking.reference_no
      || `RS-${booking.booking_id.replace(/\D/g, "")}-${booking.booking_id.slice(-2).toUpperCase()}`;

    // ── 8. Rider (null until assigned) ────────────────────────────────────────
    //       Stored as an embedded object on the booking doc once a rider is assigned
    const assignedRider = booking.assigned_rider
      ? {
          name:   booking.assigned_rider.name   || null,
          rating: booking.assigned_rider.rating || null,
          image:  booking.assigned_rider.image  || null,
        }
      : null;

    // ── 9. Timeline (embedded array updated by ops/rider actions) ─────────────
    const timeline = Array.isArray(booking.timeline)
      ? booking.timeline.map((e) => ({
          status:       e.status,
          title:        e.title,
          description:  e.description  || null,
          time:         e.time         || null,
          is_completed: Boolean(e.is_completed),
        }))
      : [];

    // ── 10. Vehicle condition images ──────────────────────────────────────────
    const vc     = booking.vehicle_condition || {};
    const before = vc.before || [];
    const after  = vc.after  || [];
    const vehicleCondition = {
      before,
      after,
      total_images: before.length + after.length,
    };

    // ── 11. Fare breakdown ────────────────────────────────────────────────────
    const f = booking.fare || {};
    const fare = {
      distance_km:     f.distance_km     ?? null,
      base_fare:       f.base_fare       ?? null,
      extra_km_charge: f.extra_km_charge ?? 0,
      total_amount:    f.total_amount    ?? booking.amount_paid,
      currency:        booking.currency  || "INR",
      payment_method:  f.payment_method  ?? (booking.pay_after_delivery ? "Pay After Delivery" : null),
    };

    return res.status(200).json({
      status: true,
      data: {
        booking_id:   booking.booking_id,
        reference_no: referenceNo,
        status:       booking.booking_status,
        date:         booking.pickup_date,

        vehicle: {
          name:         vehicleName,
          service_type: serviceTitle,
          image:        vehicle?.image_url || null,
        },

        service_center: {
          name: centreName,
        },

        complaint: booking.complaint_text || null,

        assigned_rider: assignedRider,

        timeline,

        vehicle_condition: vehicleCondition,

        fare,

        invoice: {
          invoice_url: booking.invoice_url || null,
        },

        service_bill: {
          is_uploaded:     Boolean(booking.service_bill_uploaded),
          upload_required: isCompleted && !booking.service_bill_uploaded,
        },

        actions: {
          can_rate:   isCompleted && !booking.is_rated,
          can_rebook: isCompleted,
        },
      },
    });
  } catch (error) {
    console.error("getBookingDetails error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

const getBookingTracking = async (req, res) => {
  try {
    const booking_id = req.query.booking_id?.trim();
    if (!booking_id) {
      return res.status(400).json({
        status: false,
        message: "'booking_id' query parameter is required.",
      });
    }

    const booking = await Booking.findOne({ booking_id, user_id: req.user.id }).lean();
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found." });
    }

    const TRACKABLE_STATUSES = [
      "confirmed", "rider_assigned", "on_the_way",
      "picked_up", "in_service", "approval_pending",
      "approved", "ready_for_delivery", "delivered", "completed",
    ];

    if (!TRACKABLE_STATUSES.includes(booking.booking_status)) {
      return res.status(400).json({
        status: false,
        message: `Booking cannot be tracked in status '${booking.booking_status}'.`,
      });
    }


    const RIDER_ACTIVE_STATUSES = [
      "rider_assigned", "on_the_way", "picked_up",
      "in_service", "approval_pending", "approved",
      "ready_for_delivery", "delivered", "completed",
    ];

    const hasRider = RIDER_ACTIVE_STATUSES.includes(booking.booking_status);

    const rider = hasRider && booking.assigned_rider
      ? {
          name:   booking.assigned_rider.name   || null,
          rating: booking.assigned_rider.rating || null,
          phone:  booking.assigned_rider.phone  || null,
          image:  booking.assigned_rider.image  || null,
        }
      : null;


    const LOCATION_ACTIVE = ["on_the_way", "picked_up"];
    const location = LOCATION_ACTIVE.includes(booking.booking_status) && booking.rider_location
      ? { lat: booking.rider_location.lat, lng: booking.rider_location.lng }
      : null;

    const eta_minutes =
      booking.booking_status === "on_the_way"
        ? (booking.eta_minutes ?? null)
        : null;

    return res.status(200).json({
      status: true,
      data: {
        booking_id:     booking.booking_id,
        status:         booking.booking_status,
        rider,
        location,
        eta_minutes,
      },
    });
  } catch (error) {
    console.error("getBookingTracking error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};


async function resolveVehicleName(vehicle) {
  let brandName = "";
  let modelName = "";
  try {
    const brand = await Brand.findById(vehicle.brand_id).lean();
    if (brand) brandName = brand.name;
  } catch (_) {}
  try {
    const model = await VehicleModel.findById(vehicle.model_id).lean();
    if (model) modelName = model.name;
  } catch (_) {}
  return [brandName, modelName].filter(Boolean).join(" ");
}

const ACTIVE_STATUSES = [
  "confirmed", "rider_assigned", "on_the_way",
  "picked_up", "in_service", "approval_pending",
  "approved", "ready_for_delivery",
];

const STATUS_META = {
  confirmed:          { title: "Booking Confirmed",       cta: "View Details"  },
  rider_assigned:     { title: "Rider Assigned",          cta: "Tap to Track"  },
  on_the_way:         { title: "Rider On the Way",        cta: "Tap to Track"  },
  picked_up:          { title: "Vehicle Picked Up",       cta: "Tap to Track"  },
  in_service:         { title: "Service in Progress",     cta: "Tap to Track"  },
  approval_pending:   { title: "Awaiting Your Approval",  cta: "Review Now"    },
  approved:           { title: "Repair Approved",         cta: "Tap to Track"  },
  ready_for_delivery: { title: "Ready for Delivery",      cta: "Tap to Track"  },
  delivered:          { title: "Vehicle Delivered",       cta: "View Details"  },
  completed:          { title: "Service Completed",       cta: "View Details"  },
};


const getHomeDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── 1. Fetch user, vehicles, active booking, recent bookings in parallel ──
    const [user, vehicles, activeBooking, recentBookings] = await Promise.all([
      User.findById(userId).lean(),

      Vehicle.find({ user_id: userId, is_active: true }).lean(),

      Booking.findOne({ user_id: userId, booking_status: { $in: ACTIVE_STATUSES } })
        .sort({ createdAt: -1 })
        .lean(),

      Booking.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // ── 2. Resolve vehicle names (brand + model) ──────────────────────────────
    const resolvedVehicles = await Promise.all(
      vehicles.map(async (v) => {
        const name = await resolveVehicleName(v);
        return {
          vehicle_id:          v.vehicle_id,
          name:                name || v.vehicle_id,
          registration_number: v.registration_number || null,
          image:               v.image_url           || null,
        };
      })
    );

    
    let activeBookingData = null;
    if (activeBooking) {
      const meta = STATUS_META[activeBooking.booking_status] || {
        title: activeBooking.booking_status,
        cta:   "View Details",
      };
      activeBookingData = {
        booking_id: activeBooking.booking_id,
        status:     activeBooking.booking_status,
        title:      meta.title,
        cta:        meta.cta,
      };
    }

    // ── 4. Build recent_bookings (resolve vehicle name + service title) ────────
    const vehicleIds     = [...new Set(recentBookings.map((b) => b.vehicle_id))];
    const serviceTypeIds = [...new Set(recentBookings.map((b) => b.service_type_id))];

    const [recentVehicles, serviceTypes] = await Promise.all([
      Vehicle.find({ vehicle_id: { $in: vehicleIds } }).lean(),
      ServiceType.find({ service_type_id: { $in: serviceTypeIds } }).lean(),
    ]);

    // Resolve names for recent booking vehicles
    const vehicleNameCache = {};
    await Promise.all(
      recentVehicles.map(async (v) => {
        vehicleNameCache[v.vehicle_id] = await resolveVehicleName(v);
      })
    );

    const serviceTypeMap = Object.fromEntries(
      serviceTypes.map((s) => [s.service_type_id, s.title])
    );

    const recentBookingsData = recentBookings.map((b) => ({
      booking_id:   b.booking_id,
      title:        serviceTypeMap[b.service_type_id] || b.service_type_id,
      vehicle_name: vehicleNameCache[b.vehicle_id]    || b.vehicle_id,
      date:         b.pickup_date                     || null,
      status:       b.booking_status,
    }));

    // ── 5. Respond ────────────────────────────────────────────────────────────
    return res.status(200).json({
      status: true,
      data: {
        user: {
          name: user?.name?.split(" ")[0] || "User",
        },
        active_booking:  activeBookingData,
        vehicles:        resolvedVehicles,
        recent_bookings: recentBookingsData,
      },
    });
  } catch (error) {
    console.error("getHomeDashboard error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};


// ── Upload Service Bill ───────────────────────────────────────────────────────
const uploadServiceBill = async (req, res) => {
  try {
    const booking_id = req.query.booking_id?.trim() || req.body.booking_id?.trim();

    if (!booking_id) {
      return res.status(400).json({
        status:  false,
        message: "'booking_id' is required (query param or body field).",
      });
    }

    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file provided." });
    }

    // ── Verify booking belongs to user ─────────────────────────────────────────
    const booking = await Booking.findOne({ booking_id, user_id: req.user.id });
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found." });
    }

    // ── Build bill record ──────────────────────────────────────────────────────
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const billId    = `bill_${randomNum}`;

    // Cloudinary stores the URL in req.file.path and public_id in req.file.filename
    const fileUrl        = req.file.path;
    const publicId       = req.file.filename;
    const fileSizeBytes  = req.file.size || 0;
    const customName     = req.body.file_name || req.file.originalname || `bill_${randomNum}`;

    // Convert bytes → human-readable
    const fileSizeMB = fileSizeBytes
      ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : null;

    const bill = await ServiceBill.create({
      bill_id:              billId,
      booking_id,
      user_id:              req.user.id,
      file_name:            customName,
      file_url:             fileUrl,
      cloudinary_public_id: publicId,
      file_size_bytes:      fileSizeBytes,
      resource_type:        req.file.resource_type || "image",
    });

    // ── Mark booking as having a bill uploaded ─────────────────────────────────
    booking.service_bill_uploaded = true;
    booking.service_bill_id       = billId;
    await booking.save();

    return res.status(201).json({
      status:  true,
      message: "Service bill uploaded successfully",
      data: {
        bill_id:     bill.bill_id,
        file_name:   bill.file_name,
        file_url:    bill.file_url,
        file_size:   fileSizeMB,
        uploaded_at: bill.createdAt,
      },
    });
  } catch (error) {
    console.error("uploadServiceBill error:", error);
    return res.status(500).json({ status: false, message: "Internal server error." });
  }
};

module.exports = { saveBooking, getBookingConfirmation, getBookingList, getBookingDetails, getBookingTracking, getHomeDashboard, uploadServiceBill };
