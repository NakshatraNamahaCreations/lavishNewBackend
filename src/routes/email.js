import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { email } = req.body;

  // Configure your transporter (use your real credentials)
  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: "support@lavisheventzz.com",
      pass: "Support@020725",
    },
  });

  const mailOptions = {
    from: "Lavish Eventzz <support@lavisheventzz.com>",
    to: "support@lavisheventzz.com",
    subject: "New Website Contact",
    text: `Someone is trying to reach out to you. Email: ${email}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send email", error: err });
  }
});
 
export default router