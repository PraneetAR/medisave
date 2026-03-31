import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
  service: "gmail", // Or use host/port for other providers
  auth: {
    user: process.env.EMAIL_USER, // Add these to your .env
    pass: process.env.EMAIL_PASS,
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