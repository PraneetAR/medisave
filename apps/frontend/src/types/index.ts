export interface User {
  _id: string;
  name: string;
  email: string;
  timezone: string;
  createdAt: string;
}

export interface ReminderTime {
  hour: number;
  minute: number;
}

export type Frequency = "daily" | "weekly" | "custom";
export type DosageUnit = "mg" | "ml" | "tablet" | "capsule" | "drop";

export interface Reminder {
  _id: string;
  userId: string;
  medicineName: string;
  dosage: number;
  unit: DosageUnit;
  times: ReminderTime[];
  frequency: Frequency;
  activeDays: number[];
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  notifyVia: string[];
  notes: string;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceResult {
  platform: string;
  productName: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  url: string;
  inStock: boolean;
  imageUrl: string | null;
}

export interface PriceSearchResult {
  searchKey: string;
  results: PriceResult[];
  bestDeal: PriceResult | null;
  fromCache: boolean;
  fetchedAt: string;
  meta: {
    totalResults: number;
    inStockCount: number;
    source: "cache" | "live";
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}
