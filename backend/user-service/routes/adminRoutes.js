const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  getUsers,
  getProviders,
  getAdminWallet,
  getStats,
  updateUserRole,
} = require("../controllers/adminController");

// Tất cả routes đều cần authentication và admin role
const adminMiddleware = [
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
    }
    next();
  },
];

router.get("/users", adminMiddleware, getUsers);
router.get("/providers", adminMiddleware, getProviders);
router.get("/wallet", adminMiddleware, getAdminWallet);
router.get("/stats", adminMiddleware, getStats);
router.put("/users/:id/role", adminMiddleware, updateUserRole);

module.exports = router;

