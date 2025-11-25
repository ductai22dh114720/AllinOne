const crypto = require("crypto");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const { updateWallet } = require("./walletController");

// VNPAY Configuration
const vnp_TmnCode = process.env.VNP_TMNCODE || "YOUR_TMNCODE";
const vnp_HashSecret = process.env.VNP_HASH_SECRET || "YOUR_HASH_SECRET";
const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = process.env.VNP_RETURN_URL || "http://localhost:5173/wallet/callback";

// @desc    Tạo URL thanh toán VNPAY cho nạp tiền
// @route   POST /api/payment/topup
// @access  Private
exports.createTopupPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 10000) {
      return res.status(400).json({ message: "Số tiền nạp tối thiểu là 10,000 VNĐ" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tạo transaction record
    const date = new Date();
    const createDate = date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "");
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, "")
      .replace("T", "");

    const orderId = `TOPUP_${req.user.id}_${Date.now()}`;
    const amountVND = amount * 100; // VNPAY yêu cầu số tiền tính bằng xu

    // Tạo transaction
    const transaction = await Transaction.create({
      user: req.user.id,
      type: "topup",
      amount,
      status: "pending",
      description: `Nạp tiền vào ví: ${amount.toLocaleString("vi-VN")} VNĐ`,
      vnp_TxnRef: orderId,
    });

    // Tạo URL thanh toán VNPAY
    const vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
    vnp_Params["vnp_Amount"] = amountVND;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = `Nap tien vao vi ${amount.toLocaleString("vi-VN")} VND`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_ReturnUrl"] = vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = req.ip || req.connection.remoteAddress;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = expireDate;

    // Sắp xếp params và tạo secure hash
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const querystring = require("querystring");
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(signData, "utf-8").digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({
      paymentUrl,
      transactionId: transaction._id,
      orderId,
    });
  } catch (error) {
    console.error("Error creating topup payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Xử lý callback từ VNPAY
// @route   GET /api/payment/callback
// @access  Public
exports.vnpayCallback = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sắp xếp và tạo hash để verify
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const querystring = require("querystring");
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const checkSum = hmac.update(signData, "utf-8").digest("hex");

    if (secureHash === checkSum) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      // Tìm transaction
      const transaction = await Transaction.findOne({ vnp_TxnRef: orderId });
      if (!transaction) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?error=transaction_not_found`);
      }

      if (rspCode === "00") {
        // Thanh toán thành công
        transaction.status = "completed";
        transaction.vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];
        transaction.vnp_ResponseCode = rspCode;
        await transaction.save();

        // Cập nhật số dư ví
        const user = await User.findById(transaction.user);
        if (user) {
          user.wallet.balance += transaction.amount;
          await user.save();
        }

        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?success=true`);
      } else {
        // Thanh toán thất bại
        transaction.status = "failed";
        transaction.vnp_ResponseCode = rspCode;
        await transaction.save();

        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?error=payment_failed`);
      }
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?error=invalid_signature`);
    }
  } catch (error) {
    console.error("Error in VNPAY callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/wallet?error=server_error`);
  }
};

