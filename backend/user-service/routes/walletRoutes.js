const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getWallet } = require("../controllers/walletController");
const {
  createTopupPayment,
  vnpayCallback,
  payService,
  payServiceWithVNPay,
  servicePaymentCallback,
} = require("../controllers/paymentController");

// Tất cả routes đều cần authentication trừ callback
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  getWallet
);

router.post(
  "/topup",
  passport.authenticate("jwt", { session: false }),
  createTopupPayment
);

router.get("/callback", vnpayCallback);

router.post(
  "/pay-service",
  passport.authenticate("jwt", { session: false }),
  payService
);

router.post(
  "/pay-service-vnpay",
  passport.authenticate("jwt", { session: false }),
  payServiceWithVNPay
);

router.get("/service-callback", servicePaymentCallback);

module.exports = router;

