import mongoose from "mongoose";
import pLimit from "p-limit";
import { MEDICINE_LIST } from "./medicines.list";
import { scrapePharmEasy } from "./pharmeasy.scraper";
import { scrapeNetmeds } from "./netmeds.scraper";
import { scrapeMedkart } from "./medkart.scraper";
import { Medicine } from "../modules/medicines/medicine.model";
import { logger } from "../utils/logger";
import dotenv from "dotenv";
import { uploadToS3 } from "../utils/s3"; 
 import { ScrapedMedicine } from "./base.scraper";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;
const limit     = pLimit(2);

interface Stats {
  pharmeasy: number;
  netmeds:   number;
  medkart:   number;
  total:     number;
  failed:    number;
  skipped:   number;
}

const stats: Stats = {
  pharmeasy: 0, netmeds: 0, medkart: 0,
  total: 0, failed: 0, skipped: 0,
};

const runScraper = async () => {
  logger.info("🚀 MediSave Scraper Starting");
  logger.info(`📋 Medicines: ${MEDICINE_LIST.length}`);
  logger.info(`🏥 Platforms: PharmEasy, Netmeds, Medkart`);

  await mongoose.connect(MONGO_URI);
  logger.info("✅ MongoDB connected");

  // ✅ ADDED: results accumulator
 

const allScrapedResults: ScrapedMedicine[] = [];

  const BATCH_SIZE  = 5;
  const totalBatches = Math.ceil(MEDICINE_LIST.length / BATCH_SIZE);

  for (let i = 0; i < MEDICINE_LIST.length; i += BATCH_SIZE) {
    const batch  = MEDICINE_LIST.slice(i, i + BATCH_SIZE);
    const batchN = Math.floor(i / BATCH_SIZE) + 1;

    logger.info(`\n📦 Batch ${batchN}/${totalBatches}: ${batch.join(", ")}`);

    await Promise.all(
      batch.map((medicine) =>
        limit(async () => {
          try {
            const [r1, r2, r3] = await Promise.allSettled([
              scrapePharmEasy(medicine),
              scrapeNetmeds(medicine),
              scrapeMedkart(medicine),
            ]);

            const peR = r1.status === "fulfilled" ? r1.value : [];
            const nmR = r2.status === "fulfilled" ? r2.value : [];
            const mkR = r3.status === "fulfilled" ? r3.value : [];

            const all = [...peR, ...nmR, ...mkR];

            // ✅ ADDED: collect results
            allScrapedResults.push(...all);

            if (all.length === 0) {
              stats.skipped++;
              logger.warn(`⏭️  No results: ${medicine}`);
              return;
            }

            for (const result of all) {
              await Medicine.findOneAndUpdate(
                {
                  searchQuery: result.searchQuery,
                  platform:    result.platform,
                  url:         result.url,
                },
                result,
                { upsert: true, returnDocument: "after" }
              );
              stats.total++;
            }

            stats.pharmeasy += peR.length;
            stats.netmeds   += nmR.length;
            stats.medkart   += mkR.length;

            logger.info(
              `✅ ${medicine}: ${all.length} total ` +
              `[PE:${peR.length} NM:${nmR.length} MK:${mkR.length}]`
            );
          } catch (err) {
            stats.failed++;
            logger.error(`❌ ${medicine}: ${err}`);
          }
        })
      )
    );

    if (i + BATCH_SIZE < MEDICINE_LIST.length) {
      logger.info("⏳ Pausing 5s...");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  logger.info(`
╔══════════════════════════════════╗
║       SCRAPER COMPLETE           ║
╠══════════════════════════════════╣
║ Total saved:  ${String(stats.total).padEnd(19)}║
║ PharmEasy:    ${String(stats.pharmeasy).padEnd(19)}║
║ Netmeds:      ${String(stats.netmeds).padEnd(19)}║
║ Medkart:      ${String(stats.medkart).padEnd(19)}║
║ Failed:       ${String(stats.failed).padEnd(19)}║
║ Skipped:      ${String(stats.skipped).padEnd(19)}║
╚══════════════════════════════════╝`);

  // ✅ ADDED: generate & upload report
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportName = `scraper-report-${timestamp}.json`;

  const reportContent = JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    results: allScrapedResults
  }, null, 2);

  logger.info(`📄 Generating report: ${reportName}`);

try {
  await uploadToS3(reportName, reportContent);
} catch (err) {
  logger.error(`❌ S3 Upload Failed: ${err}`);
} finally {
  await mongoose.disconnect();
}
  process.exit(0);
};

runScraper().catch((err) => {
  logger.error(`Fatal: ${err}`);
  process.exit(1);
});