// @desc    Thanh toán dịch vụ bằng ví
// @route   POST /api/payment/pay-service
// @access  Private
exports.payService = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const service = await Service.findById(serviceId).populate("provider");
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kiểm tra số dư
    if (user.wallet.balance < service.price) {
      return res.status(400).json({ message: "Số dư ví không đủ" });
    }

    // Tính toán chia lợi nhuận: Admin 30%, Provider 70%
    const adminRevenue = service.price * 0.3;
    const providerRevenue = service.price * 0.7;

    // Trừ tiền từ ví khách hàng
    user.wallet.balance -= service.price;
    await user.save();

    // Tạo payment record
    const payment = await Payment.create({
      user: req.user.id,
      service: serviceId,
      amount: service.price,
      status: "completed",
      providerRevenue,
      adminRevenue,
    });

    // Cộng tiền vào ví provider
    const provider = await User.findById(service.provider._id);
    if (provider) {
      provider.wallet.balance += providerRevenue;
      await provider.save();

      // Tạo transaction cho provider
      await Transaction.create({
        user: provider._id,
        type: "revenue",
        amount: providerRevenue,
        status: "completed",
        description: `Thanh toán dịch vụ: ${service.serviceName}`,
        service: serviceId,
      });
    }

    // Cộng tiền vào ví admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      admin.wallet.balance += adminRevenue;
      await admin.save();

      // Tạo transaction cho admin
      await Transaction.create({
        user: admin._id,
        type: "revenue",
        amount: adminRevenue,
        status: "completed",
        description: `Hoa hồng từ dịch vụ: ${service.serviceName}`,
        service: serviceId,
      });
    }

    // Tạo transaction cho customer
    await Transaction.create({
      user: req.user.id,
      type: "payment",
      amount: service.price,
      status: "completed",
      description: `Thanh toán dịch vụ: ${service.serviceName}`,
      service: serviceId,
    });

    res.json({
      message: "Thanh toán thành công",
      payment,
      newBalance: user.wallet.balance,
    });
  } catch (error) {
    console.error("Error paying service:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Thanh toán dịch vụ bằng VNPAY
// @route   POST /api/payment/pay-service-vnpay
// @access  Private
exports.payServiceWithVNPay = async (req, res) => {
  try {
    const { serviceId } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Dịch vụ không tồn tại" });
    }

    const date = new Date();
    const createDate = date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "");
    const expireDate = new Date(date.getTime() + 15 * 60 * 1000)
      .toISOString()
      .slice(0, 19)
      .replace(/[-:]/g, "")
      .replace("T", "");

    const orderId = `PAY_${req.user.id}_${serviceId}_${Date.now()}`;
    const amountVND = service.price * 100;

    // Tạo payment record
    const payment = await Payment.create({
      user: req.user.id,
      service: serviceId,
      amount: service.price,
      status: "pending",
      vnp_TxnRef: orderId,
    });

    // Tạo URL thanh toán VNPAY
    const vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
    vnp_Params["vnp_Amount"] = amountVND;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = `Thanh toan dich vu ${service.serviceName}`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_ReturnUrl"] = `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/callback?serviceId=${serviceId}`;
    vnp_Params["vnp_IpAddr"] = req.ip || req.connection.remoteAddress;
    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = expireDate;

    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const querystring = require("querystring");
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(signData, "utf-8").digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = vnp_Url + "?" + querystring.stringify(vnp_Params, { encode: false });

    res.json({
      paymentUrl,
      paymentId: payment._id,
      orderId,
    });
  } catch (error) {
    console.error("Error creating service payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Xử lý callback thanh toán dịch vụ từ VNPAY
// @route   GET /api/payment/service-callback
// @access  Public
exports.servicePaymentCallback = async (req, res) => {
  try {
    const { serviceId } = req.query;
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    delete vnp_Params["serviceId"];

    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = vnp_Params[key];
        return acc;
      }, {});

    const querystring = require("querystring");
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const checkSum = hmac.update(signData, "utf-8").digest("hex");

    if (secureHash === checkSum) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      const payment = await Payment.findOne({ vnp_TxnRef: orderId });
      if (!payment) {
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/services/${serviceId}?error=payment_not_found`);
      }

      if (rspCode === "00") {
        payment.status = "completed";
        payment.vnp_TransactionNo = vnp_Params["vnp_TransactionNo"];
        await payment.save();

        const service = await Service.findById(serviceId).populate("provider");
        const adminRevenue = service.price * 0.3;
        const providerRevenue = service.price * 0.7;

        payment.providerRevenue = providerRevenue;
        payment.adminRevenue = adminRevenue;
        await payment.save();

        // Cộng tiền vào ví provider
        const provider = await User.findById(service.provider._id);
        if (provider) {
          provider.wallet.balance += providerRevenue;
          await provider.save();
          await Transaction.create({
            user: provider._id,
            type: "revenue",
            amount: providerRevenue,
            status: "completed",
            description: `Thanh toán dịch vụ: ${service.serviceName}`,
            service: serviceId,
          });
        }

        // Cộng tiền vào ví admin
        const admin = await User.findOne({ role: "admin" });
        if (admin) {
          admin.wallet.balance += adminRevenue;
          await admin.save();
          await Transaction.create({
            user: admin._id,
            type: "revenue",
            amount: adminRevenue,
            status: "completed",
            description: `Hoa hồng từ dịch vụ: ${service.serviceName}`,
            service: serviceId,
          });
        }

        // Tạo transaction cho customer
        await Transaction.create({
          user: payment.user,
          type: "payment",
          amount: payment.amount,
          status: "completed",
          description: `Thanh toán dịch vụ: ${service.serviceName}`,
          service: serviceId,
          vnp_TxnRef: orderId,
          vnp_TransactionNo: vnp_Params["vnp_TransactionNo"],
        });

        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/services/${serviceId}?success=true`);
      } else {
        payment.status = "failed";
        await payment.save();
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/services/${serviceId}?error=payment_failed`);
      }
    } else {
      return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/services/${serviceId}?error=invalid_signature`);
    }
  } catch (error) {
    console.error("Error in service payment callback:", error);
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/services/${serviceId}?error=server_error`);
  }
};

