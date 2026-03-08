"use client";

import { useState } from "react";
import { Search, ExternalLink, Loader2, TrendingDown, Clock } from "lucide-react";
import { pricesApi } from "@/services/api";
import { PriceSearchResult, PriceResult } from "@/types";
import toast from "react-hot-toast";

const PLATFORM_COLORS: Record<string, string> = {
  Netmeds:   "#3b5bdb",
  PharmEasy: "#f59e0b",
  "1mg":     "#22c55e",
};

const SUGGESTIONS = ["Paracetamol", "Ibuprofen", "Amoxicillin", "Metformin"];

export default function PricesPage() {
  const [query, setQuery]       = useState("");
  const [result, setResult]     = useState<PriceSearchResult | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSearch = async (q?: string) => {
    const searchTerm = q ?? query;
    if (!searchTerm.trim()) { toast.error("Enter a medicine name"); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await pricesApi.search(searchTerm);
      setResult(data.data);
      if (q) setQuery(q);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Search failed");
    } finally { setLoading(false); }
  };

  const discount = (r: PriceResult) =>
    r.originalPrice
      ? Math.round(((r.originalPrice - r.price) / r.originalPrice) * 100)
      : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-800"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          Price Comparison
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Find the best price across Netmeds, PharmEasy, and 1mg
        </p>
      </div>

      {/* Search */}
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input-field pl-10"
              placeholder="Search medicine... e.g. Paracetamol"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          </div>
          <button onClick={() => handleSearch()} disabled={loading}
            className="btn-primary flex items-center gap-2 shrink-0">
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />}
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-400">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => handleSearch(s)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#3b5bdb18]
                text-slate-600 hover:text-[#3b5bdb] transition-all duration-150 font-medium">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div>
          {/* Meta info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-800 capitalize">{result.searchKey}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {result.meta.totalResults} results
              </span>
              {result.fromCache && (
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" /> Cached
                </span>
              )}
            </div>
          </div>

          {/* Best Deal Banner */}
          {result.bestDeal && (
            <div className="mb-4 p-4 rounded-2xl border-2 flex items-center gap-4"
              style={{ borderColor: "#22c55e", backgroundColor: "#22c55e08" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#22c55e18" }}>
                <TrendingDown className="w-5 h-5" style={{ color: "#22c55e" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide mb-0.5"
                  style={{ color: "#16a34a" }}>
                  Best Deal
                </p>
                <p className="font-medium text-slate-800 text-sm truncate">
                  {result.bestDeal.productName}
                </p>
                <p className="text-xs text-slate-500">{result.bestDeal.platform}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
                  ₹{result.bestDeal.price}
                </p>
                <p className="text-xs text-slate-500">{result.bestDeal.unit}</p>
              </div>
              <a href={result.bestDeal.url} target="_blank" rel="noopener noreferrer"
                className="btn-primary text-sm flex items-center gap-1.5 shrink-0"
                style={{ backgroundColor: "#22c55e" }}>
                Buy <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* All Results */}
          <div className="space-y-3">
            {result.results.map((r, i) => {
              const disc = discount(r);
              const color = PLATFORM_COLORS[r.platform] ?? "#3b5bdb";
              const isBest = result.bestDeal?.platform === r.platform &&
                result.bestDeal?.price === r.price;
              return (
                <div key={i} className="card flex items-center gap-4 py-4"
                  style={{ opacity: r.inStock ? 1 : 0.55 }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: color }}>
                    {r.platform.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-slate-800 text-sm">{r.productName}</p>
                      {isBest && <span className="badge-green">Best Price</span>}
                      {!r.inStock && <span className="badge-red">Out of Stock</span>}
                    </div>
                    <p className="text-xs text-slate-500">{r.platform} · {r.unit}</p>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <p className="text-lg font-bold text-slate-800">₹{r.price}</p>
                    {r.originalPrice && (
                      <p className="text-xs text-slate-400 line-through">₹{r.originalPrice}</p>
                    )}
                    {disc && (
                      <p className="text-xs font-medium" style={{ color: "#22c55e" }}>
                        {disc}% off
                      </p>
                    )}
                  </div>
                  {r.inStock && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="card text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="font-semibold text-slate-800 mb-1">Search for a medicine</h3>
          <p className="text-slate-500 text-sm">
            Compare prices across multiple platforms instantly
          </p>
        </div>
      )}
    </div>
  );
}
