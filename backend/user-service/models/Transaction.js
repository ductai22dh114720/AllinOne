const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["topup", "payment", "refund", "fee", "revenue"],
      required: true,
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
    description: {
      type: String,
    },
    // Cho thanh toán dịch vụ
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    // Cho VNPAY
    vnp_TxnRef: {
      type: String,
    },
    vnp_TransactionNo: {
      type: String,
    },
    vnp_ResponseCode: {
      type: String,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;

