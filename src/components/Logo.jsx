import React from 'react';

/**
 * SpendWise Unified Brand Logo
 * 
 * Brand meaning:
 * - Minimal dark navy wallet with money bills peeking out (Personal Finance)
 * - Orange (#FF6A00) bookmark ribbon (Remembering where you spend)
 * - White financial bars & upward trend arrow (Expense tracking & growth)
 * - Clean typography: "Spend" (Dark Navy #0F172A) + "Wise" (Vibrant Orange #FF6A00)
 */
export const Logo = ({ 
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl'
  showText = true, 
  variant = 'dark',   // 'dark' (slate-900 text) | 'light' (white text)
  className = '' 
}) => {
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Square Icon Mark */}
      <div className={`${iconSizes[size] || iconSizes.md} shrink-0 drop-shadow-xs`}>
        <svg 
          viewBox="0 0 512 512" 
          className="w-full h-full"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="logoCashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="logoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF8A34" />
              <stop offset="100%" stopColor="#FF6A00" />
            </linearGradient>
            <linearGradient id="logoWalletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>

          {/* Squircle Background Base */}
          <rect width="512" height="512" rx="124" fill="url(#logoBgGrad)" />
          <rect x="6" y="6" width="500" height="500" rx="118" stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="4" />

          {/* Wallet with Notes, Chart, Ribbon, and Arrow */}
          <g transform="translate(68, 64)">
            {/* Emerald Cash / Note */}
            <g transform="rotate(-6 188 120)">
              <rect x="70" y="32" width="220" height="100" rx="18" fill="url(#logoCashGrad)" />
              <rect x="78" y="40" width="204" height="84" rx="12" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="2.5" />
              <circle cx="180" cy="82" r="14" fill="#FFFFFF" fillOpacity="0.25" />
            </g>

            {/* Dark Navy Wallet Body */}
            <rect x="40" y="80" width="280" height="230" rx="36" fill="url(#logoWalletGrad)" stroke="#334155" strokeWidth="3" />

            {/* Memory Bookmark Ribbon in Brand Orange (#FF6A00) */}
            <path d="M 66 70 L 112 70 L 112 170 L 89 150 L 66 170 Z" fill="url(#logoOrangeGrad)" />
            <circle cx="89" cy="104" r="5" fill="#FFFFFF" />

            {/* White Financial Chart Bars */}
            <rect x="136" y="210" width="26" height="66" rx="8" fill="#F8FAFC" />
            <rect x="174" y="174" width="26" height="102" rx="8" fill="#F8FAFC" />
            <rect x="212" y="140" width="26" height="136" rx="8" fill="#F8FAFC" />

            {/* Spending Arrow in Brand Orange */}
            <path d="M 124 204 L 164 168 L 198 184 L 250 114" stroke="url(#logoOrangeGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 226 110 L 254 110 L 254 138" stroke="url(#logoOrangeGrad)" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

            {/* Clasp & Silver Snap Rivet */}
            <path d="M 280 150 L 336 150 C 354 150 366 162 366 180 C 366 198 354 210 336 210 L 280 210 Z" fill="#0F172A" stroke="#334155" strokeWidth="3" />
            <circle cx="334" cy="180" r="15" fill="#F1F5F9" />
            <circle cx="334" cy="180" r="7" fill="#94A3B8" />
          </g>
        </svg>
      </div>

      {/* Typography: "Spend" in Navy/White, "Wise" in Orange */}
      {showText && (
        <div className="flex items-baseline">
          <span className={`font-extrabold tracking-tight ${textSizes[size] || textSizes.md} ${
            variant === 'light' ? 'text-white' : 'text-slate-900'
          }`}>
            Spend
          </span>
          <span className={`font-extrabold tracking-tight text-[#FF6A00] ${textSizes[size] || textSizes.md}`}>
            Wise
          </span>
        </div>
      )}
    </div>
  );
};
