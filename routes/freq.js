const express = require("express");
const router = express.Router();
// const { authenticateToken } = require("./auth.middleware");
const { protect } = require("./auth.middleware");


const faqsData = [
  {
    faq_id: "faq_001",
    question: "What exactly does your service do?",
    answer:
      "Velocity Ledger provides ultra-premium courier and logistics solutions for high-value assets...",
    is_active: true,
  },
  {
    faq_id: "faq_002",
    question: "Who services my vehicle?",
    answer: "Our trained professionals handle your vehicle with care.",
    is_active: true,
  },
  {
    faq_id: "faq_003",
    question: "How do I pay?",
    answer: "You can pay via UPI, card, or wallet.",
    is_active: true,
  },
  {
    faq_id: "faq_004",
    question: "What is the delivery time?",
    answer:
      "Delivery times vary based on the service tier selected. Standard delivery takes 2-3 business days.",
    is_active: true,
  },
  {
    faq_id: "faq_005",
    question: "Is my delivery insured?",
    answer:
      "Yes, all deliveries are insured up to the declared value of the shipment.",
    is_active: false,
  },
];


router.get("/", protect, (req, res) => {
  try {
    const { search } = req.query;

    let faqs = faqsData.filter((faq) => faq.is_active === true);

  
    if (search && search.trim() !== "") {
      const keyword = search.trim().toLowerCase();
      faqs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(keyword) ||
          faq.answer.toLowerCase().includes(keyword)
      );
    }

    return res.status(200).json({
      status: true,
      message: "FAQ list fetched successfully",
      data: faqs,
    });
  } catch (error) {
    console.error("FAQ fetch error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: [],
    });
  }
});

module.exports = router;