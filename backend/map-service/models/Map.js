const mongoose = require("mongoose");

const mapSchema = new mongoose.Schema(
  {
    providerId: { type: String, required: true },
    googlePlaceId: { type: String, unique: true, sparse: true }, // ID duy nhất từ Google
    serviceName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Sửa chữa nhà cửa",
        "Gia sư",
        "Vệ sinh",
        "Làm đẹp",
        "Chăm sóc thú cưng",
        "Khác",
      ],
    },
    images: [{ type: String }],
    phone: { type: String },
    website: { type: String },
    openingHours: [String], // Mảng chứa giờ mở cửa các ngày trong tuần
    address: {
      formatted: { type: String }, // Địa chỉ đầy đủ đã được Google chuẩn hóa
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: { type: [Number], required: true }, // [kinh độ, vĩ độ]
    },
    price: { type: Number, default: 0 },
    priceUnit: {
      type: String,
      enum: ["per_hour", "per_day", "fixed"],
      default: "fixed",
    },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mapSchema.index({ location: "2dsphere" });

const Map = mongoose.model("Map", mapSchema);
module.exports = Map;
