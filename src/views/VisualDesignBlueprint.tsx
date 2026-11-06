import React, { useState } from 'react';
import { MVCComponentLabel } from '../types/chess';
import { Layers, Download, Check, Eye, Code2, LayoutDashboard, Sparkles, Box, Info } from 'lucide-react';

export const VisualDesignBlueprint: React.FC = () => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>('c1');
  const [copied, setCopied] = useState(false);

  const components: MVCComponentLabel[] = [
    {
      id: 'c1',
      number: 1,
      name: 'Chess Board Canvas View',
      czechName: 'Šachovnice a plátno (GameView)',
      layer: 'View',
      pythonClass: 'GameView (Tkinter Canvas)',
      roleDescription: 'Vykresluje 64 herních polí (8x8), souřadnice a-h / 1-8, grafické figurky, legální tahy (zelené tečky), červené varování šachu a stopu posledního tahu.',
      coordinates: { x: 38, y: 50 },
      tags: ['Tkinter Canvas', 'Event <Button-1>', 'Grid Render', 'Legal Highlights'],
    },
    {
      id: 'c2',
      number: 2,
      name: 'Black Player Card',
      czechName: 'Profil černého hráče (HracView - Černý)',
      layer: 'View',
      pythonClass: 'HracView (Hrac, Uzivatel)',
      roleDescription: 'Zobrazuje uživatelské jméno soupeře/bota, ELO rating, sebrané bílé figurky, indikátor tahu a vyhodnocení materiálového rozdílu.',
      coordinates: { x: 38, y: 12 },
      tags: ['Uzivatel.elo', 'Hrac.barva', 'vyhozene_figurky_b', 'Turn Indicator'],
    },
    {
      id: 'c3',
      number: 3,
      name: 'White Player Card',
      czechName: 'Profil bílého hráče (HracView - Bílý)',
      layer: 'View',
      pythonClass: 'HracView (Hrac, Uzivatel)',
      roleDescription: 'Zobrazuje jméno bílého hráče, ELO rating, sebrané černé figury, materiální stav a aktivní indikátor tahu.',
      coordinates: { x: 38, y: 88 },
      tags: ['Uzivatel.elo', 'Hrac.barva', 'vyhozene_figurky_c', 'Material Advantage'],
    },
    {
      id: 'c4',
      number: 4,
      name: 'Dual Chess Clocks',
      czechName: 'Digitální šachový časovač (TimerView)',
      layer: 'View',
      pythonClass: 'Timer (cas_hrac, nuluj_cas, pocitej_cas)',
      roleDescription: 'Dvoukanálový digitální odpočet času v reálném čase s inkrementem na tah, přepínáním a zvukovým varováním při vypršení.',
      coordinates: { x: 80, y: 15 },
      tags: ['Timer.tik', 'Clock Format', 'Increment 3s', 'Low Time Pulse'],
    },
    {
      id: 'c5',
      number: 5,
      name: 'Move History & Logger',
      czechName: 'Záznamník tahů a PGN exportér (GameLogger)',
      layer: 'View',
      pythonClass: 'GameLogger (uloz_tah, vytvor_soubor)',
      roleDescription: 'Zapisuje všechny odehrané půltahy v algebraické šachové notaci (SAN), generuje systémový textový log a umožňuje export PGN souboru.',
      coordinates: { x: 80, y: 46 },
      tags: ['SAN Notation', 'PGN Export', 'GameLogger.uloz_tah', 'Audit Trail'],
    },
    {
      id: 'c6',
      number: 6,
      name: 'Quest & Achievement Tracker',
      czechName: 'Systém úkolů a výzev (Kwest / Quest)',
      layer: 'View',
      pythonClass: 'Kwest & Uzivatel.splnene_kwesty',
      roleDescription: 'Sleduje herní úkoly (první tah, rošáda, lov na dámu, mat), validuje jejich splnění po každém tahu a odměňuje hráče XP body zvyšujícími ELO.',
      coordinates: { x: 80, y: 78 },
      tags: ['Kwest.validate', 'XP Gain', 'Achievement Toast', 'Progression'],
    },
    {
      id: 'c7',
      number: 7,
      name: 'Game Controller & Action Toolbar',
      czechName: 'Herní ovladač a panel akcí (Controller)',
      layer: 'Controller',
      pythonClass: 'GameManagerController (vyber_pole, start_game)',
      roleDescription: 'Přijímá uživatelské vstupy, spouští validaci tahu přes RevizorTahu, řídí tahy šachového bota a koordinuje aktualizaci pohledů.',
      coordinates: { x: 12, y: 50 },
      tags: ['vyber_pole', 'start_game', 'vratZpet', 'Event Dispatcher'],
    },
    {
      id: 'c8',
      number: 8,
      name: 'MVC State & Engine Invariant',
      czechName: 'Centrální herní mozek (GameManager & HerniPlocha)',
      layer: 'Model',
      pythonClass: 'GameManager, HerniPlocha, RevizorTahu',
      roleDescription: 'Drží 8x8 stav polí, instancuje figurky, kontroluje šach/mat/pat/remízu a garantuje oddělení datové logiky od prezentace.',
      coordinates: { x: 12, y: 82 },
      tags: ['HerniPlocha.herni_deska', 'RevizorTahu.jePlatny', 'check_Sach', 'Observer Pattern'],
    },
  ];

  const currentComp = components.find((c) => c.id === selectedComponentId) || components[0];

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById('mvc-visual-blueprint-svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Sachy_MVC_Visual_Design_Blueprint.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Horní hlavička vizuálního návrhu */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-stone-900 border border-stone-800 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" />
            <span>Úkol č. 1: Vizuální návrh aplikace s popiskami komponent (GUI & MVC)</span>
          </div>
          <h2 className="text-xl font-bold text-stone-100 mt-1">
            Architektonický diagram & Vizuální rozvržení komponent
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Podrobné schéma grafického uživatelského rozhraní (GUI) šachové aplikace. Každá komponenta je jednoznačně
            očíslována a namapována na odpovídající třídu z MVC architektury (Model, View, Controller).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSVG}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            <span>Stáhnout vizuální návrh (SVG)</span>
          </button>
        </div>
      </div>

      {/* Hero Showcase Image vygenerovaná přímo v aplikaci */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 shadow-xl group">
        <div className="aspect-[21/9] w-full max-h-[300px] overflow-hidden relative">
          <img
            src="/src/assets/images/chess_board_hero_1790881108566.jpg"
            alt="Vizuální zpracování šachové herní plochy"
            className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Studio Asset · Šachy MVC GUI
              </span>
              <h3 className="text-lg font-bold text-white mt-1 drop-shadow-md">
                Herní plátno a fyzický model šachovnice (HerniPlocha)
              </h3>
            </div>
            <span className="text-xs text-stone-300 font-mono hidden sm:inline-block bg-black/60 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10">
              8×8 Pole · 32 Figur · Tkinter / React Canvas
            </span>
          </div>
        </div>
      </div>

      {/* Hlavní Vizuální Návrh (Interaktivní Blueprint SVG) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schéma UI s popiskami */}
        <div className="lg:col-span-8 bg-stone-950 border border-stone-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-3 text-xs text-stone-400">
            <span className="font-semibold text-stone-300">Interaktivní mapa rozvržení komponent</span>
            <span>Kliknutím na číslo zvýrazníte detail třídy a vrstvy</span>
          </div>

          <div className="relative w-full aspect-[16/10] bg-stone-900/90 rounded-xl border border-stone-800/80 overflow-hidden p-2 flex items-center justify-center">
            {/* SVG grafické schéma rozvržení */}
            <svg
              id="mvc-visual-blueprint-svg"
              viewBox="0 0 1000 625"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="gridPattern" width="25" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#b58863" />
                  <stop offset="100%" stopColor="#8f6340" />
                </linearGradient>
              </defs>

              <rect width="1000" height="625" fill="#141416" />
              <rect width="1000" height="625" fill="url(#gridPattern)" />

              {/* Rám celého okna aplikace */}
              <rect x="20" y="20" width="960" height="585" rx="14" fill="#1c1917" stroke="#44403c" strokeWidth="2" />

              {/* Záhlaví okna */}
              <rect x="20" y="20" width="960" height="38" rx="14" fill="#292524" />
              <circle cx="45" cy="39" r="6" fill="#ef4444" />
              <circle cx="65" cy="39" r="6" fill="#f59e0b" />
              <circle cx="85" cy="39" r="6" fill="#10b981" />
              <text x="500" y="44" textAnchor="middle" fill="#d6d3d1" fontSize="13" fontWeight="bold" fontFamily="monospace">
                Šachy MVC - Grafické uživatelské rozhraní (GUI & MVC Architecture)
              </text>

              {/* Levý panel: Ovladač & Model (Controller + Engine) */}
              <rect x="40" y="75" width="200" height="510" rx="10" fill="#262626" stroke="#404040" strokeWidth="1.5" strokeDasharray="4 2" />
              <text x="140" y="105" textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold">
                [7] CONTROLLER PANEL
              </text>
              <rect x="55" y="125" width="170" height="40" rx="6" fill="#171717" stroke="#525252" />
              <text x="140" y="149" textAnchor="middle" fill="#e5e5e5" fontSize="11">Start Hry / Reset</text>
              
              <rect x="55" y="175" width="170" height="40" rx="6" fill="#171717" stroke="#525252" />
              <text x="140" y="199" textAnchor="middle" fill="#e5e5e5" fontSize="11">Vrátit tah (vratZpet)</text>

              <rect x="55" y="225" width="170" height="40" rx="6" fill="#171717" stroke="#525252" />
              <text x="140" y="249" textAnchor="middle" fill="#e5e5e5" fontSize="11">Vzdat se / Remíza</text>

              <rect x="55" y="280" width="170" height="150" rx="8" fill="#1f1f23" stroke="#eab308" strokeWidth="1.5" />
              <text x="140" y="305" textAnchor="middle" fill="#eab308" fontSize="11" fontWeight="bold">[8] MODEL VRSTVA</text>
              <text x="140" y="328" textAnchor="middle" fill="#a1a1aa" fontSize="10">• GameManager</text>
              <text x="140" y="348" textAnchor="middle" fill="#a1a1aa" fontSize="10">• HerniPlocha (8x8)</text>
              <text x="140" y="368" textAnchor="middle" fill="#a1a1aa" fontSize="10">• RevizorTahu</text>
              <text x="140" y="388" textAnchor="middle" fill="#a1a1aa" fontSize="10">• Figurky & Pozice</text>
              <text x="140" y="408" textAnchor="middle" fill="#a1a1aa" fontSize="10">• UserManager</text>

              {/* Střed: Herní plocha a hráči */}
              {/* [2] Černý hráč */}
              <rect x="260" y="75" width="410" height="60" rx="8" fill="#292524" stroke="#57534e" strokeWidth="1.5" />
              <text x="280" y="102" fill="#fafaf9" fontSize="13" fontWeight="bold">
                [2] Černý Hráč: @cerny_kral (1420 ELO)
              </text>
              <text x="280" y="122" fill="#a8a29e" fontSize="10">HracView (Černý) · Vyhozené figurky bílého</text>

              {/* [1] Šachovnice Canvas */}
              <rect x="260" y="145" width="410" height="370" rx="8" fill="url(#boardGrad)" stroke="#78350f" strokeWidth="3" />
              {/* Mřížka šachovnice 8x8 pro náhled */}
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => (
                  <rect
                    key={`b-${r}-${c}`}
                    x={265 + c * 50}
                    y={150 + r * 45}
                    width="48"
                    height="43"
                    fill={(r + c) % 2 === 0 ? '#f0d9b5' : '#b58863'}
                    opacity="0.8"
                  />
                ))
              )}
              <text x="465" y="335" textAnchor="middle" fill="#1c1917" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                [1] GameView (Šachovnice 8x8)
              </text>

              {/* [3] Bílý hráč */}
              <rect x="260" y="525" width="410" height="60" rx="8" fill="#292524" stroke="#57534e" strokeWidth="1.5" />
              <text x="280" y="552" fill="#fafaf9" fontSize="13" fontWeight="bold">
                [3] Bílý Hráč: @bily_jezdec (1350 ELO)
              </text>
              <text x="280" y="572" fill="#a8a29e" fontSize="10">HracView (Bílý) · Vyhozené figurky černého</text>

              {/* Pravý sloupec: Časovač, Záznamník, Kwesty */}
              {/* [4] Časovač */}
              <rect x="690" y="75" width="270" height="85" rx="8" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
              <text x="825" y="100" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">
                [4] DUAL CHESS TIMER
              </text>
              <rect x="705" y="112" width="115" height="36" rx="4" fill="#0c0a09" stroke="#78350f" />
              <text x="762" y="136" textAnchor="middle" fill="#fbbf24" fontSize="16" fontFamily="monospace">04:58</text>
              <rect x="830" y="112" width="115" height="36" rx="4" fill="#0c0a09" stroke="#44403c" />
              <text x="887" y="136" textAnchor="middle" fill="#a8a29e" fontSize="16" fontFamily="monospace">05:00</text>

              {/* [5] GameLogger & Move History */}
              <rect x="690" y="170" width="270" height="205" rx="8" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
              <text x="825" y="195" textAnchor="middle" fill="#e5e5e5" fontSize="11" fontWeight="bold">
                [5] GAME LOGGER & NOTACE
              </text>
              <text x="710" y="222" fill="#78716c" fontSize="10">1. e4 e5</text>
              <text x="710" y="242" fill="#78716c" fontSize="10">2. Jf3 Jc6</text>
              <text x="710" y="262" fill="#78716c" fontSize="10">3. Sc4 Sc5</text>
              <text x="710" y="282" fill="#78716c" fontSize="10">4. O-O Jf6</text>
              <rect x="705" y="330" width="240" height="30" rx="4" fill="#292524" />
              <text x="825" y="350" textAnchor="middle" fill="#fbbf24" fontSize="10">Export PGN / sachy_log.txt</text>

              {/* [6] Kwest Tracker */}
              <rect x="690" y="385" width="270" height="200" rx="8" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
              <text x="825" y="410" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">
                [6] KWESTY & VÝZVY
              </text>
              <rect x="705" y="425" width="240" height="40" rx="4" fill="#292524" />
              <text x="718" y="445" fill="#fef08a" fontSize="10">✓ První tah (+50 XP)</text>
              <rect x="705" y="475" width="240" height="40" rx="4" fill="#292524" />
              <text x="718" y="495" fill="#e7e5e4" fontSize="10">○ Královská rošáda (+200 XP)</text>
              <rect x="705" y="525" width="240" height="40" rx="4" fill="#292524" />
              <text x="718" y="545" fill="#e7e5e4" fontSize="10">○ Vítězný mat (+500 XP)</text>

              {/* Očíslované Callout Bubliny */}
              {components.map((comp) => {
                const px = comp.coordinates.x * 10;
                const py = comp.coordinates.y * 6.25;
                const isSelected = comp.id === selectedComponentId;
                return (
                  <g
                    key={comp.id}
                    onClick={() => setSelectedComponentId(comp.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={px}
                      cy={py}
                      r={isSelected ? 18 : 14}
                      fill={isSelected ? '#eab308' : '#ca8a04'}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />
                    <text
                      x={px}
                      y={py + 5}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {comp.number}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Pravý detail vybrané komponenty (Specifikace & MVC vrstva) */}
        <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs font-mono text-stone-400">Specifikace komponenty</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                  currentComp.layer === 'Model'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : currentComp.layer === 'View'
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {currentComp.layer} Vrstva
              </span>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                  {currentComp.number}
                </span>
                <h3 className="text-base font-bold text-stone-100">{currentComp.name}</h3>
              </div>
              <p className="text-xs text-amber-400/90 font-mono mt-1">{currentComp.czechName}</p>
            </div>

            {/* Třída v původním Python kódu / UML */}
            <div className="mt-4 p-3 rounded-lg bg-stone-950 border border-stone-800">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Původní Python třída (UML):</span>
              </div>
              <p className="font-mono text-xs text-amber-300 mt-1 font-semibold">
                {currentComp.pythonClass}
              </p>
            </div>

            {/* Popis role */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-400" />
                <span>Funkce a zodpovědnost v GUI:</span>
              </h4>
              <p className="text-xs text-stone-400 mt-1.5 leading-relaxed bg-stone-950/40 p-3 rounded-lg border border-stone-800/60">
                {currentComp.roleDescription}
              </p>
            </div>

            {/* Klíčové značky a události */}
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-stone-300 mb-2">Události & Vazby:</h4>
              <div className="flex flex-wrap gap-1.5">
                {currentComp.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700/60"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rychlý přepínač komponent */}
          <div className="mt-6 pt-4 border-t border-stone-800">
            <span className="text-[11px] text-stone-500 block mb-2">Výběr komponenty pro inspekci:</span>
            <div className="grid grid-cols-4 gap-1.5">
              {components.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedComponentId(c.id)}
                  className={`py-1.5 rounded text-xs font-mono font-bold transition-colors ${
                    c.id === selectedComponentId
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  [{c.number}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
