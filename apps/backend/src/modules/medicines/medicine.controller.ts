import { Request, Response, NextFunction } from "express";
import { Medicine } from "./medicine.model";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export class MedicineController {

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string)?.trim();
      if (!q || q.length < 2)
        throw new ApiError(400, "Query must be at least 2 characters");

      const results = await Medicine.find({
        $or: [
          { searchQuery: { $regex: q, $options: "i" } },
          { medicineName: { $regex: q, $options: "i" } },
        ],
      })
        .sort({ price: 1 })
        .limit(40);

      if (results.length === 0)
        throw new ApiError(
          404,
          `No results found for "${q}". Try: paracetamol, amoxicillin, omeprazole.`
        );

      // Group by platform
      const byPlatform = results.reduce((acc, r) => {
        if (!acc[r.platform]) acc[r.platform] = [];
        acc[r.platform].push(r);
        return acc;
      }, {} as Record<string, typeof results>);

      res.json(
        new ApiResponse(200, "Medicine search results", {
          query:          q,
          totalFound:     results.length,
          platformsFound: Object.keys(byPlatform),
          bestDeal:       results[0],
          results,
          byPlatform,
          lastUpdated:    results[0]?.scrapedAt ?? null,
        })
      );
    } catch (err) { next(err); }
  }

  async stats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [total, platforms, medicines, lastScrape] = await Promise.all([
        Medicine.countDocuments(),
        Medicine.distinct("platform"),
        Medicine.distinct("searchQuery"),
        Medicine.findOne().sort({ scrapedAt: -1 }).select("scrapedAt platform"),
      ]);

      res.json(
        new ApiResponse(200, "Scraper stats", {
          totalRecords:    total,
          platforms,
          uniqueMedicines: medicines.length,
          lastScrapeAt:    lastScrape?.scrapedAt ?? null,
          lastPlatform:    lastScrape?.platform  ?? null,
        })
      );
    } catch (err) { next(err); }
  }
}

export const medicineController = new MedicineController();
