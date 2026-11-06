import React, { useState } from 'react';
import { GameLoggerEntry } from '../types/chess';
import { Download, Copy, Check, FileText, ScrollText } from 'lucide-react';

interface GameLoggerViewProps {
  zaznamy: GameLoggerEntry[];
  textovyLog: string[];
  onStahnoutPGN: () => void;
  onStahnoutLog: () => void;
  pgnString: string;
}

export const GameLoggerView: React.FC<GameLoggerViewProps> = ({
  zaznamy,
  textovyLog,
  onStahnoutPGN,
  onStahnoutLog,
  pgnString,
}) => {
  const [zalozka, setZalozka] = useState<'tahy' | 'systemovy_log'>('tahy');
  const [zkopirovano, setZkopirovano] = useState(false);

  const zkopirovatPGNDoSchranky = () => {
    navigator.clipboard.writeText(pgnString);
    setZkopirovano(true);
    setTimeout(() => setZkopirovano(false), 2000);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl flex flex-col h-[320px] overflow-hidden shadow-md">
      {/* Záhlaví panelu s přepínačem záložek */}
      <div className="px-3 py-2 bg-stone-950/60 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZalozka('tahy')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              zalozka === 'tahy'
                ? 'bg-stone-800 text-amber-300'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Notace ({zaznamy.length})</span>
          </button>
          <button
            onClick={() => setZalozka('systemovy_log')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              zalozka === 'systemovy_log'
                ? 'bg-stone-800 text-amber-300'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Log ({textovyLog.length})</span>
          </button>
        </div>

        {/* Akce exportu */}
        <div className="flex items-center gap-1">
          <button
            onClick={zkopirovatPGNDoSchranky}
            title="Kopírovat PGN"
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            {zkopirovano ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onStahnoutPGN}
            title="Stáhnout PGN soubor"
            className="p-1.5 rounded hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Obsah záložky Notace */}
      {zalozka === 'tahy' ? (
        <div className="flex-1 p-3 overflow-y-auto font-mono text-xs divide-y divide-stone-800/40">
          {zaznamy.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-500 italic">
              Zatím nebyly odehrány žádné tahy.
            </div>
          ) : (
            zaznamy.map((entry) => (
              <div key={entry.cisloTahu} className="grid grid-cols-12 py-1.5 items-center hover:bg-stone-800/30 px-1 rounded">
                <span className="col-span-2 text-stone-500 font-semibold text-[11px]">
                  {entry.cisloTahu}.
                </span>
                <span className="col-span-5 font-semibold text-stone-200">
                  {entry.bily?.notation || '—'}
                </span>
                <span className="col-span-5 text-stone-300">
                  {entry.cerny?.notation || ''}
                </span>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Obsah záložky Systémový textový log */
        <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] text-stone-300 space-y-1 bg-stone-950/40">
          {textovyLog.map((line, idx) => (
            <div key={idx} className="leading-relaxed border-l-2 border-amber-500/40 pl-2">
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Pata panelu se stažením logu */}
      <div className="px-3 py-1.5 bg-stone-950/60 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
        <span>Soubor: sachy_log.txt</span>
        <button
          onClick={onStahnoutLog}
          className="text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          <span>Stáhnout záznam</span>
        </button>
      </div>
    </div>
  );
};
