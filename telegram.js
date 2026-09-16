const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;
const pairingUrl = process.env.PAIRING_URL || "";

if (!token) {
  console.log("⚠️ TELEGRAM_BOT_TOKEN not set. Telegram bot disabled.");
  module.exports = null;
} else {
  const bot = new TelegramBot(token, { polling: true });

  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });

  bot.on("error", (error) => {
    console.error("Telegram bot error:", error.message);
  });

  bot.onText(/^\/start(?:\s+.*)?$/i, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from?.first_name || "User";

    let text = `╭━━━〔 👑 BOSS-X-3 〕━━━╮
┃
┃ 👋 Hello ${firstName}!
┃ 🤖 BOSS-X-3 Telegram Bot
┃ ⚡ WhatsApp Bot Management
┃ 🔗 Pair your WhatsApp number
┃
╰━━━━━━━━━━━━━━━━━━╯`;

    if (pairingUrl) {
      text += `\n\n🔗 Pairing Website:\n${pairingUrl}`;
    }

    text += `\n\n💎 Powered by BOSS-X
👑 Developer: Mr bikramhacker`;

    try {
      await bot.sendMessage(chatId, text);
    } catch (error) {
      console.error("Telegram /start reply failed:", error.message);
    }
  });

  bot.onText(/^\/help$/i, async (msg) => {
    try {
      await bot.sendMessage(
        msg.chat.id,
        `🤖 BOSS-X-3 Commands

/start - Start the bot
/help - Show help

👑 Developer: Mr bikramhacker`
      );
    } catch (error) {
      console.error("Telegram /help reply failed:", error.message);
    }
  });

  console.log("✅ Telegram bot started successfully.");
  module.exports = bot;
}
