import { PriceCache, IPriceResult } from "./price.model";
import { getMockPrices } from "./price.mock";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../utils/logger";
import { CONSTANTS } from "../../config/constants";

export interface PriceSearchResult {
  searchKey: string;
  results: IPriceResult[];
  bestDeal: IPriceResult | null;
  fromCache: boolean;
  fetchedAt: Date;
}

export class PriceService {

  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, " ");
  }

  async search(query: string): Promise<PriceSearchResult> {
    if (!query || query.trim().length < 2) {
      throw new ApiError(400, "Search query must be at least 2 characters");
    }

    const searchKey = this.normalizeQuery(query);

    // 1. Check cache first
    const cached = await PriceCache.findOne({ searchKey });
    if (cached) {
      logger.debug(`Price cache hit for: ${searchKey}`);
      return {
        searchKey,
        results: cached.results,
        bestDeal: this.getBestDeal(cached.results),
        fromCache: true,
        fetchedAt: cached.fetchedAt,
      };
    }

    // 2. Cache miss — fetch fresh data (mock for now)
    logger.info(`Price cache miss — fetching data for: ${searchKey}`);
    const results = await this.fetchPrices(searchKey);

    if (results.length === 0) {
      throw new ApiError(
        404,
        `No results found for "${query}". Try: paracetamol, ibuprofen, amoxicillin, metformin`
      );
    }

    // 3. Sort by price ascending
    const sorted = results.sort((a, b) => a.price - b.price);

    // 4. Save to cache with TTL
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + CONSTANTS.PRICE_CACHE_TTL_HOURS * 60 * 60 * 1000
    );

    await PriceCache.findOneAndUpdate(
      { searchKey },
      { searchKey, results: sorted, fetchedAt: now, expiresAt },
      { upsert: true, new: true }
    );

    return {
      searchKey,
      results: sorted,
      bestDeal: this.getBestDeal(sorted),
      fromCache: false,
      fetchedAt: now,
    };
  }

  async getCacheStatus(query: string): Promise<{
    cached: boolean;
    expiresAt: Date | null;
    fetchedAt: Date | null;
  }> {
    const searchKey = this.normalizeQuery(query);
    const cached = await PriceCache.findOne({ searchKey });

    return {
      cached: !!cached,
      expiresAt: cached?.expiresAt ?? null,
      fetchedAt: cached?.fetchedAt ?? null,
    };
  }

  private async fetchPrices(query: string): Promise<IPriceResult[]> {
    // This is where real scrapers will plug in later:
    // const [netmeds, pharmeasy] = await Promise.allSettled([
    //   netmedsScraper.search(query),
    //   pharmeaScraper.search(query),
    // ]);
    // return [...netmeds.results, ...pharmeasy.results];

    const mock = getMockPrices(query);
    return mock ?? [];
  }

  private getBestDeal(results: IPriceResult[]): IPriceResult | null {
    const inStock = results.filter((r) => r.inStock);
    if (inStock.length === 0) return null;
    return inStock.reduce((best, curr) =>
      curr.price < best.price ? curr : best
    );
  }
}

export const priceService = new PriceService();