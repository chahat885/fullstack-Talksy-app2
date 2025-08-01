import nodemailer from "nodemailer";
import dotenv from "dotenv"; // ADDED: Import dotenv to load environment variables
dotenv.config();

const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: process.env.EMAIL_USER, // UPDATED: Use environment variable
      pass: process.env.EMAIL_PASS, // UPDATED: Use environment variable
    },
  });

  const mailOptions = {
    from: `"Talksy App" <${process.env.EMAIL_USER}>`, // UPDATED: Use environment variable
    to: email,
    subject: "OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4CAF50;">OTP Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up with Talksy App. To complete your registration, please use the following One-Time Password (OTP):</p>
        <h3 style="background-color: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px; letter-spacing: 5px; font-size: 24px;">${otp}</h3>
        <p>This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
        <p>Regards,<br/>The Talksy App Team</p>
        
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("OTP sent: %s", info.messageId);
    console.log("Ethereal Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending OTP email:", error);
  }
};

export { sendOtpEmail };
