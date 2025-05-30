const mongoose = require("mongoose");
const Chain = require("../src/db/models/chains");
const BotConfig = require("../src/db/models/botConfig");
require("dotenv").config();

const initDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB 已連線");

    // // 初始化 鏈 的資料庫
    await initChains();
    // // 初始化 機器人 配置
    await initBotConfig(); 

    // 一旦exit(0)調用，控制權將不會返回到調用該函數的地方，也不會執行該函數之後的任何程式碼，
    // 包括相同執行緒中的其他函數或任何尚未執行的清理工作
    process.exit(0); // 一般來說代表執行正確
   
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1); // 一般來說代表執行錯誤
  }
};


// 後續升級或維護考量
// 有可能之後會新增新的「必要設定」。
// 若直接用 defaultConfig 覆蓋，可能會影響已經存在的設定（例如用戶自訂的值被覆蓋）。
// 使用 requiredSettings 只會補齊缺少的設定
// 安全性：不會覆蓋用戶已經設定好的值。
// 擴展性：未來新增設定時，只要加到 requiredSettings，升級時自動補齊。
// 效率：初次啟動一次插入，之後只補缺。
const initBotConfig = async() => {
  const configCount = await Chain.countDocuments()

  if(configCount > 0) {
    console.log("機器人配置已初始化...")
    
     // 用途：當資料庫完全沒有任何設定時（也就是第一次啟動或資料被清空時），一次性建立所有預設設定。
    const defaultConfig = [
      {setting: "botStatus",value: "running", description:"機器人狀態"},
      {setting: "notifyOnfailed",value: true, description:"通知Swap失敗"},
    ]

    for (const config of defaultConfig){
      // 確認 default 是否存在
      // .exec() 會強制執行查詢並返回一個原生 Promise，這在需要與 async/await 或其他 Promise-based 函式庫整合時特別有用
      // exec()用法 =>  https://stackoverflow.com/questions/73093294/how-to-save-a-query-from-model-findone-on-a-variable-using-mongoose
      // 如果只是簡單 await 查詢，且不在意 Promise 純度或堆疊追蹤，也可以不加 .exec()，Mongoose 會自動執行查詢並返回結果。
      const exists = await BotConfig.findOne({setting: config.setting}) // 不加 .exec() 時，Mongoose 查詢物件本身也有 .then() 方法，能直接用於 async/await，但它返回的是一個「類 Promise」的 Mongoose 查詢對象，而不是標準的原生 Promise
      
      if(!exists){
        await BotConfig.create(config);
        console.log(`添加缺少的機器人配置,${config.setting}`);
      }
    }
    return;
  }

  console.log("已初始化預設的機器人配置...")

    // 用途：當資料庫已經有一些設定，但不確定是否有所有「必要設定」時，檢查並補齊缺少的設定。
    const requireConfig = [
      {setting: "botStatus",value: "running", description:"機器人狀態"},
      {setting: "notifyOnfailed",value: true, description:"通知Swap失敗"},
      // 當環境變數有另外設定時，假設我希望通知發給特定使用者(chatID)，就會需要彈性配置
      ...(process.env.ADMIN_CHAT_ID ? [{setting: "chatId",value: process.env.ADMIN_CHAT_ID,   description:`用於接收機器人通知的主要聊天室ID`}] : []),
    ]

    // 把實際上必要的欄位都存在DB
    await BotConfig.insertMany(requireConfig);
    console.log("已初始化必要的機器人配置...")
    
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
    if(chain.type === "solana"){
      chain.explorerTxUrl = `${chain.blockExplorer}/tx/{hash}`
      chain.explorerAddressUrl = `${chain.blockExplorer}/address/{address}`
    }else{
      chain.explorerTxUrl = `${chain.blockExplorer}/tx/{hash}`
      chain.explorerAddressUrl = `${chain.blockExplorer}/address/{address}`
    }
  })
  await Chain.insertMany(defaultChains);
  console.log(`Inserted ${defaultChains.length} default chains`);

};

initDatabase();

// 其他筆記
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

