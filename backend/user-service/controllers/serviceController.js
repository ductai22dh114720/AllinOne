const Service = require("../models/Service");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// @desc    Tạo một dịch vụ mới
// @route   POST /api/services
// @access  Private (Chỉ dành cho 'provider')
exports.createService = async (req, res) => {
  // req.user được thêm vào từ middleware xác thực JWT
  if (req.user.role !== "provider") {
    return res
      .status(403)
      .json({ message: "Chỉ có nhà cung cấp mới được tạo dịch vụ" });
  }

  const {
    serviceName,
    description,
    category,
    images,
    address,
    location, // Mong đợi location.coordinates = [kinh độ, vĩ độ]
    price,
    priceUnit,
  } = req.body;

  try {
    // Kiểm tra và tính phí đăng tin (10% của giá dịch vụ)
    const postingFee = price * 0.1;
    const provider = await User.findById(req.user.id);
    
    if (!provider) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // Kiểm tra số dư ví
    if (provider.wallet.balance < postingFee) {
      return res.status(400).json({ 
        message: `Số dư ví không đủ. Cần ${postingFee.toLocaleString("vi-VN")} VNĐ để đăng tin (10% phí đăng tin)` 
      });
    }

    // Trừ phí đăng tin từ ví provider
    provider.wallet.balance -= postingFee;
    await provider.save();

    // Tạo transaction cho phí đăng tin
    await Transaction.create({
      user: req.user.id,
      type: "fee",
      amount: postingFee,
      status: "completed",
      description: `Phí đăng tin dịch vụ: ${serviceName} (10% của ${price.toLocaleString("vi-VN")} VNĐ)`,
    });

    // Cộng phí đăng tin vào ví admin
    const admin = await User.findOne({ role: "admin" });
    if (admin) {
      admin.wallet.balance += postingFee;
      await admin.save();

      await Transaction.create({
        user: admin._id,
        type: "revenue",
        amount: postingFee,
        status: "completed",
        description: `Phí đăng tin từ dịch vụ: ${serviceName}`,
      });
    }

    const service = new Service({
      provider: req.user.id,
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
    // Populate để lấy thông tin 'fullName' của nhà cung cấp thay vì chỉ ID
    const services = await Service.find({}).populate("provider", "fullName");
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
    const service = await Service.findById(req.params.id).populate(
      "provider",
      "fullName email"
    );
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

  // Bán kính tính bằng mét
  const searchRadiusInMeters = parseFloat(radius);

  try {
    const services = await Service.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: searchRadiusInMeters,
        },
      },
    }).populate("provider", "fullName");

    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi máy chủ khi tìm kiếm dịch vụ lân cận" });
  }
};
// @desc    Cập nhật một dịch vụ
// @route   PUT /api/services/:id
// @access  Private (Chỉ chủ sở hữu dịch vụ mới được cập nhật)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    // Kiểm tra xem người dùng có phải là chủ sở hữu của dịch vụ không
    // So sánh ID người dùng (kiểu ObjectId) với ID nhà cung cấp của dịch vụ
    if (service.provider.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ message: "Không được phép cập nhật dịch vụ này" });
    }

    // Cập nhật các trường được gửi lên trong req.body
    // findByIdAndUpdate sẽ trả về document TRƯỚC khi cập nhật, nên cần thêm { new: true }
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Trả về document sau khi đã cập nhật
        runValidators: true, // Chạy lại các validators trong schema
      }
    );

    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật dịch vụ" });
  }
};

// @desc    Xóa một dịch vụ
// @route   DELETE /api/services/:id
// @access  Private (Chỉ chủ sở hữu dịch vụ hoặc admin mới được xóa)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Không tìm thấy dịch vụ" });
    }

    // Kiểm tra quyền: Hoặc là chủ dịch vụ, hoặc là admin
    if (
      service.provider.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Không được phép xóa dịch vụ này" });
    }

    await service.deleteOne(); // Dùng deleteOne() trên document

    res.json({ message: "Dịch vụ đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ khi xóa dịch vụ" });
  }
};
