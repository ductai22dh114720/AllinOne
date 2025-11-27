const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const mapRoutes = require("./routes/mapRoutes");
const walletRoutes = require("./routes/walletRoutes");
const passport = require("passport");
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
dotenv.config();
connectDB();

const app = express();

// Passport middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

app.use(express.json());
app.use(cors(corsOptions));

// Mount routers
app.use("/api/services", mapRoutes);
app.use("/api/wallet", walletRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Map Service running on port ${PORT}`));
