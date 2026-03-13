import { fetchHtml, parsePrice, sleep, ScrapedMedicine } from "./base.scraper";
import { logger } from "../utils/logger";

const BASE = "https://pharmeasy.in";

export const scrapePharmEasy = async (query: string): Promise<ScrapedMedicine[]> => {
  const url = `${BASE}/search/all?name=${encodeURIComponent(query)}`;
  const $   = await fetchHtml(url);
  if (!$) return [];

  const results: ScrapedMedicine[] = [];

  try {
    const nextData = $("#__NEXT_DATA__").html();
    if (!nextData) return [];

    const json     = JSON.parse(nextData);
    const all      = json?.props?.pageProps?.searchResults ?? [];
    const medicines = all.filter((r: any) => r.entityType === 2 && r.productType === 1);

    for (const p of medicines.slice(0, 8)) {
      if (!p.salePriceDecimal && !p.mrpDecimal) continue;
      const price = parsePrice(String(p.salePriceDecimal ?? p.mrpDecimal ?? "0"));
      const mrp   = parsePrice(String(p.mrpDecimal ?? "0"));
      if (price === 0) continue;

      results.push({
        medicineName: p.name,
        searchQuery:  query,
        platform:     "PharmEasy",
        price,
        mrp:      mrp > 0 && mrp !== price ? mrp : null,
        discount: p.discountPercent ? Math.round(p.discountPercent) : null,
        unit:     p.subtitleText ?? p.packform ?? "per pack",
        url:      p.slug
          ? `${BASE}/medicines/${p.slug}`
          : `${BASE}/search/all?name=${encodeURIComponent(query)}`,
        inStock:   p.productAvailabilityFlags?.isAvailable ?? true,
        imageUrl:  p.image ?? null,
        scrapedAt: new Date(),
      });
    }
    logger.debug(`PharmEasy "${query}": ${results.length} results`);
  } catch (err) {
    logger.warn(`PharmEasy error "${query}": ${err}`);
  }

  await sleep(600);
  return results;
};
