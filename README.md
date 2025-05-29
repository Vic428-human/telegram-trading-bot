# 🌌 Codebase

> 主要基於 ES6 (ES2015) 和 ES2017 語法規範，但採用 Node.js 的 CommonJS 模組載入方式，屬於典型的後端 JavaScript 開發寫法。若要明確指定版本，可視為 ES2017+ 的實踐。
> 箭頭函數與 async/await 語法、const 與解構賦值、模板字符串(process.env.ETH_RPC_URL || "")，未使用 ES2020+ 新特性如 optional chaining (?.) 或 nullish coalescing (??)，
> 且 node 18.20.4 版本下載相關套件，雖然 node 14 以上就能用 ES2020+ 的寫法，但此專案還是以 ES2017+方式撰寫。當然日後用 ES2020+ 新特性去實作也不影響就是了。

- src/polling => 指應用程式定期向區塊鏈節點或 API 發送請求，以獲取最新的鏈上資料或狀態更新。例如，開發者會透過 polling 方式，定時查詢某個錢包地址的餘額、交易狀態、NFT 持有情況等資訊
- src/wallet => 初始化 EVM 或 Solana 錢包，例如使用 ethers.js 或 solana web3.js

## 主要目標

🤖 Telegram Swap Copy Trading Bot
一個自動複製鏈上錢包交易行為的 Telegram 機器人，支援多鏈（EVM / Solana）與 DEX（1inch / Jupiter）

✅ 功能清單
以下為目前專案的主要功能模組與待完成/已完成任務，可勾選進行進度追蹤。

### 1. 🧑‍💻 使用者互動層（User Interface）

- [ ] 支援 `/start` 啟動機器人
- [ ] 支援 `/add_wallet` 新增監控錢包
- [ ] 支援 `/remove_wallet` 刪除錢包
- [ ] 支援 `/list_wallets` 查看所有已追蹤錢包
- [ ] 支援 `/config` 設定複製策略（Gas、比例等）
- [ ] 支援 `/help` 顯示使用說明

---

### 2. 🤖 Telegram 機器人介面（Telegram Bot Interface）

- [ ] 接收並解析用戶指令
- [ ] 發送訊息回應用戶操作結果
- [ ] 整合命令處理與通知模組

---

### 3. 📜 命令處理模組（Command Handlers）

- [x] 初始化不同鏈的資料給 DB scripts/initDB.js
- [x] 初始化機器人配置給 DB scripts/initDB.js
- [x] 用 requiredSettings 增量補齊必要設定，避免覆蓋掉機器人原先的初始配置，提升安全性與擴展性 scripts/initDB.js
- [ ] 解析 `/add_wallet` 等指令
- [ ] 更新資料庫中用戶配置與錢包列表
- [ ] 觸發對應流程（如新增錢包後啟動監控）

---

### 4. 🗃️ 資料庫模組（Database Models）

