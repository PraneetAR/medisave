import mongoose, { Document, Schema } from "mongoose";

export interface IPriceResult {
  platform: string;
  productName: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  url: string;
  inStock: boolean;
  imageUrl: string | null;
}

export interface IPriceCache extends Document {
  searchKey: string;
  results: IPriceResult[];
  fetchedAt: Date;
  expiresAt: Date;
}

const priceResultSchema = new Schema<IPriceResult>(
  {
    platform: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    unit: { type: String, required: true },
    url: { type: String, required: true },
    inStock: { type: Boolean, default: true },
    imageUrl: { type: String, default: null },
  },
  { _id: false }
);

const priceCacheSchema = new Schema<IPriceCache>({
  searchKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  results: [priceResultSchema],
  fetchedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL index — MongoDB auto-deletes document after expiresAt
priceCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PriceCache = mongoose.model<IPriceCache>(
  "PriceCache",
  priceCacheSchema
);