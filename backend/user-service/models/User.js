const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String },
    role: {
      type: String,
      enum: ["customer", "provider", "admin"],
      default: "customer",
    },
    // (TÙY CHỌN NHƯNG RẤT NÊN CÓ) Thêm một trường để biết phương thức xác thực
    authProvider: {
      type: String,
      enum: ["local", "google", "facebook"], // Thêm các nhà cung cấp khác nếu cần
      default: "local",
    },
    firebaseUid: {
      // Lưu UID từ Firebase để liên kết
      type: String,
      unique: true,
      sparse: true,
    },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      language: { type: String, default: "vi" },
      // Bạn có thể thêm các cài đặt khác ở đây
    },
  },
  { timestamps: true }
);

// Hash password trước khi lưu vào DB
// Logic này vẫn đúng vì nó chỉ chạy khi password được thay đổi
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Thêm method để so sánh password
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Nếu user không có password (đăng ký qua social), luôn trả về false
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
