const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const initBOt = async() => {
    console.log('init TG bot...')

    bot.onText(/\/start/, (msg, match) => {
        // 'msg' 是從 Telegram 接收到的訊息
        // 'match' 是上述正規表達式在訊息文字內容上執行的結果

        const chatId = msg.chat.id; // 用戶的ID
        const url = "https://google.com";
        const message = `歡迎使用TG機器人，專案位置${url}`;
        let parse_mode = 'Markdown';
        // 機器人將訊息傳給使用者
        bot.sendMessage(chatId, message, { parse_mode }) // bot.on 的話是搭配 parseMode 而 onText 則是搭配 => https://stackoverflow.com/questions/55761720/how-to-use-markdown-in-parse-mode-of-telegram-bot
    });


    // 添加錢包地址，意指要用來追蹤的 => /add 0x1234567890abcdef1234567890abcdef12345678 eth
    bot.onText(/\/add (.+)/, function (msg, match) {
        const chatId = msg.chat.id; // 用戶的ID
        // 抓取指令後面的兩個參數
        const params = match[1].trim().split("");
        // 分別 取地址 跟 member01
        const address = params[0];
        const chainID = params[1].toLowerCase;

        const message = `已成功將地址 ${address} 加入 ${chainID} 鏈的追蹤清單`;
        // 假設DB還沒追蹤，那我要加進去追蹤清單
        bot.sendMessage(chatId, message); //發送訊息的function
    });
}

// 基本用法：  https://github.com/mullwar/telebot#sendmessagechat_id-text-parsemode-replytomessage-replymarkup-notification-webpreview
// // 匹配 "/echo [任何內容]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // 'msg' 是從 Telegram 接收到的訊息
//     // 'match' 是上述正規表達式在訊息文字內容上執行的結果

//     const chatId = msg.chat.id; // 用戶的ID
//     const resp = match[1]; // match[1]的意思是 /echo 後面的所有內容

//     // 將擷取到的 "任何內容" 傳回給聊天視窗
//     bot.sendMessage(chatId, resp);
// });