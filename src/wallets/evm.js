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
    const provider = getEvmProvider(chain);
    const privateKey = process.env.PRIVATE_KEY; // privateKey is the 32-byte hexadecimal private key of the wallet,
    // const provider = new ethers.providers.InfuraProvider("mainnet"); 
    const wallet = new ethers.Wallet(privateKey, provider);
    return wallet; // console.log("Wallet address:", wallet.address);
};

// use axios .get 
const getEvmBalance = async (chain) => {
    try{
    const wallet = getEvmSigner(chain)
        const walletAddress = wallet.address; 
        // Get Native & ERC20 Token Balances by Wallet 基於 cURL 的方式 => https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-token-balances-price?address=0xcB1C1FdE09f811B294172696404e88E658659905&chain=eth&token_addresses=[null]
        // https://deep-index.moralis.io/api/v2.2/wallets/<將用來查詢代幣餘額的地址>/tokens?chain=eth
        const response = await axios.get(`https://deep-index.moralis.io/api/v2.2/wallets/${walletAddress}/tokens`,  {
            params: {
                chain: chain.moralisChainName
            },
            headers: {
                accept: "application/json",
                "X-API-Key": process.env.MORALIS_API_KEY
            }
        });

        if(!response.data || !response.data.result) {
        throw new Error(`Native & ERC20 Token Balances by Wallet error,請確認錢包地址： ${wallet.address}, 以及鏈名：${chain.moralisChainName} 是否正確，倘若不正確，表示 /add <address> <chainID>指令的時候就新增錯誤了`);
        } 

        const result = response.data.result; 
        // 找出 native_token 為 true 的物件
        const nativeToken = result.find(token => token.native_token ===  true);

        // 找出其餘ERC20的token 
        const ERC20Tokens = result.filter(token => token.native_token === false).map((ERC20Token)=>{
            return {
                name: ERC20Token.name,
                symbol: ERC20Token.symbol,
                decimals: ERC20Token.decimals,
                address: ERC20Token.token_address,
                balance: ERC20Token.balance,
                usdValue: ERC20Token.usd_value
            }
        });

        return {
            address: walletAddress,
            nativeToken: nativeToken ? 
            {
                symbol: nativeToken.symbol,
                amount: nativeToken.amount,
                usdValue: nativeToken.usd_value
            } : {
                symbol: chain.nativeToken.symbol,   
                amount: "0",
                usdValue: 0,
            },
            ERC20Tokens
        }
    } catch (error) {
        const API_RESOURCE = 'https://docs.moralis.com/web3-data-api/evm/reference/get-wallet-token-balances-price?address=0xcB1C1FdE09f811B294172696404e88E658659905&chain=eth&token_addresses=[]';
        console.error(`在 ${chain.moralisChainName} 鏈，chainId： ${chain.chainId}，獲取錢包餘額時發生錯誤 `,error.message);
        return { 
            API_RESOURCE: API_RESOURCE,
            nativeToken: {
                symbol: chain.nativeToken.symbol,   
                amount: "0",
                usdValue: 0,
            },
            ERC20Tokens: []
        };
    }
   


}

