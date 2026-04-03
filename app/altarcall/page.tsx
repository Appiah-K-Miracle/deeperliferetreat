"use client";

import { useState } from "react";
import { DISTRICTS, DISTRICT_LOCATIONS } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

type Step = "phone" | "confirm" | "form" | "success";

interface RegistrationData {
  fullName: string;
  phone: string;
  district?: string | null;
  location?: string | null;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) return "+233" + cleaned.slice(1);
  return cleaned;
}

function isValidGhanaPhone(phone: string): boolean {
  return /^\+233[0-9]{9}$/.test(phone);
}

export default function AltarCallPage() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  // For confirmed (existing) users
  const [existingReg, setExistingReg] = useState<RegistrationData | null>(null);

  // For new users
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("" );
  const [group, setGroup] = useState("");
  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState("");
  const [isFirstTimer, setIsFirstTimer] = useState<boolean | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // ── Step 1: Look up phone ────────────────────────────────────────────────
  async function handlePhoneContinue() {
    setPhoneError("");
    const normalized = normalizePhone(phone);
    if (!isValidGhanaPhone(normalized)) {
      setPhoneError("Enter a valid Ghana phone number (e.g. 0244123456)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/register/by-phone?phone=${encodeURIComponent(phone)}`
      );
      const json = await res.json();

      if (json.success && json.data) {
        setExistingReg(json.data);
        setStep("confirm");
      } else {
        setStep("form");
      }
    } catch {
      setPhoneError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2a: Confirm existing user ────────────────────────────────────────
  async function handleConfirm() {
    if (!existingReg) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/altar-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, isFirstTimer }),
      });
      const json = await res.json();
      if (json.success) {
        setStep("success");
      } else {
        setPhoneError(json.error ?? "Something went wrong");
        setStep("phone");
      }
    } catch {
      setPhoneError("Something went wrong. Please try again.");
      setStep("phone");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 2b: Submit new user ──────────────────────────────────────────────
  async function handleNewSubmit() {
    if (!fullName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/altar-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          fullName,
          gender: gender || null,
          group: group || null,
          district: district || null,
          location: location || null,
          isFirstTimer: isFirstTimer,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStep("success");
      } else {
        setPhoneError(json.error ?? "Something went wrong");
        setStep("phone");
      }
    } catch {
      setPhoneError("Something went wrong. Please try again.");
      setStep("phone");
    } finally {
      setSubmitting(false);
    }
  }

  const locationOptions = district ? (DISTRICT_LOCATIONS[district] ?? []) : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#133358] flex flex-col items-center justify-center px-4 py-8">
      {/* Logo / Header */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-32 w-32 rounded-full  flex items-center justify-center overflow-hidden">
          <Image
            src="/deeperlifelogo.png"
            alt="Deeper Life"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
        <h1 className="text-xl font-bold text-white tracking-wide">Altar Call</h1>
        <p className="text-sm text-white/60">Deeper Life Retreat 2026</p>
      </div>

      <div className="w-full max-w-sm">
        {/* ── STEP: Phone ── */}
        {step === "phone" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-800">Enter Your Phone</h2>
              <p className="text-sm text-gray-500">We&apos;ll look up your information automatically</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0244 123 456"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePhoneContinue()}
                className="h-12 text-base"
                autoFocus
                autoComplete="tel"
              />
              {phoneError && (
                <p className="text-sm text-red-500">{phoneError}</p>
              )}
            </div>

            <Button
              className="w-full h-12 text-base bg-[#133358] hover:bg-[#1a4574]"
              onClick={handlePhoneContinue}
              disabled={!phone.trim() || loading}
            >
              {loading ? "Checking…" : "Continue →"}
            </Button>
          </div>
        )}

        {/* ── STEP: Confirm existing ── */}
        {step === "confirm" && existingReg && (
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-800">Is this you?</h2>
              <p className="text-sm text-gray-500">We found this information</p>
            </div>

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
              <InfoRow label="Name" value={existingReg.fullName} />
              {existingReg.district && (
                <InfoRow label="District" value={existingReg.district} />
              )}
              {existingReg.location && (
                <InfoRow label="Area" value={existingReg.location} />
              )}
            </div>

            {/* First Timer */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Are you a first timer?</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFirstTimer(true)}
                  className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    isFirstTimer === true
                      ? "border-[#133358] bg-[#133358] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#133358]"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsFirstTimer(false)}
                  className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    isFirstTimer === false
                      ? "border-[#133358] bg-[#133358] text-white"
                      : "border-gray-200 text-gray-600 hover:border-[#133358]"
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base bg-[#133358] hover:bg-[#1a4574]"
              onClick={handleConfirm}
              disabled={isFirstTimer === null || submitting}
            >
              {submitting ? "Submitting…" : "Yes, that's me ✓"}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-10 text-gray-500"
              onClick={() => {
                setExistingReg(null);
                setIsFirstTimer(null);
                setStep("phone");
              }}
            >
              ← Not me
            </Button>
          </div>
        )}

        {/* ── STEP: New user form ── */}
        {step === "form" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-gray-800">Your Information</h2>
              <p className="text-sm text-gray-500">Please fill in your details</p>
            </div>

            <div className="space-y-4">
              {/* Phone (read-only) */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Phone</Label>
                <Input value={phone} readOnly className="h-12 bg-gray-50 text-base" />
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 text-base"
                  autoFocus
                />
              </div>

              {/* District */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">District</Label>
                <Select
                  value={district}
                  onValueChange={(v) => {
                    setDistrict(v);
                    setLocation("");
                  }}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              {locationOptions.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Area / Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationOptions.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Group */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Group</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Youth", "Adult", "Children", "Campus"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroup(g)}
                      className={`h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                        group === g
                          ? "border-[#133358] bg-[#133358] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#133358]"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Gender</Label>
                <div className="flex gap-3">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold capitalize transition-colors ${
                        gender === g
                          ? "border-[#133358] bg-[#133358] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#133358]"
                      }`}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* First Timer */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Are you a first timer?</Label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFirstTimer(true)}
                    className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      isFirstTimer === true
                        ? "border-[#133358] bg-[#133358] text-white"
                        : "border-gray-200 text-gray-600 hover:border-[#133358]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFirstTimer(false)}
                    className={`flex-1 h-12 rounded-xl border-2 text-sm font-semibold transition-colors ${
                      isFirstTimer === false
                        ? "border-[#133358] bg-[#133358] text-white"
                        : "border-gray-200 text-gray-600 hover:border-[#133358]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 text-base bg-[#133358] hover:bg-[#1a4574]"
              onClick={handleNewSubmit}
              disabled={!fullName.trim() || submitting}
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-10 text-gray-500"
              onClick={() => setStep("phone")}
            >
              ← Back
            </Button>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === "success" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
            <div className="text-5xl">🙏</div>
            <h2 className="text-xl font-bold text-gray-800">Thank you!</h2>
            <p className="text-gray-500">We will contact you soon.</p>
            <Button
              variant="outline"
              className="mt-4 h-11 px-8"
              onClick={() => {
                setStep("phone");
                setPhone("");
                setExistingReg(null);
                setFullName("");
                setGender("");
                setGroup("");
                setDistrict("");
                setLocation("");
                setIsFirstTimer(null);
                setPhoneError("");
              }}
            >
              Submit Another
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
