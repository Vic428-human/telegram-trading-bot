const mongoose = require("mongoose");
const Chain = require("../src/db/models/chains");
require("dotenv").config();

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB 已連線");

    // 初始化 鏈 的資料庫
    await initChains();

   
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
};


const initBotConfig = async() => {
   Chain.countDocuments()
}

const initChains = async () => {
  // countDocuments() 函數用於統計資料庫集合中符合篩選器的文件數量 => 沒計算到 = 資料庫還不存在
  const chainCount = await Chain.countDocuments();

  if (chainCount > 0) {
    console.log("鏈的資料庫已初始化...");
    return;
  }

  // 如果集合中不存在任何文檔   
  console.log("初始化鏈資料庫...");

  // 根據需求選擇在不同的 EVM 相容鏈上部署應用或進行交易
  // solana 跟 base 是不同區塊網路，主要是因為 來自於兩個不同生態系，底層技術、智能合約語言和帳戶模型完全不同。
  // 後續維護添加的時候，記得用生態系做區分  
  const defaultChains = [
    // EVM 生態系
    {
      chainId: "eth",
      name: "Ethereum", // 區塊鏈網路
      type: "evm", // 代表是 EVM 相容鏈，都有自己的 chainId，例如以太坊主網是 1，Polygon 是 137，這個值用來區分『不同的網路』，防止交易或資產跨鏈混淆
      rpcUrl: process.env.ETH_RPC_URL || "https://ethereum.publicnode.com",
      blockExplorer: "https://etherscan.io", // 區塊瀏覽器
      swapAggregator: "1inch",
      isActive: true,
      nativeToken: {
        symbol: "ETH",
        name: "Ether",
        decimals: 18,
        address: "0x0000000000000000000000000000000000000000", // Zero address represents native token
      },
      moralisChainName: "eth",
    },
    {
      chainId: "base", // polygon / base / eth 不同的區塊鏈網路，它們都屬於「EVM 相容鏈」。
      name: "Base",
      type: "evm",
      rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      blockExplorer: "https://basescan.org",
      swapAggregator: "1inch",
      isActive: true,
      nativeToken: {
        symbol: "ETH",
        name: "Ether",
        decimals: 18,
        address: "0x4200000000000000000000000000000000000006", // Base's native ETH address
      },
      moralisChainName: "base",
    },
    {
      chainId: "polygon",
      name: "Polygon", 
      type: "evm", // 相容鏈指的是這些鏈的底層運作方式和以太坊一樣，可以直接執行以太坊的智能合約程式碼。這讓開發者可以用相同的工具和語言（如 Solidity），把應用部署到不同的鏈上，而用戶也能用同一個錢包地址操作多條鏈上的資產
      rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
      blockExplorer: "https://polygonscan.com",
      swapAggregator: "1inch",
      isActive: true,
      nativeToken: {
        symbol: "MATIC",
        name: "Matic",
        decimals: 18,
        address: "0x0000000000000000000000000000000000001010", // Polygon's native MATIC address
      },
      moralisChainName: "polygon",
    },
    // Solana 生態系
    {
      chainId: "solana",
      name: "Solana",
      type: "solana",
      rpcUrl:
        process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
      blockExplorer: "https://solscan.io",
      swapAggregator: "jupiter",
      isActive: true,
      nativeToken: {
        symbol: "SOL",
        name: "Solana",
        decimals: 9,
        address: "So11111111111111111111111111111111111111112", // Solana's wrapped SOL address
      },
      moralisChainName: "solana",
    },
  ];

  // 如果需要處理每一個元素但不需要結果陣列 → 用 forEach ， 不會用到 return 
  // 如果需要把原陣列轉換成另一種形式的陣列 → 用 map ，會用到 return 
  // Etherscan 上某一筆交易的 hash 範本 => https://etherscan.io/tx/0x2fdefc8de9b3eb113a5741111d0b1b90f90a0c7d3c5e0b153b25c27f550ba7a3
  defaultChains.forEach((chain)=>{
    // 如果未來有不同版本的舊網址就依序在此處新增即可。 參 chais.js 裡的 blockExplorer 回顧上方註解
    chain.explorerUrl = chain.blockExplorer;
    // 根據不同的區塊鏈環境去設定 1.某個特定 錢包地址的網址 或是 2.某個 特定交易的網址
    if(type === "solana"){
      chain.explorerTxUrl = `${chain.blockExplorer}/tx/{hash}`
      chain.explorerAddressUrl = `${chain.blockExplorer}/address/{address}`
    }else{
      chain.explorerTxUrl = `${chain.blockExplorer}/tx/{hash}`
      chain.explorerAddressUrl = `${chain.blockExplorer}/address/{address}`
    }
  })
  Chain.insertMany(defaultChains)
  console.log(`Chain collection ${Chain.length} documents added`);
};

initDatabase();


// insertMany 和 create 在 Mongoose 中都可以用來新增文件（documents）到集合
// （collection）中 ，但它們在使用方式和底層行為上有一些差異。以下是詳細比較：

// 小結：怎麼選？
// 如果你需要：
// 觸發 save 鉤子（hook）
// 驗證 schema 驗證規則
// 得到 document 實例（可用 methods）
// → 請使用 create()
// 使用 create() 的回傳值（Document 實例）：
// [
//   MongooseDocument {
//     _id: ObjectId("..."),
//     name: 'Alice',
//     age: 25,
//     __v: 0,
//     isNew: false,
//     save: [Function: save],
//     validateSync: [Function: validateSync]
//   },
//   ...
// ]


// =================
// 如果你需要：
// 快速大量插入資料
// 不需要驗證或 hook
// 效能優先
// → 請使用 insertMany()
// User.insertMany([{ name: 'Alice' }]);
// 使用 insertMany() 的回傳值（純 JS 物件）： BSON
// [
//   {
//     _id: ObjectId("..."),
//     name: 'Alice',
//     age: 25,
//     __v: 0
//   },
//   ...
// ]
