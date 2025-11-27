const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    // Tham chiếu đến người dùng đã tạo dịch vụ này (nhà cung cấp)
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Liên kết đến User model
    },
    serviceName: {
      type: String,
      required: [true, "Vui lòng nhập tên dịch vụ"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Vui lòng nhập mô tả cho dịch vụ"],
    },
    category: {
      type: String,
      required: [true, "Vui lòng chọn danh mục cho dịch vụ"],
      // Ví dụ về các danh mục, bạn có thể mở rộng sau
      enum: [
        "Sửa chữa nhà cửa",
        "Gia sư",
        "Vệ sinh",
        "Làm đẹp",
        "Chăm sóc thú cưng",
        "Khác",
      ],
    },
    images: [
      {
        type: String, // Mảng các URL hình ảnh
      },
    ],
    // Kết hợp thông tin từ Address và Location
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    // Trường GeoJSON để tìm kiếm vị trí
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [kinh độ, vĩ độ]
        required: true,
      },
    },
    // Các thông tin khác
    price: {
      type: Number,
      required: [true, "Vui lòng nhập giá dịch vụ"],
    },
    priceUnit: {
      type: String,
      enum: ["per_hour", "per_day", "fixed"],
      default: "fixed",
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Tạo chỉ mục 2dsphere để tối ưu hóa truy vấn địa lý
serviceSchema.index({ location: "2dsphere" });

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;

