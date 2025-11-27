const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const passport = require("passport");
const serviceRoutes = require("./routes/serviceRoutes");
const walletRoutes = require("./routes/walletRoutes");
const adminRoutes = require("./routes/adminRoutes");
const whitelist = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://sandbox.vnpayment.vn", // Cho phép VNPAY gọi callback
];
const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép requests không có origin (như redirect từ VNPAY) hoặc từ whitelist
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

// Firebase Admin Config
require("./config/firebaseAdmin");
// Body parser
app.use(express.json());

// Enable CORS
app.use(cors(corsOptions));

// Mount routers
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
