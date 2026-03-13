import { client, parsePrice, calcDiscount, sleep, ScrapedMedicine } from "./base.scraper";
import { logger } from "../utils/logger";

const BASE = "https://www.netmeds.com";

export const scrapeNetmeds = async (query: string): Promise<ScrapedMedicine[]> => {
  const results: ScrapedMedicine[] = [];

  try {
    const res  = await client.get(
      `${BASE}/products?q=${encodeURIComponent(query)}`,
      { timeout: 25000 }
    );
    const html = res.data as string;

    const start = html.indexOf("window.__INITIAL_STATE__=");
    if (start === -1) return [];

    const jsonStart = html.indexOf("{", start);
    let depth = 0, end = jsonStart;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      if (html[i] === "}") depth--;
      if (depth === 0) { end = i + 1; break; }
    }

    const json  = JSON.parse(html.slice(jsonStart, end));
    const items = json?.productListingPage?.productlists?.items ?? [];

    for (const item of items.slice(0, 8)) {
      if (!item.sellable) continue;

      const price = parsePrice(String(item.price?.effective?.min ?? "0"));
      const mrp   = parsePrice(String(item.price?.marked?.min ?? "0"));
      if (price === 0) continue;

      // Parse discount string e.g. "18% OFF" → 18
      let discount: number | null = null;
      if (typeof item.discount === "string") {
        const match = item.discount.match(/(\d+)/);
        if (match) discount = parseInt(match[1]);
      }

      results.push({
        medicineName: item.name,
        searchQuery:  query,
        platform:     "Netmeds",
        price,
        mrp:      mrp > price ? mrp : null,
        discount: discount ?? calcDiscount(price, mrp > price ? mrp : null),
        unit:     "per pack",
        url:      item.slug
          ? `${BASE}/product/${item.slug}`
          : `${BASE}/products?q=${encodeURIComponent(query)}`,
        inStock:   item.sellable ?? true,
        imageUrl:  item.medias?.[0]?.url ?? null,
        scrapedAt: new Date(),
      });
    }

    logger.debug(`Netmeds "${query}": ${results.length} results`);
  } catch (err) {
    logger.warn(`Netmeds error "${query}": ${err}`);
  }

  await sleep(600);
  return results;
};
