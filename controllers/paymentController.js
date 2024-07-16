const PaymentHistory = require("../models/PaymentHistory");

const getAllPaymentDetails = async (req, res) => {
  try {
    const payments = await PaymentHistory.findAll();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllPaymentDetails };
