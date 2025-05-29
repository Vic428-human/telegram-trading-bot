const mongoose = require("mongoose");

const ChainSchema = new mongoose.Schema({
  chainId: {
    type: String,
    required: true,
    unique: true,
  },
  // 鏈的名稱，例如 EVM 鏈 或 Solana，決定要用哪個區塊鏈瀏覽器
  name: {
    type: String,
    required: true,
  },
  // 鏈型別
  type: {
    type: String,
    enum: ["evm", "solana"], // 兩種不同的區塊鏈智能合約執行環境，各自有獨特的架構、設計理念與應用生態
    required: true,
  },
  // 要用哪個去中心化交易所（DEX）
  rpcUrl: {
    type: String,
    required: true,
  },
  // 查詢參數 - chain 字串，例如：https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-token-balances-price?address=0xcB1C1FdE09f811B294172696404e88E658659905&chain=eth&token_addresses=[]
  moralisChainName: {
    type: String,
    required: true,
  },

  // 假設原本舊版本的程式中是使用 chain.explorerUrl 這個屬性名稱，
  // 後來改成了 chain.blockExplorer ，但為了讓舊的 code 還是可以跑，就加上這一行讓 explorerUrl 還是存在。
  // 設想未來因為某些原因，欄位多出了一個叫做 newExplorerUrl 的欄位，用途也是作為區塊鏈瀏覽器的網址，
  // 提供給前端人員調用，即使這位新的開發人員使用的是這個屬性，也不影響 前端 運行，也不會出現錯誤。
  // 當 區塊鏈瀏覽器的網址 改變時，更新 https://etherscanOld.io(舊) 地址，仍然可以導向新地址 https://etherscanNew.io(新)
  // https://etherscanNew.io(新)
  blockExplorer: {
    type: String,
    required: true,
  },
  // https://etherscanOld.io(舊)
  explorerUrl: {
    type: String,
    required: false,
  },
  // 區塊鏈瀏覽器的交易查詢網址範本，通常包含 /tx 和交易雜湊
  explorerTxUrl: {
    type: String,
    required: false,
  },
  // 查詢特定地址的網址範本，通常用於 TG bot 傳送訊息給用戶時，點擊錢包網址會跳轉過去，顯示該地址的詳細資訊
  explorerAddressUrl: {
    type: String,
    required: false,
  },
  // 交換聚合器，可選 1inch 或 jupiter，根據鏈的型別自動選擇預設值
  swapAggregator: {
    type: String,
    enum: ["1inch", "jupiter"],
    required: false, // 設為選填
    default: function () {
      // 根據鏈型別自動設定預設值
      return this.type === "evm" ? "1inch" : "jupiter";
    },
  },
  // 是否啟用
  isActive: {
    type: Boolean,
    default: true,
  },
  // 原生代幣資訊，例如 ETH、SOL 等
  nativeToken: {
    symbol: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: false,
    },
    decimals: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
  },
});

// 新增虛擬屬性，用來產生區塊鏈瀏覽器的交易查詢網址範本
// 利用 Mongoose 的虛擬屬性（virtual），可以像一般屬性一樣取得 getExplorerTxUrl，不需要存進資料庫，讓結構更簡潔
// 這個屬性會根據 explorerTxUrl 欄位或 blockExplorer 自動計算出交易查詢網址範本
ChainSchema.virtual("getExplorerTxUrl").get(function () {
  return this.explorerTxUrl || `${this.blockExplorer}/tx/{hash}`;
});

// 產生區塊鏈瀏覽器的地址查詢網址範本 getExplorerAddressUrl
// 虛擬屬性不會實際儲存在資料庫(例如不能用 find 查詢虛擬屬性的值)，只要設好 type 和 blockExplorer，就能自動獲得正確的地址查詢網址範本
ChainSchema.virtual("getExplorerAddressUrl").get(function () {
  // 如果有自訂的 explorerAddressUrl，就直接回傳
  if (this.explorerAddressUrl) return this.explorerAddressUrl;
  // 如果是 solana 鏈
  if (this.type === "solana") {
    return `${this.blockExplorer}/account/{address}`;
  }
  // 其他鏈（如 Ethereum、BSC 等）
  return `${this.blockExplorer}/address/{address}`;
});

// 取得區塊鏈瀏覽器的主網址
ChainSchema.virtual("getExplorerUrl").get(function () {
  return this.explorerUrl || this.blockExplorer;
});

// 不管是轉 物件 還是轉 JSON ，都能自動帶出虛擬屬性，對開發最友善。
ChainSchema.set("toJSON", { virtuals: true }); // 當你將文件轉成 JSON 時（例如回傳給前端），只要設定 virtuals: true，這些虛擬屬性會出現在輸出的資料中
ChainSchema.set("toObject", { virtuals: true }); // toObject 是文件轉物件的方，轉出來的物件會自動包含所有虛擬屬性

module.exports = mongoose.model("Chain", ChainSchema);


// {
//   "_id": "6655a1b2c3d4e5f678901234",
//   "chainId": "1",
//   "name": "Ethereum Mainnet",
//   "type": "evm",
//   "rpcUrl": "https://mainnet.infura.io/v3/your-infura-key",
//   "moralisChainName": "eth",
//   "blockExplorer": "https://etherscan.io",
//   "explorerUrl": "https://etherscan.io",
//   "explorerTxUrl": "https://etherscan.io/tx/{hash}",
//   "explorerAddressUrl": "https://etherscan.io/address/{address}",
//   "swapAggregator": "1inch",
//   "isActive": true,
//   "nativeToken": {
//     "symbol": "ETH",
//     "name": "Ether",
//     "decimals": 18,
//     "address": "0x0000000000000000000000000000000000000000"
//   },
//   "getExplorerTxUrl": "https://etherscan.io/tx/{hash}", => 查看單筆交易詳細資訊。將 {hash} 替換為特定交易的 hash 值，即可查詢該筆交易的狀態、金額、發送/接收地址等詳細內容
//   "getExplorerAddressUrl": "https://etherscan.io/address/{address}", => 查看特定錢包地址或合約地址的資訊。將 {address} 替換為錢包或智能合約地址，可以查詢該地址的餘額、交易紀錄、持有的代幣等
//   "getExplorerUrl": "https://etherscan.io" => 進入Etherscan 首頁。可用於搜尋任意交易、地址、區塊、合約等，也是進入其他功能頁面的入口
// }


// 假資料模擬情境
// const chain1 = {
//   type: "solana",
//   blockExplorer: "https://explorer.solana.com",
//   // explorerAddressUrl: undefined
// };

// const chain2 = {
//   type: "ethereum",
//   blockExplorer: "https://etherscan.io",
//   // explorerAddressUrl: undefined
// };

// const chain3 = {
//   type: "solana",
//   blockExplorer: "https://custom.solanaexplorer.com",
//   explorerAddressUrl: "https://custom.solanaexplorer.com/user/{address}",
// };
//  {address} => 會帶入 mongoose 定義的欄位值
// console.log(getExplorerAddressUrl(chain2)); // https://etherscan.io/address/{address}
// console.log(getExplorerAddressUrl(chain3)); // https://custom.solanaexplorer.com/user/{address}
