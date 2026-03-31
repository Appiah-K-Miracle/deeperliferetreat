"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DISTRICTS, DISTRICT_LOCATIONS } from "@/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AltarCallRecord {
  id: string;
  fullName: string;
  phone: string;
  district: string | null;
  location: string | null;
  isFirstTimer: boolean | null;
  registrationId: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return {
    date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase(),
  };
}

const PAGE_SIZE = 10;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminAltarCallPage() {
  const [records, setRecords] = useState<AltarCallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Staged filters (edited in UI)
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterFirstTimer, setFilterFirstTimer] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>(undefined);
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>(undefined);

  // Applied filters (sent to API)
  const [appliedFilters, setAppliedFilters] = useState({
    district: "",
    location: "",
    firstTimer: "",
    dateFrom: "",
    dateTo: "",
  });

  const locationOptions = filterDistrict ? (DISTRICT_LOCATIONS[filterDistrict] ?? []) : [];

  function buildQuery(f: typeof appliedFilters) {
    const params = new URLSearchParams();
    if (f.district) params.set("district", f.district);
    if (f.location) params.set("location", f.location);
    if (f.firstTimer) params.set("isFirstTimer", f.firstTimer);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);
    return params.toString();
  }

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const qs = buildQuery(appliedFilters);
      const res = await fetch(`/api/altar-call?${qs}`);
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
        setTotal(json.total);
        setPage(1);
      }
    } catch {
      toast.error("Failed to load altar calls");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  function applyFilters() {
    setAppliedFilters({
      district: filterDistrict,
      location: filterLocation,
      firstTimer: filterFirstTimer,
      dateFrom: filterDateFrom ? format(filterDateFrom, "yyyy-MM-dd") : "",
      dateTo: filterDateTo ? format(filterDateTo, "yyyy-MM-dd") : "",
    });
  }

  function resetFilters() {
    setFilterDistrict("");
    setFilterLocation("");
    setFilterFirstTimer("");
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setAppliedFilters({ district: "", location: "", firstTimer: "", dateFrom: "", dateTo: "" });
  }

  function handleExport(type: "excel" | "pdf") {
    const qs = buildQuery(appliedFilters);
    window.open(`/api/export/altar-call/${type}${qs ? `?${qs}` : ""}`, "_blank");
  }

  const firstTimerCount = records.filter((r) => r.isFirstTimer === true).length;
  const linkedCount = records.filter((r) => r.registrationId).length;
  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const pageRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-2 space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#001e3d] tracking-tight">
            Altar Call Management
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            Reviewing 2026 spiritual response records and follow-up paths.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleExport("excel")}
            disabled={loading || records.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#001e3d] border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={loading || records.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#001e3d] border border-slate-200 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* ── Metrics Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#133358] flex items-center justify-center text-white shrink-0">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Responses</p>
            <h3 className="text-3xl font-black text-[#001e3d]">{loading ? "—" : total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#d5e3fc] flex items-center justify-center text-[#133358] shrink-0">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V8H4v2H2v2h2v2h2v-2h2v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">First Timers</p>
            <h3 className="text-3xl font-black text-[#001e3d]">{loading ? "—" : firstTimerCount}</h3>
            {!loading && total > 0 && (
              <p className="text-xs text-slate-500 font-medium mt-1">
                {Math.round((firstTimerCount / total) * 100)}% of total volume
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#acc8f5]/30 flex items-center justify-center text-[#436087] shrink-0">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Linked to Register</p>
            <h3 className="text-3xl font-black text-[#001e3d]">{loading ? "—" : linkedCount}</h3>
            {!loading && total > 0 && (
              <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#436087] h-full rounded-full transition-all"
                  style={{ width: `${Math.round((linkedCount / total) * 100)}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
        {/* Row 1: District | Area | First Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">District</label>
            <select
              value={filterDistrict}
              onChange={(e) => { setFilterDistrict(e.target.value); setFilterLocation(""); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#436087]/20 focus:border-[#436087] outline-none"
            >
              <option value="">All Districts</option>
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              Area / Location
            </label>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              disabled={locationOptions.length === 0}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#436087]/20 focus:border-[#436087] outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option value="">
                {locationOptions.length === 0 ? "Select district first" : "All Areas"}
              </option>
              {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">First Timer</label>
            <select
              value={filterFirstTimer}
              onChange={(e) => setFilterFirstTimer(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#436087]/20 focus:border-[#436087] outline-none"
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        {/* Row 2: Date From | Date To | Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Date From</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:border-[#436087] transition-colors">
                  <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className={filterDateFrom ? "text-slate-800" : "text-slate-400"}>
                    {filterDateFrom ? format(filterDateFrom, "dd MMM yyyy") : "Pick a date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDateFrom}
                  onSelect={setFilterDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Date To</label>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-left flex items-center gap-2 hover:border-[#436087] transition-colors">
                  <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className={filterDateTo ? "text-slate-800" : "text-slate-400"}>
                    {filterDateTo ? format(filterDateTo, "dd MMM yyyy") : "Pick a date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterDateTo}
                  onSelect={setFilterDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 bg-[#133358] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              title="Reset filters"
              className="text-slate-500 hover:text-[#001e3d] px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Records Table ── */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500">
                <th className="py-5 px-6 font-bold text-[10px] uppercase tracking-widest w-12 text-center">#</th>
                <th className="py-5 px-4 font-bold text-[10px] uppercase tracking-widest">Full Name</th>
                <th className="py-5 px-4 font-bold text-[10px] uppercase tracking-widest">Phone</th>
                <th className="py-5 px-4 font-bold text-[10px] uppercase tracking-widest">District / Area</th>
                <th className="py-5 px-4 font-bold text-[10px] uppercase tracking-widest">First Timer</th>
                <th className="py-5 px-4 font-bold text-[10px] uppercase tracking-widest text-right">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-slate-50/50" : ""}>
                    {[12, 36, 24, 28, 16, 20].map((w, j) => (
                      <td key={j} className="py-5 px-4">
                        <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${w * 4}px` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 text-sm">
                    No altar call records found
                  </td>
                </tr>
              ) : (
                pageRecords.map((rec, idx) => {
                  const { date, time } = formatDate(rec.createdAt);
                  const rowNum = String((page - 1) * PAGE_SIZE + idx + 1).padStart(2, "0");
                  return (
                    <tr
                      key={rec.id}
                      className={`group transition-colors hover:bg-slate-50 ${idx % 2 === 1 ? "bg-slate-50/40" : ""}`}
                    >
                      <td className="py-5 px-6 text-sm text-slate-400 text-center">{rowNum}</td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#001e3d]">{rec.fullName}</span>
                          {!rec.registrationId && (
                            <span className="bg-[#d4e3ff] text-[#001c3a] px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                              New
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4 text-sm text-slate-700 font-mono">{rec.phone}</td>
                      <td className="py-5 px-4">
                        {rec.district ? (
                          <>
                            <div className="text-sm font-medium text-[#001e3d]">{rec.district}</div>
                            <div className="text-[10px] text-slate-400">{rec.location ?? "—"}</div>
                          </>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        {rec.isFirstTimer === true ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d5e3fc] text-[#57657a]">
                            Yes
                          </span>
                        ) : rec.isFirstTimer === false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                            No
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="text-sm font-medium text-[#001e3d]">{date}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{time}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">
            {loading
              ? "Loading…"
              : `Showing ${pageRecords.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, records.length)} of ${total} entries`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5 && page > 3) p = page - 2 + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                    page === p ? "bg-[#133358] text-white" : "text-[#001e3d] hover:bg-slate-100"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <span className="px-1 text-slate-400">…</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[#001e3d] font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors disabled:opacity-30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Panel ── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 bg-[#133358] p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Weekly Spiritual Momentum</h4>
            <p className="text-[#809cc7] text-sm max-w-md mb-6">
              Capture every soul at the altar. Use the filters above to focus your follow-up efforts by district, area, or first-timer status.
            </p>
            <button
              onClick={() => handleExport("pdf")}
              className="bg-white text-[#001e3d] px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all"
            >
              Export Report
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#436087] rounded-full opacity-20 blur-3xl pointer-events-none" />
        </div>

        <div className="md:col-span-2 bg-white border border-slate-100 shadow-sm p-8 rounded-3xl">
          <h4 className="text-lg font-bold text-[#001e3d] mb-4">Quick Summary</h4>
          <div className="space-y-4">
            <SummaryRow dot="bg-[#133358]" label="Total Responses" value={loading ? "…" : String(total)} />
            <SummaryRow dot="bg-[#436087]" label="First Timers" value={loading ? "…" : String(firstTimerCount)} />
            <SummaryRow dot="bg-green-500" label="Linked to Registration" value={loading ? "…" : String(linkedCount)} />
            <SummaryRow dot="bg-amber-400" label="Unregistered" value={loading ? "…" : String(records.filter((r) => !r.registrationId).length)} />
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}

function SummaryRow({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-[#001e3d]">{value}</span>
    </div>
  );
}

