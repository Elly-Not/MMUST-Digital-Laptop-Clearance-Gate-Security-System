import React from 'react';

interface MMUSTLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  lightText?: boolean;
}

export const MMUSTLogo: React.FC<MMUSTLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  lightText = true,
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* MMUST Official Crest Emblem */}
      <div className={`relative ${sizeMap[size]} shrink-0 drop-shadow-md select-none`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Gold/Macaroni Ring with Gear/Cog Accent Pattern */}
          <circle cx="50" cy="50" r="47" fill="#007BB6" stroke="#FAB582" strokeWidth="3" />
          <circle cx="50" cy="50" r="43" fill="#083B66" stroke="#FED7AA" strokeWidth="0.8" strokeDasharray="2 2" />

          {/* Central Shield in MMUST Deep Cerulean Blue */}
          <path
            d="M50 16 L76 28 C76 56 50 76 50 76 C50 76 24 56 24 28 Z"
            fill="#007BB6"
            stroke="#FAB582"
            strokeWidth="2.5"
          />

          {/* Shield Internal Cross Partition */}
          <path d="M50 20 L50 72" stroke="#FAB582" strokeWidth="1" />
          <path d="M28 44 L72 44" stroke="#FAB582" strokeWidth="1" />

          {/* Top-Left Quadrant: Open Book of Knowledge */}
          <path
            d="M34 32 C38 31 43 32 46 34 L46 41 C43 39 38 38 34 39 Z"
            fill="#FFF"
            stroke="#052642"
            strokeWidth="0.5"
          />
          <path
            d="M46 34 C49 32 54 31 58 32 L58 39 C54 38 49 39 46 41 Z"
            fill="#FFF"
            stroke="#052642"
            strokeWidth="0.5"
          />

          {/* Top-Right Quadrant: Science Atom & Tech Cog */}
          <ellipse cx="61" cy="35" rx="6" ry="2.2" transform="rotate(-30 61 35)" stroke="#FAB582" strokeWidth="0.9" fill="none" />
          <ellipse cx="61" cy="35" rx="6" ry="2.2" transform="rotate(30 61 35)" stroke="#FAB582" strokeWidth="0.9" fill="none" />
          <circle cx="61" cy="35" r="1.3" fill="#FAB582" />

          {/* Bottom-Left: Flaming Torch / Lamp of Academic Enlightenment */}
          <path d="M37 50 L43 50 L41 62 L39 62 Z" fill="#FED7AA" stroke="#C2410C" strokeWidth="0.6" />
          <path d="M38 49 Q40 43 42 46 Q44 42 40 40 Q37 45 38 49" fill="#EF4444" />
          <circle cx="40" cy="45" r="1.2" fill="#FAB582" />

          {/* Bottom-Right: University Microchip / Science & Technology Cog */}
          <rect x="56" y="50" width="10" height="10" rx="1.5" fill="#083B66" stroke="#FAB582" strokeWidth="1" />
          <circle cx="61" cy="55" r="2" fill="#FAB582" />
          <path d="M53 53 H56 M53 57 H56 M66 53 H69 M66 57 H69" stroke="#FAB582" strokeWidth="1" />

          {/* University Motto Ribbon at Bottom: "UNIVERSITY OF CHOICE" */}
          <path
            d="M18 77 Q50 86 82 77 L85 84 Q50 93 15 84 Z"
            fill="#FAB582"
            stroke="#C2410C"
            strokeWidth="0.8"
          />
          <text
            x="50"
            y="83"
            textAnchor="middle"
            fill="#052642"
            fontSize="5.2"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="0.4"
          >
            MMUST
          </text>

          {/* Circular University Text Arc */}
          <text x="50" y="11.5" textAnchor="middle" fill="#FED7AA" fontSize="3.8" fontWeight="bold" letterSpacing="0.5">
            MASINDE MULIRO UNIVERSITY
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`text-[10px] tracking-widest font-black uppercase ${lightText ? 'text-[#FAB582]' : 'text-[#007BB6]'}`}>
            MASINDE MULIRO
          </span>
          <span className={`text-xs font-extrabold -mt-0.5 tracking-tight ${lightText ? 'text-white' : 'text-[#083B66]'}`}>
            University of Science & Tech
          </span>
          <span className={`text-[9px] font-semibold italic ${lightText ? 'text-sky-200' : 'text-[#007BB6]'}`}>
            "University of Choice" • Security Directorate
          </span>
        </div>
      )}
    </div>
  );
};
