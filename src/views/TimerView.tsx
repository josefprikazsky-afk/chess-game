import React from 'react';
import { TimerState, Barva } from '../types/chess';
import { Clock } from 'lucide-react';

interface TimerViewProps {
  timer: TimerState;
  aktivniHrac: Barva;
  onZmenaCasu?: (minuty: number, inkrement: number) => void;
  hrajici: boolean;
}

export const TimerView: React.FC<TimerViewProps> = ({
  timer,
  aktivniHrac,
  onZmenaCasu,
  hrajici,
}) => {
  const formatCas = (sekundy: number): string => {
    const s = Math.max(0, Math.floor(sekundy));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const jeBilyNaTahu = aktivniHrac === 0 && hrajici;
  const jeCernyNaTahu = aktivniHrac === 1 && hrajici;

  const casBilyNizky = timer.casBily <= 30;
  const casCernyNizky = timer.casCerny <= 30;

  return (
    <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between gap-3">
        {/* Čas Bílého */}
        <div
          className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all ${
            jeBilyNaTahu
              ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400" />
            <span className="text-xs font-medium uppercase tracking-wider">Bílý</span>
          </div>
          <span
            className={`font-mono text-xl font-bold tracking-tight ${
              casBilyNizky && jeBilyNaTahu ? 'text-red-400 animate-pulse' : ''
            }`}
          >
            {formatCas(timer.casBily)}
          </span>
        </div>

        <div className="text-stone-600">
          <Clock className="w-4 h-4" />
        </div>

        {/* Čas Černého */}
        <div
          className={`flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all ${
            jeCernyNaTahu
              ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-600" />
            <span className="text-xs font-medium uppercase tracking-wider">Černý</span>
          </div>
          <span
            className={`font-mono text-xl font-bold tracking-tight ${
              casCernyNizky && jeCernyNaTahu ? 'text-red-400 animate-pulse' : ''
            }`}
          >
            {formatCas(timer.casCerny)}
          </span>
        </div>
      </div>

      {/* Nastavení časového limitu (pokud je hra v klidu nebo pro volbu formátu) */}
      {onZmenaCasu && (
        <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <span className="text-[11px] text-stone-500">Časový formát:</span>
          <div className="flex items-center gap-1">
            {[
              { label: '1+0', min: 1, inc: 0 },
              { label: '3+2', min: 3, inc: 2 },
              { label: '5+3', min: 5, inc: 3 },
              { label: '10+0', min: 10, inc: 0 },
            ].map((p) => {
              const jeAktivni = timer.vychoziCas === p.min * 60 && timer.inkrement === p.inc;
              return (
                <button
                  key={p.label}
                  disabled={hrajici}
                  onClick={() => onZmenaCasu(p.min, p.inc)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    jeAktivni
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-50 disabled:pointer-events-none'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
