"use client";

import { useState } from "react";
import { DISTRICT_LOCATIONS } from "@/constants";

const DISTRICTS = [
  "Sefwi Asawinso",
  "Sefwi Bodi",
  "Sefwi Juaboso",
  "Sefwi Boako",
  "Sefwi Dwenase",
  "Sefwi Wiawso",
  "Mile 3",
  "Sefwi Nsawora",
];
const GROUPS = ["Youth", "Adult", "Campus", "Children"];

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("0")) {
    return "+233" + cleaned.slice(1);
  }
  return cleaned;
}

function isValidGhanaPhone(phone: string): boolean {
  return /^\+233[0-9]{9}$/.test(phone);
}

type FormData = {
  group: string;
  district: string;
  location: string;
  status: string;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    group: "",
    district: "",
    location: "",
    status: "",
    fullName: "",
    gender: "",
    phone: "",
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otherLocation, setOtherLocation] = useState("");

  const goBack = () => {
    if (step === 4) {
      const locs = DISTRICT_LOCATIONS[form.district] ?? [];
      if (locs.length > 0) {
        setForm({ ...form, location: "" });
        setOtherLocation("");
        setStep(3);
      } else {
        setStep(2);
      }
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(10);
      } else {
        setError(data.error ?? "Registration failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#133358] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Progress bar */}
        {step < 10 && (
          <div className="w-full bg-gray-200 h-1.5">
            <div
              className="bg-blue-600 h-1.5 transition-all duration-300"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
        )}

        <div className="p-8">
          {/* Step 1: Group */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-950">
                Select your group
              </h2>
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setForm({ ...form, group: g.toLowerCase() });
                    setStep(2);
                  }}
                  className="w-full border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900 font-semibold py-4 rounded-xl text-lg"
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: District */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-950">
                Select your district
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {DISTRICTS.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      const locs = DISTRICT_LOCATIONS[d] ?? [];
                      if (locs.length > 0) {
                        setForm({ ...form, district: d, location: "" });
                        setStep(3);
                      } else {
                        setForm({ ...form, district: d, location: "" });
                        setStep(4);
                      }
                    }}
                    className="border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900 font-semibold py-4 px-3 rounded-xl text-sm text-center"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-950">
                Select your area
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(DISTRICT_LOCATIONS[form.district] ?? []).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => {
                      if (loc === "Others") {
                        setForm({ ...form, location: "Others" });
                      } else {
                        setForm({ ...form, location: loc });
                        setStep(4);
                      }
                    }}
                    className={`border-2 font-semibold py-4 px-3 rounded-xl text-sm text-center ${
                      form.location === loc
                        ? "border-blue-600 bg-blue-50 text-blue-900"
                        : "border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {form.location === "Others" && (
                <div className="flex flex-col gap-3 mt-1">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Type your area..."
                    value={otherLocation}
                    onChange={(e) => setOtherLocation(e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-blue-600 outline-none rounded-xl px-4 py-3 text-base"
                  />
                  <button
                    disabled={!otherLocation.trim()}
                    onClick={() => {
                      setForm({ ...form, location: otherLocation.trim() });
                      setStep(4);
                    }}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Member Status */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-950">
                Are you a member or visitor?
              </h2>
              {["Member", "Visitor"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setForm({ ...form, status: s.toLowerCase() });
                    setStep(5);
                  }}
                  className="w-full border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900 font-semibold py-4 rounded-xl text-lg"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Full Name */}
          {step === 5 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  What is your full name?
                </h2>
                <p className="text-gray-400 text-sm mt-1">First and last name</p>
              </div>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Kwame Asante"
                value={form.fullName}
                onChange={(e) =>
                  setForm({ ...form, fullName: e.target.value })
                }
                className="w-full border-2 border-gray-200 focus:border-blue-600 outline-none rounded-xl px-4 py-4 text-lg"
              />
              <button
                disabled={!form.fullName.trim()}
                onClick={() => setStep(6)}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 6: Gender */}
          {step === 6 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-blue-950">
                What is your gender?
              </h2>
              <button
                onClick={() => {
                  setForm({ ...form, gender: "male" });
                  setStep(7);
                }}
                className="w-full border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900 font-semibold py-4 rounded-xl text-lg"
              >
                Male
              </button>
              <button
                onClick={() => {
                  setForm({ ...form, gender: "female" });
                  setStep(7);
                }}
                className="w-full border-2 border-blue-200 hover:border-blue-600 hover:bg-blue-50 text-blue-900 font-semibold py-4 rounded-xl text-lg"
              >
                Female
              </button>
            </div>
          )}

          {/* Step 7: Phone */}
          {step === 7 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  Your phone number?
                </h2>
                <p className="text-gray-400 text-sm mt-1">e.g. 0244123456</p>
              </div>
              <input
                type="tel"
                autoFocus
                placeholder="0244123456"
                value={form.phone}
                onChange={(e) => {
                  setForm({ ...form, phone: e.target.value });
                  setPhoneError("");
                }}
                className={`w-full border-2 outline-none rounded-xl px-4 py-4 text-lg ${
                  phoneError ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-blue-600"
                }`}
              />
              {phoneError && (
                <p className="text-red-500 text-sm -mt-4">{phoneError}</p>
              )}
              <button
                disabled={!form.phone.trim()}
                onClick={() => {
                  const normalized = normalizePhone(form.phone);
                  if (!isValidGhanaPhone(normalized)) {
                    setPhoneError("Enter a valid Ghana phone number (e.g. 0244123456)");
                    return;
                  }
                  setPhoneError("");
                  setForm({ ...form, phone: normalized });
                  setStep(8);
                }}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg"
              >
                Next
              </button>
            </div>
          )}

          {/* Step 8: Email */}
          {step === 8 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  Your email address?
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Optional — skip if you don&apos;t have one
                </p>
              </div>
              <input
                type="email"
                autoFocus
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full border-2 border-gray-200 focus:border-blue-600 outline-none rounded-xl px-4 py-4 text-lg"
              />
              <button
                onClick={() => setStep(9)}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 rounded-xl text-lg"
              >
                Review &amp; Confirm
              </button>
              <button
                onClick={() => {
                  setForm({ ...form, email: "" });
                  setStep(9);
                }}
                className="w-full text-gray-400 text-sm underline"
              >
                Skip email
              </button>
            </div>
          )}

          {/* Step 9: Confirmation */}
          {step === 9 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-blue-950">
                  Confirm your details
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Please review before submitting.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Name</span>
                  <span>{form.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Phone</span>
                  <span>{form.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">District</span>
                  <span>{form.district}</span>
                </div>
                {form.location && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Area</span>
                    <span>{form.location}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Group</span>
                  <span className="capitalize">{form.group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Status</span>
                  <span className="capitalize">{form.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-800">Gender</span>
                  <span className="capitalize">{form.gender}</span>
                </div>
                {form.email && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-800">Email</span>
                    <span>{form.email}</span>
                  </div>
                )}
              </div>
              {error && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
              )}
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl text-lg"
              >
                {submitting ? "Submitting..." : "✓ Confirm & Submit"}
              </button>
            </div>
          )}

          {/* Step 10: Success */}
          {step === 10 && (
            <div className="flex flex-col items-center gap-6 text-center py-4">
              <div className="text-6xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-green-700">
                  Registration Complete!
                </h2>
                <p className="mt-2 text-gray-500">
                  Welcome, {form.fullName}. We look forward to seeing you at
                  the retreat!
                </p>
              </div>
              <div className="w-full bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-left space-y-1">
                <p>
                  <span className="font-medium text-gray-700">Group:</span>{" "}
                  {form.group}
                </p>
                <p>
                  <span className="font-medium text-gray-700">District:</span>{" "}
                  {form.district}
                </p>
                {form.location && (
                  <p>
                    <span className="font-medium text-gray-700">Area:</span>{" "}
                    {form.location}
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  {form.status}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Phone:</span>{" "}
                  {form.phone}
                </p>
              </div>
              <button
                onClick={() => {
                  setStep(1);
                  setForm({
                    group: "",
                    district: "",
                    location: "",
                    status: "",
                    fullName: "",
                    gender: "",
                    phone: "",
                    email: "",
                  });
                }}
                className="w-full border-2 border-blue-200 hover:border-blue-600 text-blue-700 font-semibold py-3 rounded-xl"
              >
                Register another person
              </button>
            </div>
          )}

          {/* Back button */}
          {step > 1 && step < 10 && (
            <button
              onClick={goBack}
              className="mt-6 text-gray-400 text-sm hover:text-gray-600"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
