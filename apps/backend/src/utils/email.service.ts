import sgMail from "@sendgrid/mail";
import { logger } from "./logger";

// Initialize SendGrid with your API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  logger.warn("SENDGRID_API_KEY is not defined in environment variables");
}

export const sendOtpEmail = async (email: string, otp: string, subject = "Your Login OTP - MediSave") => {
  try {
    const msg = {
      to: email,
      from: {
        email: process.env.EMAIL_FROM as string,
        name: "MediSave",
      },
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #2c3e50; text-align: center;">MediSave Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for logging into MediSave is:</p>
          <div style="background: #f4f7f6; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1abc9c; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #bdc3c7; text-align: center;">&copy; 2024 MediSave. All rights reserved.</p>
        </div>
      `,
    };

    await sgMail.send(msg);
    logger.info(`OTP sent to ${email} via SendGrid`);
  } catch (error: any) {
    logger.error("SendGrid Email failed", error.response?.body || error.message);
    throw new Error("Could not send OTP email");
  }
};