const TelegramBot = require("node-telegram-bot-api");
const commandHandler = require('./commands'); 


// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_TOKEN;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const initBOt = async() => {
    console.log('init TG bot...')

    bot.onText(/\/start/, (msg) => {
        commandHandler.startCommand(bot, msg);
    });


    // 添加追蹤的錢包地址 => 指令範例： /add 0x1234567890abcdef1234567890abcdef12345678 eth
    bot.onText(/\/add (.+)/, function (msg, match) {
        commandHandler.addWalletCommand(bot, msg, match);
    });
}



module.exports = { initBOt };



// bot.onText 基本用法：  https://github.com/mullwar/telebot#sendmessagechat_id-text-parsemode-replytomessage-replymarkup-notification-webpreview
// 匹配 "/echo [任何內容]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
//     // 'msg' 是從 Telegram 接收到的訊息
//     // 'match' 是上述正規表達式在訊息文字內容上執行的結果

//     const chatId = msg.chat.id; // 用戶的ID
//     const resp = match[1]; // match[1]的意思是 /echo 後面的所有內容

//     // 將擷取到的 "任何內容" 傳回給聊天視窗
//     bot.sendMessage(chatId, resp);
// });