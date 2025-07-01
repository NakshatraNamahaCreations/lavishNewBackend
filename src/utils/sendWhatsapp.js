import axios from "axios";

export const sendWhatsappMessage = async (mobile, message) => {
  const apiKey = "d97b74aabeb0405392a8438a7a233a9e";
  const encodedMsg = encodeURIComponent(message);
  const fullMobile = `91${mobile}`;

  const url = `http://whatsappnew.bestsms.co.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${fullMobile}&msg=${encodedMsg}`;

  try {
    const response = await axios.get(url);
    console.log("✅ WhatsApp message sent:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ WhatsApp send failed:", err.message);
    throw err;
  }
};