- [x] Chain Model：儲存支援的區塊鏈資訊 src/db/models/chains.js
- [x] Tracked Wallet Model：記錄用戶追蹤的錢包地址與所屬鏈 src/db/models/trackedWallet.js
- [x] [Swap Model：儲存偵測到的交易與執行狀態 src/db/models/swap.js](https://docs.moralis.com/web3-data-api/evm/reference/get-swaps-by-wallet-address?address=0xcB1C1FdE09f811B294172696404e88E658659905&chain=eth&order=DESC)
- [x] Bot Config Model：跟機器人有關的基本配置訊息，例如是否 bot 有正常運行：src/db/models/botConfig.js
- [x] DB 連線成功或失敗邏輯 src/db/index.js

---

### 5. 🔁 定時輪詢服務（Polling Services）

#### a. Swap Fetcher

- [ ] 定期呼叫 Moralis API 或 RPC 取得錢包歷史 Swap
- [ ] 過濾新交易（避免重複執行）
- [ ] 儲存新交易至資料庫為「待處理」

#### b. Swap Processor

- [ ] 從資料庫取出「待處理」Swap
- [ ] 呼叫 Execution Service 複製交易
- [ ] 更新交易狀態（執行中 / 成功 / 失敗）
- [ ] 發送交易結果通知給用戶

#### c. Cleanup Service

- [ ] 定期清理過期 Swap 記錄（如超過 24 小時未執行）
- [ ] 確保資料庫效能穩定

---

### 6. 🌐 外部 API 整合（External APIs）

- [ ] 整合 Moralis API 取得錢包交易
- [ ] 整合 Blockchain RPCs 提交交易至目標鏈
- [ ] 整合 1inch API 用於 EVM Swap
- [ ] 整合 Jupiter API 用於 Solana Swap

---

### 7. 🔗 區塊鏈服務模組（Chain Services）

#### a. EVM Chain Service

- [ ] 支援 Ethereum、BSC、Polygon 等 EVM 鏈
- [ ] 處理 ERC-20、ERC-721 交易簽署與廣播

#### b. Solana Chain Service

- [ ] 支援 SPL Token 與 Jupiter 交易格式
- [ ] 處理交易簽署與提交至 Solana 鏈

---

### 8. ⚡ 執行服務模組（Execution Services）

#### a. 1inch Swap

- [ ] 根據 1inch API 回傳資料複製 Swap
- [ ] 支援 Gas 價格優化與滑點容忍度調整

#### b. Jupiter Swap

- [ ] 使用 Jupiter SDK 建立 Solana Swap 交易
- [ ] 自動處理路由與交易打包

#### c. 錢包服務整合

- [ ] 私鑰加密管理
- [ ] 產生交易簽章
- [ ] 發送到對應鏈的 RPC 節點

---

### 9. 🔔 通知模組（Notification Service）

- [ ] 支援成功/失敗通知
- [ ] 支援錯誤原因提示
- [ ] 支援用戶自訂通知偏好（例如僅接收失敗通知）

---

### 🔄 主要流程邏輯（業務流）

- [ ] 用戶新增錢包
- [ ] 使用 Telegram 發送 `/add_wallet` 指令
- [ ] Bot 將錢包地址與鏈資訊存入資料庫
- [ ] 定期檢測交易
- [ ] Swap Fetcher 定期呼叫 Moralis API 檢查錢包 Swap
- [ ] 發現新交易後存入資料庫為「待處理」
- [ ] Swap Processor 取出待處理交易
- [ ] 呼叫 Execution Services 簽署並提交交易至鏈上
- [ ] 通知服務將執行結果回報給用戶
- [ ] Cleanup Service 定期清除舊交易記錄

## 資源參考

#### 官方技術文件與 API 參考手冊

- [Moralis 是一個提供跨鏈 API、用戶認證、數據聚合、雲端函數和即時區塊鏈事件監控等功能，幫助開發者快速建構和部署區塊鏈應用的 Web3 後端服務平台。](https://docs.moralis.com/)

#### 針對開發者的產品介紹、應用場景與整合資源入口

- [提供豐富的區塊鏈數據，包括 NFT、ERC20 代幣、DeFi 協議、交易歷史等。並可一鍵接入多條主流公鏈（如 Ethereum、BNB、Polygon、Avalanche、Fantom 等）。支援即時與歷史價格、完整錢包組合數據、解碼後的 DeFi 資產等](https://developers.moralis.com/)

#### 跨多條公鏈自動比價、最佳路徑的代幣兌換聚合 AP

- [1inch Swap API 的用途是讓開發者在各大區塊鏈（如以太坊、BNB 鏈、Polygon 等）上，透過路由和聚合算法，實現用戶自托管錢包之間的代幣閃兌，並自動尋找最佳價格和路徑，方便整合到錢包、dApp 或交易平台中](https://portal.1inch.dev/documentation/apis/swap/classic-swap/quick-start)

#### Solana 上一站式聚合流動性、閃兌與交易保護的高效 API

- [Jupiter Ultra API 的用途是讓開發者在 Solana 上聚合多個流動性來源，實現用戶代幣閃兌、查詢最佳價格、獲取賬戶餘額、估算滑點、保護用戶免於 MEV 攻擊，並簡化交易簽名與執行流程，無需自己處理 RPC、手續費或交易廣播等底層細節。](https://dev.jup.ag/docs/ultra-api/)

#### 專案用到的套件與版本

| 套件名稱              | 版本    | 說明                                                                                                                 |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- |
| @solana/web3.js       | ^1.98.2 | 2025/05/28 版本一致                                                                                                  |
| axios                 | ^1.9.0  | 2025/05/28 版本一致                                                                                                  |
| base-58               | ^0.0.1  | 11 年未更新，功能單純，僅適用於非常基本需求，之後應該會改成 bs58 > 6.0.0 穩定、主流，廣泛用於加密貨幣與區塊鏈專案    |
| dotenv                | ^16.5.0 | 2025/05/28 版本一致                                                                                                  |
| ethers                | 5.0.0   | 先不升級，v5 適合需要維護舊專案或依賴大量社群現有教學的情境。 v6 適合新專案，享受更現代化語法、更簡潔 API 和更好效能 |
| mongodb               | ^6.16.0 | 25/05/28 最新版是 6.16.0                                                                                             |
| mongoose              | ^8.15.1 | 25/05/28 最新版本為 8.15.1                                                                                           |
| node-telegram-bot-api | ^0.65.1 | 25/05/28 最新版本為 0.66.1                                                                                           |
| nodemon               | ^3.1.10 | 25/05/28 最新版本為 3.1.10                                                                                           |

                                                                                                           |

#### ethers.js v5 與 v6 主要差異比較

| 特性/寫法           | ethers v5                          | ethers v6                                 |
| ------------------- | ---------------------------------- | ----------------------------------------- |
| 數字處理            | 使用自有 BigNumber 類              | 改用原生 ES2020 BigInt                    |
| Provider 實例       | `ethers.providers.JsonRpcProvider` | `ethers.JsonRpcProvider`                  |
| Web3Provider 命名   | `Web3Provider`                     | 改名為 `BrowserProvider`                  |
| 合約方法調用        | 需處理方法簽名衝突                 | 用 Proxy 動態解析，Typed API 更簡潔       |
| 方法定義            | 方法分在 buckets                   | 每個方法直接掛載 less-common 操作         |
| 導入方式            | 多子包、monorepo                   | 所有 API 集中在主包，pkg.exports 支援細分 |
| 交易手續費          | 多個 fee 參數                      | 統一為 `.getFeeData()`                    |
| Transaction helpers | 分散多處                           | 集中於 `Transaction` 類                   |

##### ethers.js v5 與 v6 主要差異比較實際代碼範例

```

// v5 寫法：
import { ethers } from 'ethers';
const provider = new ethers.providers.JsonRpcProvider(url);
const contract = new ethers.Contract(address, abi, provider);

```

```

// v6 寫法：
import { ethers } from 'ethers';
const provider = new ethers.JsonRpcProvider(url);
const contract = new ethers.Contract(address, abi, provider);

```

```

BigNumber 與 BigInt 差異：
v5: ethers.BigNumber.from('1000000000000000000')
v6: 12345678901234567890n（直接用 JS 的 BigInt）

```
