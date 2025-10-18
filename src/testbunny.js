import axios from "axios";

(async () => {
  try {
    const url =
      "https://lavisheventzz-bangalore.b-cdn.net/Lets%20Party%20Decor%20Add%20O%20n/WhatsApp%20Image%202025-07-07%20at%2011.01.54%20AM%20(1).jpeg";

    const response = await axios.get(url, { responseType: "arraybuffer" });
    console.log("✅ BunnyCDN image accessible, size:", response.data.byteLength);
  } catch (err) {
    console.error(
      "❌ BunnyCDN blocked this server request:",
      err.response?.status,
      err.message
    );
  }
})();
