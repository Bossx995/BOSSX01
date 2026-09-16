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

  bot.on("polling_error", (error) => {
    console.error("Telegram polling error:", error.message);
  });

  bot.on("error", (error) => {
    console.error("Telegram bot error:", error.message);
  });

  // =========================
  // /start
  // =========================
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

  // =========================
  // /pair
  // =========================
  bot.onText(/^\/pair(?:\s+(.+))?$/i, async (msg, match) => {
    const chatId = msg.chat.id;

    const number = match?.[1]
      ? match[1].replace(/\D/g, "")
      : "";

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

    if (!/^\d{8,15}$/.test(number)) {
      return bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ Invalid WhatsApp number
│
│ Country code সহ number দিন।
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

      const port = process.env.PORT || 10000;

      const response = await fetch(
        `http://127.0.0.1:${port}/api/pair`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            number
          })
        }
      );

      let result;

      try {
        result = await response.json();
      } catch {
        result = {
          ok: false,
          message: "Invalid response from pairing server."
        };
      }

      if (!response.ok || !result.ok) {
        return bot.sendMessage(
          chatId,
          `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ Pairing failed
│
│ ${result.message || "Could not generate pairing code."}
│
╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      const code = String(result.code || "")
        .toUpperCase()
        .trim();

      if (!code) {
        return bot.sendMessage(
          chatId,
          `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ Pairing code পাওয়া যায়নি।
│
│ আবার চেষ্টা করুন।
│
╰━━━━━━━━━━━━━━━━━━━━╯`
        );
      }

      await bot.sendMessage(
        chatId,
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ✅ Pairing code generated
│ 🔐 Code: ${code}
│
│ 📱 WhatsApp → Linked Devices
│ → Link with phone number
│
│ ⏱️ এখন WhatsApp-এ এই code দিন।
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
        `╭━━〔 📱 BOSS-X Pairing 〕━━╮
│
│ ❌ Pairing failed
│
│ Reason:
│ ${error.message}
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      );
    }
  });

  // =========================
  // /help
  // =========================
  bot.onText(/^\/help$/i, async (msg) => {
    try {
      await bot.sendMessage(
        msg.chat.id,
        `╭━━━〔 🤖 BOSS-X-3 HELP 〕━━━╮
│
│ /start
│ Start Telegram bot
│
│ /pair 919XXXXXXXXX
│ Generate WhatsApp pairing code
│
│ /help
│ Show this help
│
╰━━━━━━━━━━━━━━━━━━━━━━╯

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

  console.log("✅ Telegram bot started successfully.");

  module.exports = bot;
}
