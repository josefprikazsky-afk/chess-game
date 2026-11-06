import React from 'react';
import { KwestState } from '../types/chess';
import { Trophy, CheckCircle2, CircleDashed, Award } from 'lucide-react';

interface KwestViewProps {
  kwesty: KwestState[];
  aktivniHracJmeno: string;
}

export const KwestView: React.FC<KwestViewProps> = ({ kwesty, aktivniHracJmeno }) => {
  const splnenych = kwesty.filter((k) => k.splneno).length;
  const celkem = kwesty.length;
  const procenta = Math.round((splnenych / celkem) * 100);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 shadow-md flex flex-col h-[320px]">
      {/* Záhlaví questů */}
      <div className="flex items-center justify-between pb-2.5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-stone-200">Herní Kwesty & Výzvy</h3>
            <p className="text-[10px] text-stone-400">Hráč: {aktivniHracJmeno}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="text-xs font-mono font-bold text-amber-400">
            {splnenych}/{celkem}
          </span>
          <span className="text-[10px] text-stone-500 font-mono">({procenta}%)</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-stone-800 h-1.5 rounded-full my-2 overflow-hidden">
        <div
          className="bg-amber-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${procenta}%` }}
        />
      </div>

      {/* Seznam úkolů */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mt-1">
        {kwesty.map((k) => (
          <div
            key={k.id}
            className={`p-2.5 rounded-lg border transition-all ${
              k.splneno
                ? 'bg-amber-950/20 border-amber-500/40 text-stone-200'
                : 'bg-stone-950/40 border-stone-800/80 text-stone-400'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">
                  {k.splneno ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <CircleDashed className="w-4 h-4 text-stone-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${k.splneno ? 'text-amber-200' : 'text-stone-300'}`}>
                      {k.nazev}
                    </span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-stone-800 text-stone-400 font-mono">
                      {k.kategorie}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-snug">{k.popis}</p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                <Award className="w-3 h-3" />
                <span>+{k.odmenaXp} XP</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
