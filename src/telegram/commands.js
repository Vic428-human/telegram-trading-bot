const startCommand = async(bot, msg) => {
    // 'msg' 是從 Telegram 接收到的訊息
    // 'match' 是上述正規表達式在訊息文字內容上執行的結果
    const chatId = msg.chat.id; // msg 裡的數據由來？ E-1 ，用意為對特定 ChatId 發送訊息
    const url = "https://google.com";
    const message = `歡迎使用TG機器人，專案位置${url}`;
    let parse_mode = 'Markdown';
     // 機器人將訊息傳給使用者 
    await bot.sendMessage(chatId, message, { parse_mode }); // bot.on 的話是搭配 parseMode 而 onText 則是搭配 => https://stackoverflow.com/questions/55761720/how-to-use-markdown-in-parse-mode-of-telegram-bot
 }

async function addWalletCommand(bot, msg, match) {
    const chatId = msg.chat.id;
    // 拆解指令參數
    const params = match[1].trim().split("");
    const address = params[0];
    const chainID = params[1]?.toLowerCase(); // ?.es2020+寫法

    const message = `已成功將地址 ${address} 加入 ${chainID} 鏈的追蹤清單`;
    // 假設DB還沒追蹤，那我要加進去追蹤清單
    await bot.sendMessage(chatId, message);
}



module.exports = { startCommand, addWalletCommand };

// 參 E-1
// chat.id 的來源說明 當使用者與Telegram 機器人（bot）互動時（例如發送 /start 指令），Telegram 伺服器會將一個訊息（message）物件傳送給你的 bot。這個物件通常包含如下結構：
// TELEGRAM_BOT_TOKEN 取得方式 => http://blog.3dgowl.com/telegram-telegram%e4%ba%8c-%e5%bb%ba%e7%ab%8b-bot/
// `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`
// 對上面的網址輸入後， {"ok":true,"result":[]} ，此時對tg bot輸入hello world ，會回傳如下格式數據
// {
//   "ok": true,
//   "result": [
//     {
//       "update_id": 000001,
//       "message": {
//         "message_id": 1,
//         "from": {
//           "id": 00000,
//           "is_bot": false,
//           "first_name": "YYY",
//           "username": "SSS",
//           "language_code": "zh-hans"
//         },
//         "chat": {
//           "id": 00000,
//           "first_name": "YYY",
//           "username": "SSS",
//           "type": "private"
//         },
//         "date": 1748622883,
//         "text": "/start",
//         "entities": [
//           {
//             "offset": 0,
//             "length": 6,
//             "type": "bot_command"
//           }
//         ]
//       }
//     },

// 取得 chat.id 之後，就可以順利在頻道中廣播訊息了=> http://blog.3dgowl.com/telegram-telegram%E4%BA%94-%E5%8F%96%E5%BE%97-chat-id/


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
