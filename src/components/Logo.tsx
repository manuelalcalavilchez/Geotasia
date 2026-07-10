import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  customLogoUrl?: string;
}

export default function Logo({ className = '', size = 'md', showText = true, customLogoUrl }: LogoProps) {
  const dimensions = {
    sm: { svgSize: 40, textSize: 'text-lg', subSize: 'text-[8px]' },
    md: { svgSize: 64, textSize: 'text-2xl', subSize: 'text-xs' },
    lg: { svgSize: 120, textSize: 'text-4xl', subSize: 'text-sm' },
    xl: { svgSize: 200, textSize: 'text-5xl', subSize: 'text-base' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {customLogoUrl ? (
        <img
          src={customLogoUrl}
          alt="Geotasalia Logo"
          referrerPolicy="no-referrer"
          className="object-contain transition-transform duration-300 hover:scale-105"
          style={{
            width: dimensions.svgSize,
            height: dimensions.svgSize,
            filter: 'drop-shadow(0px 2px 12px rgba(212,175,55,0.3))'
          }}
        />
      ) : (
        /* Golden Monogram SVG */
        <svg
          width={dimensions.svgSize}
          height={dimensions.svgSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_15px_rgba(212,175,55,0.4)] transition-transform duration-300 hover:scale-105"
        >
          {/* Thin elegant golden circular ring matching the uploaded logo */}
          <circle 
            cx="50" 
            cy="50" 
            r="44" 
            stroke="url(#goldGradient)" 
            strokeWidth="2.2" 
            fill="none"
          />

          {/* Elegant integrated G-T Monogram inside */}
          {/* 'T' Stem and Top Bar */}
          <path
            d="M 32 30 H 68 V 35 H 53 V 70 H 47 V 35 H 32 Z"
            fill="url(#goldGradient)"
          />
          {/* Sweeping 'G' that wraps around and merges into a horizontal spur */}
          <path
            d="M 68 35 C 68 35, 61 24, 48 24 C 32 24, 22 36, 22 50 C 22 64, 32 76, 48 76 C 60 76, 68 67, 68 56 H 49 V 51 H 73 V 58 C 73 70, 62 81, 48 81 C 28 81, 16 67, 16 50 C 16 33, 28 19, 48 19 C 61 19, 71 27, 74 35 H 68 Z"
            fill="url(#goldGradient)"
          />
          
          {/* Gold Metallic Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="10" y1="12" x2="92" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F9F2CE" />
              <stop offset="25%" stopColor="#E5C173" />
              <stop offset="50%" stopColor="#C59F43" />
              <stop offset="75%" stopColor="#B28C2F" />
              <stop offset="100%" stopColor="#ECD396" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {showText && (
        <div className="mt-4 flex flex-col items-center">
          <h1 className={`font-sans tracking-[0.25em] font-light text-white uppercase leading-none ${dimensions.textSize}`}>
            GEOTASALIA
          </h1>
          <p className={`mt-2 font-mono tracking-[0.4em] text-[#D4AF37] uppercase opacity-90 ${dimensions.subSize}`}>
            CULTIVATING VALUE
          </p>
        </div>
      )}
    </div>
  );
}
