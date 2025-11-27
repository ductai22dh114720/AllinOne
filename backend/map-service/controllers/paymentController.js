const crypto = require("crypto");
const qs = require("qs");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");
const Service = require("../models/Service");
const { updateWallet } = require("./walletController");

// VNPAY Configuration (lấy từ biến môi trường)
const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASH_SECRET;
const vnp_Url =
  process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
// URL backend để nhận callback từ VNPAY (vnp_ReturnUrl)
// QUAN TRỌNG: VNPAY không thể truy cập localhost từ internet!
// - Nếu test local: Dùng ngrok để expose localhost (ví dụ: https://abc123.ngrok.io/api/wallet/return)
// - Nếu deploy Render: https://allinone-map-service.onrender.com/api/wallet/return
// - KHÔNG dùng: http://localhost:5002/api/wallet/return (VNPAY không thể gọi được)
const vnp_ReturnUrl =
  process.env.VNP_RETURN_URL || "https://allinone-map-service.onrender.com/api/wallet/return";

// Hàm sort object đúng chuẩn VNPAY
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj)
    .filter((key) => obj[key] !== null && obj[key] !== undefined && obj[key] !== "")
    .sort();

  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

// @desc    Tạo URL thanh toán VNPAY cho nạp tiền
// @route   POST /api/wallet/topup
// @access  Private
exports.createTopupPayment = async (req, res) => {
  try {
    // Kiểm tra cấu hình VNPAY trước khi tiếp tục để tránh lỗi key = undefined
    if (!vnp_TmnCode || !vnp_HashSecret) {
      console.error("VNPAY config error: VNP_TMNCODE or VNP_HASH_SECRET is missing");
      return res.status(500).json({
        message:
          "VNPAY chưa được cấu hình đúng trên server. Vui lòng liên hệ admin để bổ sung VNP_TMNCODE và VNP_HASH_SECRET.",
      });
    }

    const { amount } = req.body;

    if (!amount || amount < 10000) {
      return res.status(400).json({ message: "Số tiền nạp tối thiểu là 10,000 VNĐ" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tạo transaction record
    // Thiết lập timezone giống demo VNPAY
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const date = new Date();
    const moment = require("moment");
    const createDate = moment(date).format("YYYYMMDDHHmmss");

    // Mã đơn hàng theo format demo (có thể tuỳ biến nhưng nên đơn giản)
    const orderId = moment(date).format("DDHHmmss");
    const amountVND = amount * 100; // VNPAY yêu cầu số tiền tính bằng đơn vị đồng * 100

    // Tạo transaction pending
    const transaction = await Transaction.create({
      user: req.user.id,
      type: "topup",
      amount,
      status: "pending",
      description: `Nạp tiền vào ví: ${amount.toLocaleString("vi-VN")} VNĐ`,
      vnp_TxnRef: orderId,
    });

    // Lấy IP giống demo
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket?.remoteAddress ||
      req.connection.socket?.remoteAddress;

    // Một số môi trường local sẽ trả về ::1 (IPv6 localhost), dễ gây lệch so với phía VNPAY
    // Chuẩn hoá về 127.0.0.1 cho giống sample của VNPAY
    if (!ipAddr || ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1") {
      ipAddr = "127.0.0.1";
    }

    // Tạo URL thanh toán VNPAY (theo đúng format demo)
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = vnp_TmnCode;
    vnp_Params["vnp_Amount"] = amountVND;
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = `Nap tien vao vi ${amount.toLocaleString(
      "vi-VN"
    )} VND`;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_ReturnUrl"] = vnp_ReturnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    // Sắp xếp params và tạo secure hash (dùng qs giống demo)
    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    console.log("VNPAY signData =", signData);
    console.log("VNPAY hashSecret =", vnp_HashSecret);
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("VNPAY signed =", signed);
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });
    console.log("VNPAY paymentUrl =", paymentUrl);
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

// @desc    IPN từ VNPAY (server-to-server) - BẮT BUỘC phải trả JSON có RspCode, Message
// @route   GET /api/wallet/ipn
// @access  Public
exports.vnpayIpn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      // Ở đây bạn nên kiểm tra orderId, amount, trạng thái giao dịch trong DB
      // Ví dụ: tìm transaction theo vnp_TxnRef
      const transaction = await Transaction.findOne({ vnp_TxnRef: orderId });
      if (!transaction) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }

      // Nếu giao dịch chưa được cập nhật, tiến hành cập nhật
      if (transaction.status === "pending") {
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
        } else {
          // Thanh toán thất bại
          transaction.status = "failed";
          transaction.vnp_ResponseCode = rspCode;
          await transaction.save();
        }
      }

      // BẮT BUỘC: trả về JSON đúng format để VNPAY không báo lỗi "Sai định dạng dữ liệu"
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    }

    // Sai checksum
    return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
  } catch (error) {
    console.error("Error in VNPAY IPN:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknow error" });
  }
};

// @desc    Callback khi khách quay lại website (vnp_ReturnUrl)
// @route   GET /api/wallet/return
// @access  Public
exports.vnpayCallback = async (req, res) => {
  try {
    console.log("VNPAY Callback received:", req.query);
    let vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      const rspCode = vnp_Params["vnp_ResponseCode"];

      // Chỉ cần redirect về frontend kèm mã code để hiển thị
      const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(
        `${frontendUrl}/wallet?code=${rspCode}&success=${
          rspCode === "00" ? "true" : "false"
        }`
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/wallet?code=97&success=false`);
  } catch (error) {
    console.error("Error in VNPAY return callback:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/wallet?code=99&success=false`);
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
    vnp_Params["vnp_ReturnUrl"] = `${process.env.MAP_SERVICE_URL || process.env.VNP_RETURN_URL || "https://allinone-map-service.onrender.com"}/api/payment/service-callback?serviceId=${serviceId}`;
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

