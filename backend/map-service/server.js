const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const mapRoutes = require("./routes/mapRoutes");
const whitelist = ["http://localhost:3000", "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors(corsOptions));

// Mount router
app.use("/api/services", mapRoutes);

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`Map Service running on port ${PORT}`));
