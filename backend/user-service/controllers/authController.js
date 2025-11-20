const User = require("../models/User");
const jwt = require("jsonwebtoken");
const admin = require("../config/firebaseAdmin");
require("dotenv").config();

// Hàm tạo token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token hết hạn sau 30 ngày
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      authProvider: "local",
    });

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/signin
// @access  Public
exports.signInUser = async (req, res) => {
  // Vì đã qua middleware của passport-local, nếu request đến được đây
  // nghĩa là username/password đã đúng.
  // Passport đã gắn user vào req.user.
  const user = req.user;

  res.json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    token: generateToken(user._id),
  });
};

// @desc    Lấy thông tin profile của user
// @route   GET /api/auth/profile
// @access  Private (Được bảo vệ)
exports.getUserProfile = async (req, res) => {
  // Middleware passport-jwt đã xác thực token và gắn user vào req.user
  // Chúng ta chỉ cần trả về thông tin đó
  res.json({
    id: req.user.id,
    fullName: req.user.fullName,
    email: req.user.email,
  });
};

// ================================================================
// @desc    Xử lý đăng nhập qua mạng xã hội
// @route   POST /api/auth/social-signin
// @access  Public
// ================================================================
exports.socialLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Firebase ID token is required." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture, uid } = decodedToken;
    const provider = decodedToken.firebase.sign_in_provider;

    // Nếu không có email, không thể tạo tài khoản -> trả về lỗi
    if (!email) {
      return res.status(400).json({
        message: `Your ${provider} account does not have a verified email address. Please add an email to your account or try another login method.`,
      });
    }
    let user = await User.findOne({ email });

    if (!user) {
      // Nếu không có, tạo người dùng mới
      user = await User.create({
        email,
        fullName: name,
        firebaseUid: uid,
        authProvider: provider.replace(".com", ""), // Ví dụ
      });
    }

    // Trả về token của hệ thống bạn
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Error in social login:", error);
    res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};
