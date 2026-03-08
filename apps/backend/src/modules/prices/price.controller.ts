import { Request, Response, NextFunction } from "express";
import { priceService } from "./price.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

export class PriceController {

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;

      if (!query) {
        throw new ApiError(400, "Query parameter 'q' is required");
      }

      const result = await priceService.search(query);

      res.json(
        new ApiResponse(200, "Price comparison results", {
          ...result,
          meta: {
            totalResults: result.results.length,
            inStockCount: result.results.filter((r) => r.inStock).length,
            source: result.fromCache ? "cache" : "live",
          },
        })
      );
    } catch (err) {
      next(err);
    }
  }

  async cacheStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = req.query.q as string;
      if (!query) throw new ApiError(400, "Query parameter 'q' is required");

      const status = await priceService.getCacheStatus(query);
      res.json(new ApiResponse(200, "Cache status", status));
    } catch (err) {
      next(err);
    }
  }
}

export const priceController = new PriceController();