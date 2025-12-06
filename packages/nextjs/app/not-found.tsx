import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] py-16">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0FA958] to-[#19C37D] rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-12">
            <span className="text-5xl transform -rotate-12">🔍</span>
          </div>
          <h1 className="text-8xl font-bold text-[#111111] mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-[#111111] mb-3">Page Not Found</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-gradient-to-r from-[#0FA958] to-[#19C37D] hover:from-[#0FA958]/90 hover:to-[#19C37D]/90 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg shadow-[#0FA958]/30"
          >
            ← Go Home
          </Link>
          <Link 
            href="/#markets"
            className="px-8 py-4 bg-white hover:bg-gray-50 text-[#111111] border border-gray-200 rounded-xl font-semibold transition-all"
          >
            Browse Markets
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Link href="/" className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#0FA958]/50 transition-all group">
            <div className="w-12 h-12 bg-[#0FA958]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0FA958]/20 transition-colors">
              <svg className="w-6 h-6 text-[#0FA958]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">Home</h3>
            <p className="text-sm text-gray-600">Return to homepage</p>
          </Link>
          
          <Link href="/#markets" className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#0FA958]/50 transition-all group">
            <div className="w-12 h-12 bg-[#19C37D]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#19C37D]/20 transition-colors">
              <svg className="w-6 h-6 text-[#19C37D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">Markets</h3>
            <p className="text-sm text-gray-600">View active markets</p>
          </Link>
          
          <Link href="/claim" className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#0FA958]/50 transition-all group">
            <div className="w-12 h-12 bg-[#FFD534]/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#FFD534]/20 transition-colors">
              <svg className="w-6 h-6 text-[#FFD534]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-[#111111] mb-1">Claim</h3>
            <p className="text-sm text-gray-600">Claim your winnings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
