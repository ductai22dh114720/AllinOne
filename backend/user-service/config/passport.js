const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models/User");
require("dotenv").config();

module.exports = function (passport) {
  // === Cấu hình Local Strategy (dùng cho đăng nhập) ===
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Tìm user trong DB bằng email
          const user = await User.findOne({ email: email.toLowerCase() });

          // Nếu không tìm thấy user
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          // Nếu user không có mật khẩu (tức là đăng ký qua social)
          if (!user.password) {
            return done(null, false, {
              message:
                "You have registered using a social account. Please log in with that method.",
            });
          }

          // Nếu tìm thấy, so sánh mật khẩu
          const isMatch = await user.matchPassword(password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Mọi thứ đều đúng, trả về user
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // === Cấu hình JWT Strategy (dùng để bảo vệ route) ===
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Trích xuất token từ header 'Authorization: Bearer TOKEN'
  opts.secretOrKey = process.env.JWT_SECRET; // Sử dụng secret key từ file .env

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // jwt_payload chứa thông tin đã được mã hóa trong token (ở đây là id)
        const user = await User.findById(jwt_payload.id).select("-password"); // Bỏ qua trường password

        if (user) {
          return done(null, user); // Nếu tìm thấy user, trả về user
        } else {
          return done(null, false); // Nếu không, trả về false
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};
