const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  createService,
  getServices,
  getServiceById,
  getServicesNearby,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

// Middleware để bảo vệ route, chỉ những ai có token hợp lệ mới truy cập được
const protect = passport.authenticate("jwt", { session: false });

// Định nghĩa các route

//GET / api / services / nearby; //Chức năng tìm kiếm, phải đặt trước /:id để không bị nhầm lẫn
router.get("/nearby", getServicesNearby);

//GET / api / services; //Lấy tất cả dịch vụ (Public)
//POST / api / services; //Tạo dịch vụ mới (Private, Provider only)
router.route("/").get(getServices).post(protect, createService);

// GET /api/services/:id //Lấy chi tiết một dịch vụ (Public)
router.route("/:id").get(getServiceById);

// GET /api/services/:id - Lấy chi tiết một dịch vụ (Public)
// PUT /api/services/:id - Cập nhật dịch vụ (Private)
// DELETE /api/services/:id - Xóa dịch vụ (Private)
router
  .route("/:id")
  .get(getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

module.exports = router;
