import axios from "axios";
import * as cheerio from "cheerio";
import axiosRetry from "axios-retry";
import { logger } from "../utils/logger";

export interface ScrapedMedicine {
  medicineName: string;
  searchQuery:  string;
  platform:     string;
  price:        number;
  mrp:          number | null;
  discount:     number | null;
  unit:         string;
  url:          string;
  inStock:      boolean;
  imageUrl:     string | null;
  scrapedAt:    Date;
}

export const client = axios.create({
  timeout: 20000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection":      "keep-alive",
    "Cache-Control":   "no-cache",
    "Pragma":          "no-cache",
    "Sec-Fetch-Dest":  "document",
    "Sec-Fetch-Mode":  "navigate",
    "Sec-Fetch-Site":  "none",
    "Upgrade-Insecure-Requests": "1",
  },
});

axiosRetry(client, {
  retries:        3,
  retryDelay:     (count) => count * 3000,
  retryCondition: (err) =>
    axiosRetry.isNetworkOrIdempotentRequestError(err) ||
    err.response?.status === 429 ||
    err.response?.status === 503,
});

export const fetchHtml = async (
  url: string
): Promise<cheerio.CheerioAPI | null> => {
  try {
    const res = await client.get(url);
    return cheerio.load(res.data);
  } catch (err: any) {
    logger.warn(`fetchHtml failed: ${url} — ${err.message}`);
    return null;
  }
};

export const parsePrice = (raw: string): number => {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parsed  = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const calcDiscount = (
  price: number,
  mrp: number | null
): number | null => {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
