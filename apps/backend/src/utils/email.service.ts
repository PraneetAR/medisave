import nodemailer from "nodemailer";
import { logger } from "./logger";

const transporter = nodemailer.createTransport({
    host: "64.233.184.108",
    port: 587,
    secure: false, 
    requireTLS: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
        
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