import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';

interface SignatureBrandProps {
  size?: 'normal' | 'large';
  accentColor?: string;
  metadata?: string;
  className?: string;
}

export const SignatureBrand: React.FC<SignatureBrandProps> = ({
  size = 'large',
  accentColor = 'bg-cyan-500',
  metadata = '1 . 2   P R O',
  className = '',
}) => {
  const isLarge = size === 'large';
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      {/* Signature Continuous Wordmark */}
      <h1
        className={`flex items-baseline uppercase tracking-tighter leading-none m-0 p-0 font-['Chakra_Petch',sans-serif] ${
          isLarge
            ? 'text-3xl sm:text-4xl md:text-5xl'
            : 'text-xl sm:text-2xl'
        }`}
        aria-label="CUBE 3D"
      >
        {/* First word: extremely bold, bright white in dark mode, dark in light mode */}
        <span
          className={`font-black italic tracking-tighter ${
            isLight ? 'text-slate-950' : 'text-white'
          }`}
        >
          CUBE
        </span>

        {/* Second word: thinner italic, very low opacity, subtle, dark, faded */}
        <span
          className={`font-normal italic ml-1.5 sm:ml-2 tracking-tighter ${
            isLight ? 'text-slate-950/20' : 'text-white/20'
          }`}
        >
          3D
        </span>
      </h1>

      {/* Byline: Small uppercase lettering, generous letter spacing, muted gray, accent dot */}
      <div
        className={`flex items-center gap-2 mt-1 sm:mt-1.5 uppercase font-mono select-none ${
          isLarge ? 'text-[9px] sm:text-[10px]' : 'text-[8px]'
        } ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}
      >
        {/* Circular accent-colored dot */}
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accentColor}`} />

        {/* BY SOURAV with generous letter spacing */}
        <span className="tracking-[0.28em] font-medium">
          BY SOURAV
        </span>

        {/* Thin vertical separator */}
        <span className={`${isLight ? 'text-slate-300' : 'text-neutral-600'} font-light scale-y-90`}>
          |
        </span>

        {/* Metadata */}
        <span className="tracking-[0.22em] font-medium">
          {metadata}
        </span>
      </div>
    </div>
  );
};
