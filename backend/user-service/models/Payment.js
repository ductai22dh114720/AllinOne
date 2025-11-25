const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    // VNPAY transaction reference
    vnp_TxnRef: {
      type: String,
    },
    vnp_TransactionNo: {
      type: String,
    },
    // Revenue split
    providerRevenue: {
      type: Number, // 70% của amount
    },
    adminRevenue: {
      type: Number, // 30% của amount
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;

