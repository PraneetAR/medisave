import nodemailer from "nodemailer";
import { logger } from "./logger";
import dns from "node:dns";

// ✅ Force IPv4 (important for cloud environments like Render)
dns.setDefaultResultOrder("ipv4first");

// ✅ Create transporter (Gmail - FIXED CONFIG)
const transporter = nodemailer.createTransport({
  service: "gmail", // ✅ avoids port issues
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password (no spaces)
  },
});

// ✅ Optional: Verify SMTP connection at startup
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info("✅ SMTP server is ready to send emails");
  } catch (error) {
    logger.error("❌ SMTP connection failed", error);
  }
};

// ✅ Send OTP Email Function
export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"MediSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP - MediSave",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>MediSave OTP Verification</h2>
          <p>Your One-Time Password is:</p>
          <h1 style="color: #2e86de;">${otp}</h1>
          <p>This OTP is valid for <b>10 minutes</b>.</p>
          <br/>
          <small>If you did not request this, please ignore this email.</small>
        </div>
      `,
    });

    logger.info(`✅ OTP sent successfully to ${email}`);
  } catch (error) {
    logger.error("❌ Email sending failed", error);
    throw new Error("Could not send OTP email");
  }
};