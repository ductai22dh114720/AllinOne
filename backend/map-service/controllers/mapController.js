const Map = require("../models/Map");

// @desc    Tạo một dịch vụ mới
// @route   POST /api/services
// @access  Private (Cần xác thực từ Gateway sau này)
exports.createService = async (req, res) => {
  // LƯU Ý: Trong cấu trúc microservice, service này tin tưởng thông tin người dùng
  // được gửi đến từ một API Gateway đã xác thực.
  // Chúng ta sẽ giả định req.body chứa 'providerId'.
  const {
    providerId, // Giả sử Gateway gửi ID của người dùng đã xác thực
    serviceName,
    description,
    category,
    images,
    address,
    location,
    price,
    priceUnit,
  } = req.body;

  if (!providerId) {
    return res
      .status(400)
      .json({ message: "Thiếu thông tin nhà cung cấp (providerId)" });
  }

  try {
    const service = new Map({
      providerId,
      serviceName,
      description,
      category,
      images,
      address,
      location: {
        type: "Point",
        coordinates: location.coordinates,
      },
      price,
      priceUnit,
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ khi tạo dịch vụ" });
  }
};

// @desc    Lấy danh sách tất cả các dịch vụ
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    const services = await Map.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// @desc    Lấy thông tin chi tiết của một dịch vụ
// @route   GET /api/services/:id
// @access  Public
exports.getServiceById = async (req, res) => {
  try {
    const service = await Map.findById(req.params.id);
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// @desc    Lấy các dịch vụ trong một bán kính nhất định
// @route   GET /api/services/nearby?lng=...&lat=...&radius=...
// @access  Public
exports.getServicesNearby = async (req, res) => {
  const { lng, lat, radius } = req.query;

  if (!lng || !lat || !radius) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp kinh độ, vĩ độ và bán kính" });
  }

  const searchRadiusInMeters = parseFloat(radius);

  try {
    const services = await Map.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: searchRadiusInMeters,
        },
      },
    });

    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tìm kiếm dịch vụ lân cận" });
  }
};
