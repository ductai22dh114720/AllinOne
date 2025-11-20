const express = require("express");
const router = express.Router();
const {
  createService,
  getServices,
  getServiceById,
  getServicesNearby,
} = require("../controllers/mapController");

// Trong microservice, việc bảo vệ route (protect) thường do API Gateway đảm nhận.
// Ở đây, chúng ta tạm thời để các route mở để dễ dàng test.

// GET /api/services/nearby
router.get("/nearby", getServicesNearby);

// GET /api/services và POST /api/services
router.route("/").get(getServices).post(createService);

// GET /api/services/:id
router.route("/:id").get(getServiceById);

module.exports = router;
