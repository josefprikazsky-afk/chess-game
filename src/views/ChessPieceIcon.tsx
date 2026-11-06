import React from 'react';
import { Barva, TypFigurky } from '../types/chess';

interface ChessPieceIconProps {
  typ: TypFigurky;
  barva: Barva;
  className?: string;
}

export const ChessPieceIcon: React.FC<ChessPieceIconProps> = ({ typ, barva, className = 'w-full h-full' }) => {
  const isWhite = barva === 0;
  
  // Barvy figur
  const fillPrimary = isWhite ? '#F8FAFC' : '#1E293B';
  const fillSecondary = isWhite ? '#E2E8F0' : '#0F172A';
  const strokeColor = isWhite ? '#334155' : '#E2E8F0';
  const strokeWidth = '1.5';
  const goldAccent = isWhite ? '#D97706' : '#94A3B8';

  const renderPiece = () => {
    switch (typ) {
      case 'kral':
        return (
          <g>
            {/* Kříž */}
            <path d="M22 6h4v4h4v4h-4v4h-4v-4h-4v-4h4z" fill={goldAccent} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Koruna */}
            <path
              d="M12 20c0-3 3-5 7-5s7 2 7 5c0-3 3-5 7-5s7 2 7 5l-2 15H14L12 20z"
              fill={fillPrimary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Ozdobné linie */}
            <path d="M15 27h18M16 32h16" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Základna */}
            <rect x="11" y="37" width="26" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'dama':
        return (
          <g>
            {/* Hroty koruny s kuličkami */}
            <circle cx="10" cy="14" r="2.2" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            <circle cx="17" cy="11" r="2.2" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            <circle cx="24" cy="9" r="2.5" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            <circle cx="31" cy="11" r="2.2" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            <circle cx="38" cy="14" r="2.2" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            {/* Tělo dámy */}
            <path
              d="M10 16l3 15h22l3-15-7 6-7-10-7 10-7-6z"
              fill={fillPrimary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            <path d="M15 26h18" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Základna */}
            <rect x="11" y="37" width="26" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'vez':
        return (
          <g>
            {/* Cimbury věže */}
            <path
              d="M13 14h5v4h4v-4h4v4h4v-4h5l-2 8H15l-2-8z"
              fill={fillSecondary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Věžové tělo */}
            <path d="M15 22h18l-1.5 13h-15L15 22z" fill={fillPrimary} stroke={strokeColor} strokeWidth={strokeWidth} />
            <path d="M17 28h14" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Základna */}
            <rect x="11" y="37" width="26" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'strelec':
        return (
          <g>
            {/* Kulička na mitře */}
            <circle cx="24" cy="9" r="2" fill={goldAccent} stroke={strokeColor} strokeWidth="1" />
            {/* Mitra */}
            <path
              d="M24 11c-5 0-9 4-9 10 0 6 4 10 9 14 5-4 9-8 9-14 0-6-4-10-9-10z"
              fill={fillPrimary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
            {/* Zářez na mitře */}
            <path d="M21 16l6 8M27 16l-3 4" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Základna */}
            <rect x="12" y="37" width="24" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'kun':
        return (
          <g>
            {/* Hlava koně */}
            <path
              d="M13 36c0-6 2-10 4-13-1-2-1-5 2-8 3-3 8-4 12-2 1 2 2 4 1 6 3 0 5 2 6 5s1 7-2 9l-3 3h-8l-4 4-8-4z"
              fill={fillPrimary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Oko a hříva */}
            <circle cx="26" cy="18" r="1.5" fill={isWhite ? '#0F172A' : '#F8FAFC'} />
            <path d="M22 13c3 1 5 3 6 6M20 17c2 1 4 3 5 5" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
            {/* Nozdra */}
            <circle cx="16" cy="25" r="1" fill={strokeColor} />
            {/* Základna */}
            <rect x="11" y="37" width="26" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'pesak':
      default:
        return (
          <g>
            {/* Hlavička */}
            <circle cx="24" cy="14" r="5" fill={fillPrimary} stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Krček */}
            <path d="M19 20h10" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
            {/* Tělíčko */}
            <path
              d="M21 21h6l3 13H18l3-13z"
              fill={fillPrimary}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            {/* Základna */}
            <rect x="14" y="36" width="20" height="5" rx="2" fill={fillSecondary} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: isWhite ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
    >
      {renderPiece()}
    </svg>
  );
};
