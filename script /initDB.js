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
      blockExplorer: "https://etherscan.io",
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

};

initDatabase();