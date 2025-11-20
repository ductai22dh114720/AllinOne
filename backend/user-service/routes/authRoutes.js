const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  registerUser,
  signInUser,
  getUserProfile,
  socialLogin,
} = require("../controllers/authController");

// Route đăng ký không thay đổi
router.post("/register", registerUser);

// Route đăng nhập bây giờ sẽ dùng passport.authenticate('local')
// Nó sẽ tự động xử lý logic tìm user, so sánh password
router.post(
  "/signin",
  passport.authenticate("local", { session: false }),
  signInUser
);
//Route đăng nhập bằng mạng xã hội
router.post("/social-signin", socialLogin);

// Route mới được bảo vệ bởi JWT
// Chỉ những ai gửi kèm token hợp lệ mới có thể truy cập
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  getUserProfile
);

module.exports = router;
