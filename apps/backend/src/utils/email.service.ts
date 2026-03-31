import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER, // Add these to your .env
        pass: process.env.EMAIL_PASS,
  },

  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1.2"
  }
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