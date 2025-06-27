import axios from "axios";

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtpToMobile = async (mobile, otp) => {
  const baseUrl = "https://dtasit.ai/backend/api/http/sms/send";
  const params = {
    recipient: `91${mobile}`,
    sender_id: "NSKFST",
    message: `Dear User, Your login OTP is ${otp}. Valid for 10 mins. Dont share with anyone. Lavish Eventzz Thank you Call support for help -Nashik First`,
    api_token: "67|6uxJLrpbkzHRTEGpe9I8inl2dgUx6hpaiN7ocFGS40823a6d",
    dlt_template_id: "1207162399931698582",
    type: "plain",
    entity_id: "1201160690821746726",
  };

  try {
    const response = await axios.get(baseUrl, { params });
    console.log("SMS sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("SMS send error:", error.message);
    throw new Error("OTP send failed");
  }
};
