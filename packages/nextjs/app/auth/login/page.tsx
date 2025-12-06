"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState("phone");
  const [sent, setSent] = useState(false);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    // This is a placeholder: call your backend or Reown API to trigger OTP.
    console.log("Requesting OTP for", identifier);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-16">
      <div className="w-full max-w-md px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#0FA958] to-[#19C37D] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#111111] mb-2">Sign in to Spectra</h1>
            <p className="text-gray-600">Enter your details to continue</p>
          </div>

          <form onSubmit={sendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Method</label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
              >
                <option value="phone">Phone (OTP)</option>
                <option value="email">Email (OTP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">
                {method === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={method === "phone" ? "+1 (555) 123-4567" : "name@example.com"}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0FA958]/30"
            >
              {sent ? "✓ OTP Sent - Check Your " + (method === "phone" ? "Phone" : "Email") : "Send OTP"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-[#0FA958] hover:text-[#19C37D] transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
