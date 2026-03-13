import { fetchHtml, parsePrice, calcDiscount, sleep, ScrapedMedicine } from "./base.scraper";
import { logger } from "../utils/logger";

const BASE = "https://www.medkart.in";

export const scrapeMedkart = async (query: string): Promise<ScrapedMedicine[]> => {
  const url = `${BASE}/search/all?page=1&search=${encodeURIComponent(query)}`;
  const $   = await fetchHtml(url);
  if (!$) return [];

  const results: ScrapedMedicine[] = [];

  try {
    $("[class*='card']").each((_, el) => {
      try {
        const card = $(el);

        // Skip cards with no product link
        const anchor = card.find("a[href*='/order-medicine/']").first();
        if (!anchor.length) return;

        const href = anchor.attr("href") ?? "";
        const url  = href.startsWith("http") ? href : `${BASE}${href}`;

        // Name — p with color #0C111D inside anchor
        const name = anchor.find("p").first().text().trim();
        if (!name || name.length < 2) return;

        // Out of stock check
        const cardHtml  = card.html() ?? "";
        const outOfStock =
          cardHtml.includes("Out Of Stock") ||
          cardHtml.includes("Not For Online Sale");

        // Image — main product image (not the "Share" badge)
        const imgSrc = card
          .find("img")
          .filter((_, img) => {
            const alt = $(img).attr("alt") ?? "";
            const src = $(img).attr("src") ?? "";
            return (
              alt !== "Share" &&
              !src.includes("medkart_assured") &&
              !src.includes("common_icon")
            );
          })
          .first()
          .attr("src") ?? null;

        // Price — find paragraphs with ₹ symbol
        // Structure: <p>MRP ₹</p><p>MRP_VALUE</p> then <p>₹PRICE</p>
        const allParas = card.find("p");
        let mrp: number | null   = null;
        let price: number | null = null;

        allParas.each((i, p) => {
          const text = $(p).text().trim();
          if (text === "MRP ₹") {
            // Next p is the MRP value
            const mrpText = allParas.eq(i + 1).text().trim();
            mrp = parsePrice(mrpText);
          }
          // Price: p containing ₹ followed by number, not "MRP ₹"
          if (text.startsWith("₹") && text !== "₹") {
            const val = parsePrice(text);
            if (val > 0) price = val;
          }
        });

        // If no separate price found, use MRP
        if (!price && mrp) price = mrp;
        if (!price || price === 0) return;

        results.push({
          medicineName: name,
          searchQuery:  query,
          platform:     "Medkart",
          price,
          mrp:      mrp && mrp > price ? mrp : null,
          discount: calcDiscount(price, mrp && mrp > price ? mrp : null),
          unit:     "per pack",
          url,
          inStock:   !outOfStock,
          imageUrl:  imgSrc,
          scrapedAt: new Date(),
        });
      } catch {}
    });

    logger.debug(`Medkart "${query}": ${results.length} results`);
  } catch (err) {
    logger.warn(`Medkart error "${query}": ${err}`);
  }

  await sleep(600);
  return results.slice(0, 8);
};
