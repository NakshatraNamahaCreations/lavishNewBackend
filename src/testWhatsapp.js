import { sendWhatsappMessage } from "./utils/sendWhatsapp.js";

const testWhatsapp = async () => {
  try {
    const mobile = "9608120483"; // Replace with your test WhatsApp number
    const message = "Test WhatsApp message from Lavish Eventzz";
    console.log("📤 Sending test WhatsApp message to:", mobile);
    await sendWhatsappMessage(mobile, message);
    console.log("✅ Test message sent successfully");
  } catch (err) {
    console.error("❌ Error sending test message:", err.message);
  }
};

testWhatsapp();