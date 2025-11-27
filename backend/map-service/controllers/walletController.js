const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Lấy thông tin ví của user
// @route   GET /api/wallet
// @access  Private
exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("wallet");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Lấy lịch sử giao dịch
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("service", "serviceName");

    res.json({
      balance: user.wallet.balance,
      transactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Cập nhật số dư ví (internal use)
// @route   PUT /api/wallet/update
// @access  Private (Admin only hoặc internal)
exports.updateWallet = async (userId, amount, type, description, serviceId = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Tạo transaction record
    const transaction = await Transaction.create({
      user: userId,
      type,
      amount: Math.abs(amount),
      status: "completed",
      description,
      service: serviceId,
    });

    // Cập nhật số dư
    user.wallet.balance += amount;
    await user.save();

    return transaction;
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

