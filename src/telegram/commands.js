const startCommand = async() => {
    // 'msg' 是從 Telegram 接收到的訊息
    // 'match' 是上述正規表達式在訊息文字內容上執行的結果
    const chatId = msg.chat.id;
    const url = "https://google.com";
    const message = `歡迎使用TG機器人，專案位置${url}`;
    let parse_mode = 'Markdown';
     // 機器人將訊息傳給使用者 
    await bot.sendMessage(chatId, message, { parse_mode }); // bot.on 的話是搭配 parseMode 而 onText 則是搭配 => https://stackoverflow.com/questions/55761720/how-to-use-markdown-in-parse-mode-of-telegram-bot
 }

async function addWalletCommand(bot, msg, match) {
    const chatId = msg.chat.id;
    // 拆解指令參數
    const params = match[1].trim().split(/\s+/); // 用空白分隔
    const address = params[0];
    const chainID = params[1]?.toLowerCase();

    const message = `已成功將地址 ${address} 加入 ${chainID} 鏈的追蹤清單`;
    // 假設DB還沒追蹤，那我要加進去追蹤清單
    await bot.sendMessage(chatId, message);
}

module.exports = { startCommand, addWalletCommand };


// 在這裡用哪一種都沒差
// 除非是在 class（類別）裡面定義方法，建議使用 async function 宣告式（方法語法），
// 而不是箭頭函式。這是因為 class 的方法必須寫成標準的方法語法，才能正確地被 class 實例繼承與調用，
// 並且 this 綁定才會自動指向該實例

// async function 宣告式 => 函式宣告，會在作用域內被提升（hoisting），可在宣告前呼叫
// async function addWalletCommand(bot, msg, match) {
//   // ...可用 await
// }

// async 箭頭函式 => 是「函式表達式」，不會被提升，必須在宣告後才能使用。
// const addWalletCommand = async () => {
//   // ...可用 await
// };
