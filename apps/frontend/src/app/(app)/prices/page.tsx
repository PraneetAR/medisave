"use client";

import { useState } from "react";
import api from "@/services/api";

interface Medicine {
  _id:          string;
  medicineName: string;
  platform:     string;
  price:        number;
  mrp:          number | null;
  discount:     number | null;
  unit:         string;
  url:          string;
  inStock:      boolean;
  imageUrl:     string | null;
}

interface SearchResult {
  query:          string;
  totalFound:     number;
  platformsFound: string[];
  bestDeal:       Medicine;
  byPlatform:     Record<string, Medicine[]>;
  lastUpdated:    string;
}

const PLATFORM_COLORS: Record<string, string> = {
  PharmEasy: "bg-green-100 text-green-800",
  Netmeds:   "bg-blue-100 text-blue-800",
  Medkart:   "bg-purple-100 text-purple-800",
};

const SUGGESTIONS = [
  "paracetamol", "amoxicillin", "omeprazole",
  "metformin", "atorvastatin", "azithromycin",
  "cetirizine", "vitamin d3", "pantoprazole",
];

function MedicineCard({ med }: { med: Medicine }) {
  const hasDiscount = med.discount && med.discount > 0;
  const hasMrp      = med.mrp && med.mrp > med.price;

  return (
    
      href={med.url}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-white flex gap-3"
    >
      {med.imageUrl ? (
        <img
          src={med.imageUrl}
          alt={med.medicineName}
          className="w-14 h-14 object-contain rounded-lg bg-gray-50 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
          💊
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
          {med.medicineName}
        </p>
        <p className="text-xs text-gray-400 mb-2">{med.unit}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-gray-900">
              ₹{med.price}
            </span>
            {hasMrp && (
              <span className="text-xs text-gray-400 line-through ml-1">
                ₹{med.mrp}
              </span>
            )}
          </div>
          {hasDiscount ? (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
              {med.discount}% off
            </span>
          ) : (
            !med.inStock && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                Out of stock
              </span>
            )
          )}
        </div>
      </div>
    </a>
  );
}

export default function PricesPage() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const search = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await api.get(`/medicines/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medicine Price Comparison</h1>
        <p className="text-gray-500 mt-1">Compare prices across PharmEasy, Netmeds and Medkart</p>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder="Search medicine (e.g. paracetamol, metformin...)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => search()}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); search(s); }}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {results && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{results.totalFound}</span>
              {" "}results for{" "}
              <span className="font-semibold text-gray-800">&quot;{results.query}&quot;</span>
              {" "}across {results.platformsFound.join(", ")}
            </p>
            <p className="text-xs text-gray-400">
              Updated {new Date(results.lastUpdated).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-4">
            <div className="text-2xl">🏆</div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-0.5">Best Deal</p>
              <p className="font-semibold text-gray-900">{results.bestDeal.medicineName}</p>
              <p className="text-xs text-gray-500">{results.bestDeal.platform}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-700">₹{results.bestDeal.price}</p>
              {results.bestDeal.mrp && (
                <p className="text-xs text-gray-400 line-through">MRP ₹{results.bestDeal.mrp}</p>
              )}
              {results.bestDeal.discount && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {results.bestDeal.discount}% OFF
                </span>
              )}
            </div>
            
              href={results.bestDeal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Buy Now
            </a>
          </div>

          {Object.entries(results.byPlatform).map(([platform, meds]) => (
            <div key={platform} className="mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${PLATFORM_COLORS[platform] ?? "bg-gray-100 text-gray-700"}`}>
                  {platform}
                </span>
                <span className="text-gray-400">{meds.length} results</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {meds.slice(0, 6).map((med) => (
                  <MedicineCard key={med._id} med={med} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!results && !loading && !error && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">💊</div>
          <p className="text-lg font-medium text-gray-500">Search for any medicine</p>
          <p className="text-sm">Compare prices instantly across 3 platforms</p>
        </div>
      )}

    </div>
  );
}
