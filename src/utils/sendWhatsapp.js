import axios from "axios";

export const sendWhatsappMessage = async (mobile, message) => {
  const apiKey = "d97b74aabeb0405392a8438a7a233a9e";
  const encodedMsg = encodeURIComponent(message);
  const fullMobile = `91${mobile}`;

  const url = `http://whatsappnew.bestsms.co.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${fullMobile}&msg=${encodedMsg}`;

  console.log("sendWhatsappMessage url -- ", url);

  try {
    const response = await axios.get(url);
    console.log("✅ WhatsApp message sent:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ WhatsApp send failed:", err.message);
    throw err;
  }
};

// export const sendWhatsappImage = async (mobile, imageUrl, caption) => {
//   const apiKey = "d97b74aabeb0405392a8438a7a233a9e";
//   const fullMobile = `91${mobile}`;
//   const encodedCaption = encodeURIComponent(caption);
//   const encodedImageUrl = encodeURIComponent(imageUrl);

//   const url = `http://whatsappnew.bestsms.co.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${fullMobile}&msg=${encodedCaption}&img1=${encodedImageUrl}`;

//   console.log("sendWhatsappImage url -- ", url);

//   try {
//     const response = await axios.get(url);
//     console.log("✅ Image message sent:", response.data);
//     return response.data;
//   } catch (err) {
//     console.error(
//       "❌ Failed to send image message:",
//       err.response?.data || err.message
//     );
//     throw err;
//   }
// };

export const sendWhatsappImage = async (mobile, imageUrl, caption) => {
  const apiKey = "d97b74aabeb0405392a8438a7a233a9e";
  const fullMobile = `91${mobile}`;
  const encodedCaption = encodeURIComponent(caption);
  const encodedImageUrl = encodeURI(imageUrl); // ✅ fix here

  const url = `http://whatsappnew.bestsms.co.in/wapp/v2/api/send?apikey=${apiKey}&mobile=${fullMobile}&msg=${encodedCaption}&img1=${encodedImageUrl}`;

  console.log("sendWhatsappImage url -- ", url);

  try {
    const response = await axios.get(url);
    console.log("✅ Image message sent:", response.data);
    return response.data;
  } catch (err) {
    console.error(
      "❌ Failed to send image message:",
      err.response?.data || err.message
    );
    throw err;
  }
};
