import mongoose, { Document, Schema } from "mongoose";

export interface IMedicine extends Document {
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

const medicineSchema = new Schema<IMedicine>({
  medicineName: { type: String, required: true },
  searchQuery:  { type: String, required: true },
  platform:     { type: String, required: true },
  price:        { type: Number, required: true },
  mrp:          { type: Number, default: null },
  discount:     { type: Number, default: null },
  unit:         { type: String, default: "per pack" },
  url:          { type: String, required: true },
  inStock:      { type: Boolean, default: true },
  imageUrl:     { type: String, default: null },
  scrapedAt:    { type: Date,   default: Date.now },
});

medicineSchema.index({ searchQuery: 1, price: 1 });
medicineSchema.index({ searchQuery: 1, platform: 1 });
medicineSchema.index({ medicineName: "text", searchQuery: "text" });

export const Medicine = mongoose.model<IMedicine>("Medicine", medicineSchema);
