import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../config/env";
import { logger } from "./logger";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (fileName: string, content: string) => {
  try {
    // ✅ MOVE THIS OUTSIDE
    const now = new Date();
    const folder = `${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: `reports/${folder}/${fileName}`, // ✅ clean structure
      Body: content,
      ContentType: "application/json",
    });

    await s3Client.send(command);
    logger.info(`☁️ Successfully uploaded ${fileName} to S3`);
  } catch (err) {
    // ✅ slightly better logging
    logger.error("❌ S3 Upload Failed:", err);
    throw err;
  }
};