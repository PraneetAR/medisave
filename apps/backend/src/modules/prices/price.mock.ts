import { IPriceResult } from "./price.model";

// Simulates what real scrapers will return
// When we build real scrapers, we ONLY replace this file
const mockDatabase: Record<string, IPriceResult[]> = {
  paracetamol: [
    {
      platform: "Netmeds",
      productName: "Crocin Advance 500mg Tablet (15 Tabs)",
      price: 34.0,
      originalPrice: 40.0,
      unit: "15 tablets",
      url: "https://www.netmeds.com/prescriptions/crocin-advance-500mg-tablet-15-s",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "PharmEasy",
      productName: "Crocin 500mg Tablet (Strip of 15)",
      price: 31.5,
      originalPrice: 35.0,
      unit: "15 tablets",
      url: "https://pharmeasy.in/online-medicine-order/crocin-500mg-strip-of-15-tablets",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "1mg",
      productName: "Crocin Pain Relief 500mg (15 Tabs)",
      price: 36.0,
      originalPrice: null,
      unit: "15 tablets",
      url: "https://www.1mg.com/drugs/crocin-pain-relief-tablet-104729",
      inStock: false,
      imageUrl: null,
    },
  ],
  ibuprofen: [
    {
      platform: "Netmeds",
      productName: "Brufen 400mg Tablet (15 Tabs)",
      price: 28.5,
      originalPrice: 32.0,
      unit: "15 tablets",
      url: "https://www.netmeds.com/prescriptions/brufen-400mg-tablet-15-s",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "PharmEasy",
      productName: "Ibugesic 400mg Tablet (Strip of 15)",
      price: 25.0,
      originalPrice: null,
      unit: "15 tablets",
      url: "https://pharmeasy.in/online-medicine-order/ibugesic-400mg-strip-of-15-tablets",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "1mg",
      productName: "Brufen 400mg (15 Tabs)",
      price: 29.0,
      originalPrice: 33.0,
      unit: "15 tablets",
      url: "https://www.1mg.com/drugs/brufen-400mg-tablet",
      inStock: true,
      imageUrl: null,
    },
  ],
  amoxicillin: [
    {
      platform: "Netmeds",
      productName: "Amoxil 500mg Capsule (10 Caps)",
      price: 89.0,
      originalPrice: 99.0,
      unit: "10 capsules",
      url: "https://www.netmeds.com/prescriptions/amoxil-500mg-capsule-10-s",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "PharmEasy",
      productName: "Amoxicillin 500mg Capsule (10 Caps)",
      price: 82.0,
      originalPrice: null,
      unit: "10 capsules",
      url: "https://pharmeasy.in/online-medicine-order/amoxicillin-500mg-capsule",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "1mg",
      productName: "Novamox 500mg Capsule (10 Caps)",
      price: 91.0,
      originalPrice: 100.0,
      unit: "10 capsules",
      url: "https://www.1mg.com/drugs/novamox-500mg-capsule",
      inStock: false,
      imageUrl: null,
    },
  ],
  metformin: [
    {
      platform: "Netmeds",
      productName: "Glycomet 500mg Tablet (20 Tabs)",
      price: 22.0,
      originalPrice: 26.0,
      unit: "20 tablets",
      url: "https://www.netmeds.com/prescriptions/glycomet-500mg-tablet-20-s",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "PharmEasy",
      productName: "Metformin 500mg Tablet (20 Tabs)",
      price: 19.5,
      originalPrice: null,
      unit: "20 tablets",
      url: "https://pharmeasy.in/online-medicine-order/metformin-500mg-tablet",
      inStock: true,
      imageUrl: null,
    },
    {
      platform: "1mg",
      productName: "Glucophage 500mg (20 Tabs)",
      price: 24.0,
      originalPrice: 28.0,
      unit: "20 tablets",
      url: "https://www.1mg.com/drugs/glucophage-500mg-tablet",
      inStock: true,
      imageUrl: null,
    },
  ],
};

// Normalize + fuzzy match query against mock keys
export const getMockPrices = (query: string): IPriceResult[] | null => {
  const normalized = query.toLowerCase().trim();

  // Exact match
  if (mockDatabase[normalized]) {
    return mockDatabase[normalized];
  }

  // Partial match — e.g. "para" matches "paracetamol"
  const matchedKey = Object.keys(mockDatabase).find(
    (key) => key.includes(normalized) || normalized.includes(key)
  );

  return matchedKey ? mockDatabase[matchedKey] : null;
};