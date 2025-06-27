import nodemailer from "nodemailer";
import dotenv from "dotenv"; 

// Load environment variables from .env file
dotenv.config();

// Check if environment variables are set correctly
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.error("❌ Missing Gmail credentials in environment variables");
  process.exit(1); 
}

// Create a transporter using Gmail's SMTP server
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS, 
  },
});

// Send order confirmation email
const sendOrderConfirmation = async (toEmail, order) => {
  // Extract the necessary order details from the order object
  const { orderId, customerName, items, eventDate, eventTime, grandTotal, address } = order;

  // Extract item details from order items and include images (if available)
  const itemsList = items.map(item => `
    <li>
      <strong>${item.serviceName}</strong> - ₹${item.price}
      ${item.image ? `<br><img src="${item.image}" alt="${item.serviceName}" style="width: 200px; height: 200px; object-fit: cover;"/>` : ''}
    </li>
  `).join('');

  const mailOptions = {
    from: `Lavish Eventzz <${process.env.GMAIL_USER}>`, 
    to: toEmail,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>Your order <strong>#${orderId}</strong> has been confirmed. Below are the details of your order:</p>
      <p><strong>Event Date:</strong> ${eventDate}</p>
      <p><strong>Event Time:</strong> ${eventTime}</p>
      <p><strong>Venue:</strong> ${address}</p>
      <h3>Order Details:</h3>
      <ul>
        ${itemsList}
      </ul>
      <p><strong>Total:</strong> ₹${grandTotal}</p>
      <p>Thank you for choosing Lavish Eventzz!</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);  
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:", error);  
  }
};


export default sendOrderConfirmation;
