import React from 'react';
import { Barva, HracState } from '../types/chess';
import { Figurka } from '../models/Figurky';
import { ChessPieceIcon } from './ChessPieceIcon';
import { User, Bot, Crown, Shield } from 'lucide-react';

interface HracViewProps {
  hrac: HracState;
  jeNaTahu: boolean;
  vyhozeneFigurky: Figurka[];
  materialovyRozdil: number; // kladné číslo znamená převahu tohoto hráče
  jeVSachu?: boolean;
}

export const HracView: React.FC<HracViewProps> = ({
  hrac,
  jeNaTahu,
  vyhozeneFigurky,
  materialovyRozdil,
  jeVSachu = false,
}) => {
  const isWhite = hrac.barva === 0;

  // Seskupit sebrané figurky podle typu
  const seskupeneFigurky = vyhozeneFigurky.reduce((acc, f) => {
    acc[f.typ] = (acc[f.typ] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all duration-300 ${
        jeNaTahu
          ? 'bg-stone-800/90 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/30'
          : 'bg-stone-900/60 border-stone-800 text-stone-400'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Informace o hráči */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isWhite
                ? 'bg-amber-100 text-stone-900 border-amber-300'
                : 'bg-stone-950 text-stone-100 border-stone-700'
            }`}
          >
            {hrac.isBot ? (
              <Bot className="w-5 h-5" />
            ) : isWhite ? (
              <User className="w-5 h-5" />
            ) : (
              <Crown className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-stone-100 truncate">
                {hrac.uzivatel.jmeno}
              </span>
              {hrac.isBot && (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AI ({hrac.botDifficulty || 'bot'})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
              <span>@{hrac.uzivatel.uzivatelske_jmeno}</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">{hrac.uzivatel.elo} ELO</span>
            </div>
          </div>
        </div>

        {/* Stav na tahu a šach */}
        <div className="flex items-center gap-2 shrink-0">
          {jeVSachu && (
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
              ŠACH!
            </span>
          )}
          {jeNaTahu && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Na tahu</span>
            </div>
          )}
        </div>
      </div>

      {/* Vyhozené figurky soupeře a materiálová výhoda */}
      <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between min-h-[28px]">
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(seskupeneFigurky).map(([typ, pocet]) => (
            <div key={typ} className="flex items-center gap-0.5 bg-stone-950/40 px-1 py-0.5 rounded border border-stone-800/60">
              <div className="w-4 h-4">
                <ChessPieceIcon typ={typ as any} barva={isWhite ? 1 : 0} />
              </div>
              {pocet > 1 && (
                <span className="text-[10px] font-mono text-stone-400">×{pocet}</span>
              )}
            </div>
          ))}
          {vyhozeneFigurky.length === 0 && (
            <span className="text-xs text-stone-600 italic">Žádné sebrané figurky</span>
          )}
        </div>

        {materialovyRozdil > 0 && (
          <span className="text-xs font-mono font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 shrink-0">
            +{materialovyRozdil}
          </span>
        )}
      </div>
    </div>
  );
};
