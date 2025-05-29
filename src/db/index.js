const mongoose = require("mongoose");
require("dotenv").config(); // Dotenv 是一個零依賴模組，它將環境變數從 .env 檔案載入到 process.env 中。

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB 連線中...");
    return true;
  } catch (err) {
    console.error("MongoDB 連線錯誤:", err.message);
    process.exit(1); // 用於立即終止目前 Node.js 進程，退出代碼為 1
  }
};

module.exports = connectDB;