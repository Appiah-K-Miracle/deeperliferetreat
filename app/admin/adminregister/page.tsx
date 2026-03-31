"use client";

import { useState } from "react";
import { Lock, UserCheck, CalendarDays, Users } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTRICTS, DISTRICT_LOCATIONS } from "@/constants";

// ─── Constants ───────────────────────────────────────────────────────────────

const GROUP_OPTIONS = ["Youth", "Adult", "Campus", "Children"];
const STATUS_OPTIONS = ["Member", "Visitor"];
const GENDER_OPTIONS = ["Male", "Female"];

const EMPTY_FORM = {
  fullName: "",
  group: "",
  district: "",
  location: "",
  status: "",
  gender: "",
  phone: "",
  email: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

const fieldClass =
  "w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRegisterPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const locationOptions = form.district ? (DISTRICT_LOCATIONS[form.district] ?? []) : [];

  const isValid =
    form.fullName.trim() &&
    form.group &&
    form.district &&
    form.status &&
    form.gender &&
    form.phone.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          group: form.group.toLowerCase(),
          status: form.status.toLowerCase(),
          gender: form.gender.toLowerCase(),
        }),
      });
      if (res.ok) {
        toast.success(`${form.fullName} has been registered successfully.`);
        setForm(EMPTY_FORM);
      } else {
        const json = await res.json().catch(() => null);
        toast.error(json?.error ?? "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Page heading ─────────────────────────────────────────────── */}
      <div className="mb-6 sm:mb-10 flex items-end justify-between">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <nav className="flex space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            <span className="hover:text-[#133358] cursor-default transition-colors">
              Registrations
            </span>
            <span>/</span>
            <span className="text-[#133358]">New Attendee</span>
          </nav>
          <h2 className="text-3xl font-bold text-[#133358] tracking-tight">
            Retreat Registration
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Complete the form below to enroll a new participant in the 2026 Deeper Life Retreat.
          </p>
        </div>
        <div className="hidden sm:block px-4 py-2 bg-blue-50 text-[#133358] rounded-lg text-xs font-bold uppercase tracking-wider">
          Retreat 2026
        </div>
      </div>

      {/* ── Form card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">

          {/* Section 1 — Personal Information */}
          <div className="p-4 sm:p-8 grid grid-cols-12 gap-4 sm:gap-8">
            <div className="col-span-12 lg:col-span-4">
              <h3 className="text-base font-bold text-[#133358] mb-1">
                Personal Information
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Basic identification and contact details for the retreat attendee.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-5">
              {/* Full Name */}
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  className={fieldClass}
                  placeholder="e.g. Kwame Asante"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Gender */}
                <div>
                  <FieldLabel>Gender</FieldLabel>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    className={fieldClass}
                    type="tel"
                    placeholder="0244123456"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    autoComplete="off"
                  />
                </div>

                {/* Email */}
                <div className="col-span-1 sm:col-span-2">
                  <FieldLabel>
                    Email Address{" "}
                    <span className="normal-case text-slate-400 font-normal tracking-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    className={fieldClass}
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Church Affiliation */}
          <div className="p-4 sm:p-8 grid grid-cols-12 gap-4 sm:gap-8 bg-slate-50/40">
            <div className="col-span-12 lg:col-span-4">
              <h3 className="text-base font-bold text-[#133358] mb-1">
                Church Affiliation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Placement information to help group attendees with their local communities.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Group */}
                <div>
                  <FieldLabel>Group</FieldLabel>
                  <Select value={form.group} onValueChange={(v) => setForm({ ...form, group: v })}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUP_OPTIONS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* District */}
                <div>
                  <FieldLabel>District</FieldLabel>
                  <Select
                    value={form.district}
                    onValueChange={(v) => setForm({ ...form, district: v, location: "" })}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <FieldLabel>Area / Location</FieldLabel>
                  <Select
                    value={form.location}
                    onValueChange={(v) => setForm({ ...form, location: v })}
                    disabled={locationOptions.length === 0}
                  >
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder={locationOptions.length === 0 ? "Select district first" : "Select area"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 sm:px-8 py-4 sm:py-5 bg-slate-50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 sm:justify-between">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs italic">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              Secure processing for retreat records.
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex-1 sm:flex-none px-5 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors rounded-lg text-center"
                onClick={() => setForm(EMPTY_FORM)}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="flex-1 sm:flex-none px-7 py-2.5 bg-[#133358] text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserCheck className="h-4 w-4" />
                {submitting ? "Registering…" : "Register Attendee"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Footer Bento Cards ────────────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-12 gap-6">
        {/* Capacity card */}
        <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 text-[#133358] flex items-center justify-center shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Capacity
              </p>
              <p className="text-xl font-bold text-[#133358]">142 / 200</p>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#133358] h-full w-[71%] rounded-full" />
          </div>
        </div>

        {/* Deadline card */}
        <div className="col-span-12 md:col-span-8 bg-[#133358] p-6 rounded-xl text-white relative overflow-hidden flex items-center">
          <div className="relative z-10 space-y-1">
            <h4 className="text-lg font-bold">Registration Deadline</h4>
            <p className="text-sm text-blue-200 leading-relaxed">
              Ensure all records are updated before the retreat begins.{" "}
              <span className="text-white font-bold">Register early</span> to secure a spot for every attendee.
            </p>
          </div>
          <div className="ml-auto relative z-10 pl-6 shrink-0">
            <CalendarDays className="h-14 w-14 opacity-20" />
          </div>
          {/* Decorative glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
