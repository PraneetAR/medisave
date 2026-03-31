import nodemailer from "nodemailer";
import { logger } from "./logger";
import dns from "node:dns";

// 🚀 CRITICAL FIX FOR RENDER: Force IPv4 to avoid ENETUNREACH errors
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        // Ensure connection is not blocked by self-signed cert issues
        rejectUnauthorized: false,
    },
});

export const sendOtpEmail = async (email: string, otp: string) => {
  try {
    await transporter.sendMail({
      from: `"MediSave" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP - MediSave",
      html: `<h3>Your One-Time Password is: <b>${otp}</b></h3><p>Valid for 10 minutes.</p>`,
    });
    logger.info(`OTP sent to ${email}`);
  } catch (error) {
    logger.error("Email sending failed", error);
    throw new Error("Could not send OTP email");
  }
};