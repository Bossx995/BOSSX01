const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;
const pairingUrl = process.env.PAIRING_URL || "";

if (!token) {
  console.log("⚠️ TELEGRAM_BOT_TOKEN not set. Telegram bot disabled.");
  module.exports = null;
} else {
  const bot = new TelegramBot(token, {
    polling: true
  });

  // ==============================
  // Telegram Error Handling
  // ==============================

  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });

  bot.on("error", (error) => {
    console.error("Telegram bot error:", error.message);
  });

  // ==============================
  // /start
  // ==============================

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
      text += `

🔗 Pairing Website:
${pairingUrl}`;
    }

    text += `

💎 Powered by BOSS-X
👑 Developer: Mr bikramhacker`;

    try {
      const keyboard = [];

      if (pairingUrl) {
        keyboard.push([
          {
            text: "📱 Pair WhatsApp Number",
            url: pairingUrl
          }
        ]);
      }

      await bot.sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: keyboard
        }
      });

    } catch (error) {
      console.error(
        "Telegram /start reply failed:",
        error.message
      );
    }
  });

  // ==============================
  // /pair
  // ==============================

  bot.onText(/^\/pair(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;

    const number = match?.[1]
      ? match[1].replace(/\D/g, "")
      : "";

    // No number
    if (!number) {
      return bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ WhatsApp number missing
│
│ Use:
│ /pair 919XXXXXXXXX
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    // Basic number validation
    if (number.length < 10 || number.length > 15) {
      return bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ Invalid WhatsApp number
│
│ Example:
│ /pair 919876543210
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }

    try {
      await bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ⏳ Pairing request received
│ 📱 Number: +${number}
│
│ 🔄 Generating pairing code...
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      );

      /*
       * IMPORTANT:
       * Actual WhatsApp pairing-code generation
       * must be connected to the pairing function
       * inside index.js.
       *
       * Do NOT put a fake /api/pair URL here.
       */

      console.log(
        `📱 Telegram pairing request: +${number}`
      );

      await bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ⚠️ Pairing engine connection
│    is not connected yet.
│
│ 📱 Number: +${number}
│
│ The Telegram command is working,
│ but the actual WhatsApp pairing
│ code must be connected to the
│ existing WhatsApp pairing engine.
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      );

    } catch (error) {
      console.error(
        "Telegram /pair error:",
        error.message
      );

      await bot.sendMessage(
        chatId,
        `❌ Pairing failed.

Reason:
${error.message}`
      );
    }
  });

  // ==============================
  // /help
  // ==============================

  bot.onText(/^\/help$/i, async (msg) => {
    try {
      await bot.sendMessage(
        msg.chat.id,
        `🤖 BOSS-X-3 Commands

/start - Start the bot
/pair 919XXXXXXXXX - Pair WhatsApp number
/help - Show help

📱 WhatsApp Pairing
Use:
 /pair 919XXXXXXXXX

💎 Powered by BOSS-X
👑 Developer: Mr bikramhacker`
      );

    } catch (error) {
      console.error(
        "Telegram /help reply failed:",
        error.message
      );
    }
  });

  // ==============================
  // Bot Started
  // ==============================

  console.log("✅ Telegram bot started successfully.");

  module.exports = bot;
}
