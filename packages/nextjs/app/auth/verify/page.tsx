"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: call your backend to verify OTP with Reown
    console.log("Verifying code", code);
    setVerified(true);
    // Redirect to home after verification
    setTimeout(() => router.push("/"), 1500);
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#111111] mb-2">Enter Verification Code</h1>
            <p className="text-gray-600">We sent a code to your device</p>
          </div>

          {verified ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#0FA958]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0FA958]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#111111] mb-2">Verified Successfully!</h2>
              <p className="text-gray-600">Redirecting to home...</p>
            </div>
          ) : (
            <form onSubmit={verify} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Verification Code</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#0FA958] focus:ring-2 focus:ring-[#0FA958]/20 outline-none transition bg-white text-[#111111] text-center text-2xl tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-[#0FA958]/30"
              >
                Verify Code
              </button>

              <button
                type="button"
                className="w-full text-[#0FA958] hover:text-[#19C37D] font-medium py-2 transition-colors"
              >
                Resend Code
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#0FA958] transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
