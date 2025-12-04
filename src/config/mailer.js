import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a transporter using Hostinger's SMTP server
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: "support@lavisheventzz.com",
    pass: "Support@020725",
  },
});

// Send order confirmation email
// const sendOrderConfirmation = async (toEmail, order) => {
//   const { orderId, customerName, items, eventDate, eventTime, grandTotal, address } = order;

//   const itemsList = items
//     .map(
//       (item) => `
//     <li>
//       <strong>${item.serviceName}</strong> - ₹${item.price}
//       ${item.image ? `<br><img src="${item.image}" alt="${item.serviceName}" style="width: 200px; height: 200px; object-fit: cover;"/>` : ""}
//     </li>
//   `
//     )
//     .join("");

//   const mailOptions = {
//     from: `Lavish Eventzz <support@lavisheventzz.com>`,
//     to: toEmail,
//     subject: `Order Confirmation - #${orderId}`,
//     html: `
//       <h2>Hi ${customerName},</h2>
//       <p>Your order <strong>#${orderId}</strong> has been confirmed. Below are the details of your order:</p>
//       <p><strong>Event Date:</strong> ${eventDate}</p>
//       <p><strong>Event Time:</strong> ${eventTime}</p>
//       <p><strong>Venue:</strong> ${address}</p>
//       <h3>Order Details:</h3>
//       <ul>
//         ${itemsList}
//       </ul>
//       <p><strong>Total:</strong> ₹${grandTotal}</p>
//       <p>Thank you for choosing Lavish Eventzz!</p>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", info.messageId);
//   } catch (error) {
//     console.error("❌ Email sending failed:", error);
//   }
// };
// Send order confirmation email
const sendOrderConfirmation = async (toEmail, order) => {
  const {
    orderId,
    customerName,
    items,
    eventDate,
    eventTime,
    grandTotal,
    paidAmount,
    dueAmount,
    paymentType,
    address
  } = order;

  // Payment text based on HALF or FULL
  const paymentDetails =
    paymentType === "HALF"
      ? `
        <p><strong>Total Amount:</strong> ₹${grandTotal}</p>
        <p><strong>Paid Amount:</strong> ₹${paidAmount}</p>
        <p><strong>Due Amount:</strong> ₹${dueAmount}</p>
      `
      : `
        <p><strong>Total Amount:</strong> ₹${grandTotal}</p>
        <p><strong>Paid Amount:</strong> ₹${paidAmount}</p>
      `;

  // Items list with images
  const itemsList = items
    .map(
      (item) => `
        <li>
          <strong>${item.serviceName}</strong> - ₹${item.price}
          ${
            item.image
              ? `<br><img src="${item.image}" alt="${item.serviceName}" style="width: 200px; height: 200px; object-fit: cover;"/>`
              : ""
          }
        </li>
      `
    )
    .join("");

  const mailOptions = {
    from: `Lavish Eventzz <support@lavisheventzz.com>`,
    to: toEmail,
    subject: `Order Confirmation - #${orderId}`,
    html: `
      <h2>Hi ${customerName},</h2>
      <p>Your order <strong>#${orderId}</strong> has been confirmed!</p>

      <p><strong>Event Date:</strong> ${eventDate}</p>
      <p><strong>Event Time:</strong> ${eventTime}</p>
      <p><strong>Venue:</strong> ${address}</p>

      <h3>Order Details:</h3>
      <ul>
        ${itemsList}
      </ul>

      <h3>Payment Summary:</h3>
      ${paymentDetails}

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
