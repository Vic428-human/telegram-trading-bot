const { ethers } = require("ethers");
const axios = require("axios");
require("dotenv").config();

// 1 inch router 可以做 swap


// erc20 for token 交互
// https://ethereum.org/zh-tw/developers/docs/standards/tokens/erc-20/
const erc20ABI = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)", // 查詢指定地址的代幣餘額
    "function decimals() view returns (uint8)", // 取得代幣的小數位數
    "function symbol() view returns (string)", // 取得代幣的符號（如 ETH、USDT）
    // 你允許某個人（或機器人、合約）幫你花你錢包裡的一部分代幣，但有一個上限。
    "function approve(address _spender, uint256 _value) public returns (bool success)", // Solidity 0.5.0 之後，所有函數必須明確標註可見性（如 public、external、internal、private）。早期版本若未標註則預設為 public。現代合約建議明確寫出 public 或 external
    // 查詢你已經允許某個人（或合約）最多還能幫你花多少代幣。
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)" // remaining 只是返回值的命名，對外部呼叫者沒差別。ERC-20 標準原型是 returns (uint256)，但加上名稱可提升可讀性。
];


// chain => 從 ChainSchema 拿 rpcUrl 資料，獲取EVM provider 實例
const getEvmProvider = (chain) => {
    // When using the JSON-RPC API, the network will be automatically detected
    let customHttpProvider = new ethers.providers.JsonRpcProvider(chain.rpcUrl); // https://stackoverflow.com/questions/72986080/how-to-connect-to-custom-provider-using-ethers
    return customHttpProvider;
}


// 獲取EVM wallet address => https://docs.ethers.org/v5/api/signer/#Wallet
// Create a new Wallet instance for privateKey and optionally connected to the provider.
const getEvmSigner = (chain) => {
    const privateKey = process.env.PRIVATE_KEY; // privateKey is the 32-byte hexadecimal private key of the wallet,
    // const provider = new ethers.providers.InfuraProvider("mainnet"); 
    const wallet = new ethers.Wallet(privateKey, getEvmProvider(chain));
    return wallet; // console.log("Wallet address:", wallet.address);
}   