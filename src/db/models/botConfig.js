const mongoose = require("mongoose");

const botConfigSchema = new mongoose.Schema(
  {
    setting: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // 沒有定義類型的數據類型
      required: true, 
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true, // 自動加入 createdAt 與 updatedAt 欄位
  }
);

const BotConfig = mongoose.model("BotConfig", botConfigSchema);

module.exports = BotConfig;

// [
//     {
//       setting: "chatId",
//       value: 可以是數字，也能是字串, 不限定類型 // jasper01
//       description: "讓機器人知道發生事情時要通知誰",
//     },
// ]   