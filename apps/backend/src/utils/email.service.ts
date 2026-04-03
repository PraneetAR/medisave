import * as SibApiV3Sdk from "@getbrevo/brevo";
import { logger } from "./logger";

// Get the global API client instance
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: 'api-key'
const apiKey = defaultClient.authentications['api-key'];

if (process.env.BREVO_API_KEY) {
  apiKey.apiKey = process.env.BREVO_API_KEY;
} else {
  logger.error("CRITICAL: BREVO_API_KEY is missing from environment variables!");
}

// Create the API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendOtpEmail = async (email: string, otp: string, subject = "Your Login OTP - MediSave") => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
          <h2 style="color: #2c3e50; text-align: center;">MediSave Verification</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for MediSave is:</p>
          <div style="background: #f4f7f6; padding: 15px; font-size: 28px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1abc9c; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #7f8c8d; font-size: 14px;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #bdc3c7; text-align: center;">&copy; 2024 MediSave. All rights reserved.</p>
        </div>
      `;
    
    sendSmtpEmail.sender = { 
      name: "MediSave", 
      email: process.env.EMAIL_FROM as string 
    };
    sendSmtpEmail.to = [{ email: email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.info(`OTP sent to ${email} via Brevo`);
  } catch (error: any) {
    const detail = error.response?.body?.message || error.message;
    logger.error("Brevo Email failed", { detail });
    throw new Error("Could not send OTP email");
  }
};
