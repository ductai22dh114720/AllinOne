const express = require("express");
const router = express.Router();
const passport = require("passport");
const { getWallet } = require("../controllers/walletController");
const {
  createTopupPayment,
  vnpayCallback,
  vnpayIpn,
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

// Callback khi khách quay lại (vnp_ReturnUrl) - không cần auth
router.get("/return", vnpayCallback);

// IPN từ VNPAY (server-to-server) - không cần auth, phải trả JSON
router.get("/ipn", vnpayIpn);

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

