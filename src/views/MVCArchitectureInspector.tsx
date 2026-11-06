import React from 'react';
import { GameManager } from '../models/GameManager';
import { Database, Monitor, Cpu, ArrowRight, Activity, Terminal } from 'lucide-react';

interface MVCArchitectureInspectorProps {
  gameManager: GameManager;
}

export const MVCArchitectureInspector: React.FC<MVCArchitectureInspectorProps> = ({ gameManager }) => {
  const celkemTahu = gameManager.historieTahu.length;
  const posledniTah = gameManager.aktualni_tah;
  const stavHry = gameManager.stav_hry;
  const bilyUzivatel = gameManager.hraci[0]?.uzivatel;
  const cernyUzivatel = gameManager.hraci[1]?.uzivatel;

  return (
    <div className="space-y-6">
      {/* Popis vzoru MVC */}
      <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl">
        <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <span>Analýza architektury MVC (Model - View - Controller)</span>
        </h2>
        <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
          Návrhový vzor MVC odděluje aplikační a datovou logiku (Model) od prezentační vrstvy (View) a obsluhy
          uživatelských akcí a systémových událostí (Controller). Níže je znázorněn aktuální živý stav aplikace.
        </p>
      </div>

      {/* 3 sloupce MVC vrstev s reálnými daty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. MODEL */}
        <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-stone-100">MODEL (Data & Logika)</h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              State & Rules
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">HerniPlocha (Deska 8×8)</span>
              <p className="text-stone-300 font-mono text-[11px]">
                Aktivních figur na ploše: <span className="text-amber-400">{gameManager.plocha.getVsechnyFigurky().length}</span>
              </p>
              <p className="text-stone-400 font-mono text-[11px]">
                Sebráno: Bílý {gameManager.plocha.vyhozene_figurky_b.length} · Černý {gameManager.plocha.vyhozene_figurky_c.length}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">RevizorTahu (Pravidla)</span>
              <p className="text-stone-300 font-mono text-[11px]">
                Stav hry: <span className="text-amber-400 uppercase font-bold">{stavHry}</span>
              </p>
              <p className="text-stone-400 font-mono text-[11px]">
                Ověřuje: šach, mat, pat, rošádu, en passant
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">Timer (Šachové hodiny)</span>
              <p className="text-stone-300 font-mono text-[11px]">
                Bílý: {gameManager.casovac.formatujCas(gameManager.casovac.cas_hrac[0])} · Černý: {gameManager.casovac.formatujCas(gameManager.casovac.cas_hrac[1])}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">GameLogger (Záznamník)</span>
              <p className="text-stone-300 font-mono text-[11px]">
                Zapsaných tahů: <span className="text-amber-400 font-bold">{celkemTahu}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 2. CONTROLLER */}
        <div className="bg-stone-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-stone-100">CONTROLLER (Události)</h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Event Broker
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">Obsluha kliknutí (vyber_pole)</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Zpracovává souřadnice <code className="text-amber-300">[radka, sloupec]</code>, zjišťuje legální cíle přes RevizorTahu a volá <code className="text-emerald-400">proved_tah()</code>.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">Správa tahů bota (AI Engine)</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Při tahu počítače analyzuje desku, počítá materiálové skóre a s realistickou prodlevou (500 ms) dispečuje tah.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">Časovačové pulzy</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Systémový interval 1000 ms spouští <code className="text-emerald-400">tikCasovace()</code> v aktivní instanci a hlídá pád praporku.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">Zvukový syntetizér</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Po úspěšném tahu dispečuje syntetizované audio vzorky (tah, braní, šach, mat).
              </p>
            </div>
          </div>
        </div>

        {/* 3. VIEW */}
        <div className="bg-stone-900/90 border border-sky-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-sm text-stone-100">VIEW (Prezentace)</h3>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              GUI Windows
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">GameView (Canvas Board)</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Rendruje 64 herních polí, SVG vektorové figury, tečky možných tahů a červený šachový glow.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">HracView (Karty hráčů)</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Bílý: {bilyUzivatel?.jmeno} ({bilyUzivatel?.elo} ELO)<br />
                Černý: {cernyUzivatel?.jmeno} ({cernyUzivatel?.elo} ELO)
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">GameLoggerView & Notace</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Poslední tah: <span className="text-sky-300 font-mono font-bold">{posledniTah ? posledniTah.notation : 'Žádný'}</span>
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
              <span className="text-stone-400 font-semibold block mb-1">KwestView (Úkoly)</span>
              <p className="text-stone-300 leading-snug text-[11px]">
                Aktivních výzev: {gameManager.kwesty.length} · Splněno: {gameManager.kwesty.filter(k => k.splneno).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Datový tok v MVC */}
      <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl">
        <h3 className="text-sm font-semibold text-stone-200 mb-3 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Životní cyklus tahu a tok dat (Event Loop):</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
            <span className="text-stone-500 block text-[10px]">Krok 1</span>
            <span className="text-emerald-400 font-semibold">Uživatel klikne na pole</span>
            <p className="text-stone-400 text-[11px] mt-1 font-sans">
              View zachytí událost a předá souřadnice do <code className="text-stone-300">Controller.vyber_pole()</code>.
            </p>
          </div>

          <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
            <span className="text-stone-500 block text-[10px]">Krok 2</span>
            <span className="text-amber-400 font-semibold">Validace & Revizor</span>
            <p className="text-stone-400 text-[11px] mt-1 font-sans">
              <code className="text-stone-300">RevizorTahu</code> ověří platnost vektoru, kolize a neexistenci vlastního šachu.
            </p>
          </div>

          <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
            <span className="text-stone-500 block text-[10px]">Krok 3</span>
            <span className="text-amber-400 font-semibold">Mutace Modelu</span>
            <p className="text-stone-400 text-[11px] mt-1 font-sans">
              <code className="text-stone-300">HerniPlocha</code> provede tah, aktualizuje pozice a časovač se přepne.
            </p>
          </div>

          <div className="p-3 bg-stone-900 border border-stone-800 rounded-lg">
            <span className="text-stone-500 block text-[10px]">Krok 4</span>
            <span className="text-sky-400 font-semibold">Notifikace Pohledů</span>
            <p className="text-stone-400 text-[11px] mt-1 font-sans">
              Model upozorní odběratele (Observer pattern) a pohledy <code className="text-stone-300">GameView / HracView</code> se přerendrují.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
