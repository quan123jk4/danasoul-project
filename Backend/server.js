const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const placeRoutes = require("./src/routes/placeRoutes");
const app = express();

app.use(helmet()); // Che giấu thông tin server
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json({ limit: "10kb" })); // Giới hạn dung lượng request gửi lên
app.use(mongoSanitize()); // Chống hack Database

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Bạn đã vượt quá số lần truy cập cho phép, vui lòng thử lại sau!",
});
app.use("/api/", apiLimiter);

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("KẾT NỐI MONGODB BẰNG MONGOOSE THÀNH CÔNG RỰC RỠ!"))
  .catch((err) => {
    console.error(
      " LỖI KẾT NỐI MONGODB. Vui lòng kiểm tra lại file .env:",
      err,
    );
    process.exit(1);
  });

//ROUTES

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/places", placeRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Backend Bọc Thép đang chạy mượt mà cùng Mongoose!",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
