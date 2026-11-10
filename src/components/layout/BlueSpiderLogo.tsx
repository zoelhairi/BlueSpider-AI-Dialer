/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface BlueSpiderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BlueSpiderLogo: React.FC<BlueSpiderLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const imageSrc = '/logo_blue_spider.png';

  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative rounded-xl overflow-hidden bg-sky-950/80 border border-sky-400/50 shadow-md shadow-sky-950/60 flex items-center justify-center shrink-0 group transition-transform duration-300 hover:scale-105`}
      >
        {!imageError ? (
          <img
            src={imageSrc}
            alt="BlueSpider AI Dialer Logo"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity Cyber Spider SVG Fallback */
          <svg
            className="w-5 h-5 text-sky-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Spider Head & Body */}
            <circle cx="12" cy="7" r="2.5" fill="currentColor" fillOpacity="0.3" />
            <ellipse cx="12" cy="15" rx="3.5" ry="4.5" fill="currentColor" fillOpacity="0.2" />
            {/* Left Legs */}
            <path d="M9.5 6.5 L4 3 L2 6" />
            <path d="M8.5 9 L3 8 L2 12" />
            <path d="M8.5 14 L3 16 L2 20" />
            <path d="M9.5 17 L5 21 L3 22" />
            {/* Right Legs */}
            <path d="M14.5 6.5 L20 3 L22 6" />
            <path d="M15.5 9 L21 8 L22 12" />
            <path d="M15.5 14 L21 16 L22 20" />
            <path d="M14.5 17 L19 21 L21 22" />
            {/* Central glowing core node */}
            <circle cx="12" cy="14" r="1.2" fill="#38bdf8" />
          </svg>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-sky-400/30 rounded-xl pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-sky-200 to-sky-400 bg-clip-text text-transparent whitespace-nowrap">
              BlueSpider
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-600/80 text-sky-300">
              AI DIALER
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 leading-tight">
            Autonomous Voice AI Platform
          </span>
        </div>
      )}
    </div>
  );
};
