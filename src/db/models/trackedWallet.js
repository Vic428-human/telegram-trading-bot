// src/db/models/trackedWallets.js
const mongoose = require("mongoose");

const trackedWalletSchema = new mongoose.Schema(
  {
    // 錢包地址，我們要追蹤的目標
    address: {
      type: String,
      required: true,
      trim: true,
    },
    chain: {
      type: String,
      required: true,
      trim: true,
    },
    // 名稱與描述（用於顯示用途）
    name: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastChecked: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // 自動加入 created_at 與 updated_at 欄位
  }
);

// 索引可以支援 MongoDB 中查詢的高效執行。如果沒有索引，
// MongoDB 就必須進行集合掃描，也就是掃描集合中的每一個文件，以找出符合查詢條件的文件。
// 如果某個查詢存在合適的索引，MongoDB 就可以利用該索引來減少需要檢查的文件數量。
// 此處建立複合唯一索引，確保 address + chain 的組合是唯一的。
trackedWalletSchema.index({ address: 1, chain: 1 }, { unique: true });

const TrackedWallet = mongoose.model("TrackedWallet", trackedWalletSchema);

module.exports = TrackedWallet;


// 假資料參考
// {
//   "address": "0x1234567890abcdef1234567890abcdef12345678",
//   "chain": "ethereum",
//   "name": "Alice's Wallet",
//   "description": "This wallet is being monitored for transaction activity.",
//   "isActive": true,
//   "lastChecked": "2025-04-04T12:00:00Z"
// }