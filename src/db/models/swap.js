const mongoose = require("mongoose");

const swapSchema = new mongoose.Schema(
  {
    // 完整追蹤每一筆 Swap 交易 : 
    // 記錄了來源錢包、來源鏈、來源交易雜湊、時間戳等資訊，確保每一筆 Swap 都能被唯一識別並追蹤。
    sourceWallet: { // 來源錢包
      type: String,
      required: true,
      trim: true,
    },
    sourceChain: { // 來源鏈
      type: String,
      required: true,
      trim: true,
    },
    sourceTxHash: { // 來源交易雜湊
      type: String,
      required: true,
      trim: true,
    }, 
    sourceTimestamp: { // 時間戳
      type: Date,
      required: true,
    },

    // 支持多種代幣與鏈的兌換紀錄 : 
    // 透過 tokenIn 與 tokenOut 的設計，可以靈活記錄任意兩種代幣之間的兌換，包括代幣地址、符號、名稱、數量及精度。
    tokenIn: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      symbol: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: String,
        required: true,
      },
      decimals: {
        type: Number,
        required: true,
      },
    },
    tokenOut: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      symbol: {
        type: String,
        required: true,
        trim: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: String,
        required: true,
      },
      decimals: {
        type: Number,
        required: true,
      },
    },

    // 兌換的美元價值（用於報表）=> 內建 usdValue 欄位，方便後續進行財務報表、用戶行為分析或營運數據統計。
    usdValue: {
      type: Number,
      required: true,
      default: 0,
    },

    // 交易所與流動性池資訊
    // exchangeInfo 可記錄交易所名稱、地址與交易對地址，方便後續對接不同交易所或流動性池的數據對應欄位
    exchangeInfo: {
      name: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        trim: true,
        default: "",
      },
      pairAddress: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // 處理狀態管理 :
    // 包含 processed、processingTimestamp、ourTxHash 以及 status 欄位，支援交易處理流程的狀態追蹤（如待處理、已完成、失敗、跳過、已提交），有助於自動化處理與異常監控。
    // 對應欄位：
    processed: {
      type: Boolean,
      default: false,
    },
    processingTimestamp: {
      type: Date,
      default: null,
    },
    ourTxHash: {
      type: String,
      trim: true,
      default: null,
    },
    status: { // https://support.blockchain.com/hc/en-us/articles/4417062975124-What-does-my-Swap-order-status-mean
      code: {
        type: String,
        enum: ["pending", "completed", "failed", "skipped", "submitted"], 
        default: "pending",
      },
      message: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true, // 自動加入 createdAt 與 updatedAt 欄位
  }
);

// 加入索引以提升查詢效能
swapSchema.index(
  { sourceWallet: 1, sourceChain: 1, sourceTxHash: 1 },
  { unique: true }
);
swapSchema.index({ processed: 1, "status.code": 1 });
swapSchema.index({ sourceTimestamp: 1 });

const Swap = mongoose.model("Swap", swapSchema);

module.exports = Swap;


// {
//   "sourceWallet": "0xA1B2c3D4e5F678901234567890abcdef12345678",
//   "sourceChain": "Ethereum",
//   "sourceTxHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
//   "sourceTimestamp": "2025-05-28T15:30:00.000Z",
//   "tokenIn": {
//     "address": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
//     "symbol": "DAI",
//     "name": "Dai Stablecoin",
//     "amount": "100.00",
//     "decimals": 18
//   },
//   "tokenOut": {
//     "address": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//     "symbol": "WETH",
//     "name": "Wrapped Ether",
//     "amount": "0.025",
//     "decimals": 18
//   },
//   "usdValue": 100.0,
//   "exchangeInfo": {
//     "name": "Uniswap V3",
//     "address": "0x1F98431c8aD98523631AE4a59f267346ea31F984",
//     "pairAddress": "0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8"
//   },
//   "processed": true,
//   "processingTimestamp": "2025-05-28T15:31:00.000Z",
//   "ourTxHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
//   "status": {
//     "code": "completed",
//     "message": "Swap successfully processed"
//   },
//   "createdAt": "2025-05-28T15:30:01.000Z",
//   "updatedAt": "2025-05-28T15:31:05.000Z"
// }
