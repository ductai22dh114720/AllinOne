const User = require("../models/User");
const Service = require("../models/Service");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payment");

// @desc    Lấy danh sách tất cả users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }

    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Lấy danh sách providers
// @route   GET /api/admin/providers
// @access  Private (Admin only)
exports.getProviders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }

    const providers = await User.find({ role: "provider" }).select("-password");
    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Lấy thông tin ví admin
// @route   GET /api/admin/wallet
// @access  Private (Admin only)
exports.getAdminWallet = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }

    const admin = await User.findById(req.user.id).select("wallet");
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("service", "serviceName");

    res.json({
      balance: admin.wallet.balance,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching admin wallet:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Lấy thống kê tổng quan
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }

    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalProviders = await User.countDocuments({ role: "provider" });
    const totalServices = await Service.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: "completed" });
    
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$adminRevenue" } } },
    ]);

    res.json({
      totalUsers,
      totalProviders,
      totalServices,
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Cập nhật role của user
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }

    const { role } = req.body;
    if (!["customer", "provider", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

