/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { GameManager } from './models/GameManager';
import { GameManagerController } from './controllers/GameManagerController';
import { BoardView } from './views/BoardView';
import { HracView } from './views/HracView';
import { TimerView } from './views/TimerView';
import { GameLoggerView } from './views/GameLoggerView';
import { KwestView } from './views/KwestView';
import { VisualDesignBlueprint } from './views/VisualDesignBlueprint';
import { MVCArchitectureInspector } from './views/MVCArchitectureInspector';
import { PythonSourceCodeModal } from './views/PythonSourceCodeModal';
import { ChessPieceIcon } from './views/ChessPieceIcon';
import { sounds } from './utils/sound';
import { TypFigurky } from './types/chess';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  RotateCw,
  Flag,
  Handshake,
  Bot,
  User,
  LayoutDashboard,
  Activity,
  FileCode,
  Trophy,
  Swords,
  ChevronRight,
} from 'lucide-react';

export default function App() {
  // Inicializace Modelu a Controlleru (jediná instance sdílená v rámci životního cyklu)
  const controller = useMemo(() => new GameManagerController(), []);
  const gm = controller.game_manager;

  // React synchronizace s Controllerem
  const [version, setVersion] = useState(0);
  useEffect(() => {
    return controller.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, [controller]);

  // Hlavní navigační záložka
  const [aktivniZalozka, setAktivniZalozka] = useState<'hra' | 'blueprint' | 'mvc' | 'python'>('hra');

  // Nastavení rozhraní
  const [otocenaDeska, setOtocenaDeska] = useState(false);
  const [zvukMuted, setZvukMuted] = useState(false);
  const [herniRezim, setHerniRezim] = useState<'2hraci' | 'bot'>('bot');
  const [botObtiznost, setBotObtiznost] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Systémový interval časovače (1x za sekundu)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      controller.tikCasovace();
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [controller]);

  // Efekt konfet při matu
  useEffect(() => {
    if (gm.stav_hry === 'mat') {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback pokud není k dispozici canvas
      }
    }
  }, [gm.stav_hry]);

  // Spuštění nové hry
  const handleNovaHra = (vsBot = herniRezim === 'bot') => {
    controller.start_game(vsBot, botObtiznost);
  };

  const handleToggleZvuk = () => {
    const novyMuted = sounds.toggleMute();
    setZvukMuted(novyMuted);
  };

  // Stažení PGN
  const handleStahnoutPGN = () => {
    const bilyJmeno = gm.hraci[0]?.uzivatel.uzivatelske_jmeno || 'Bily';
    const cernyJmeno = gm.hraci[1]?.uzivatel.uzivatelske_jmeno || 'Cerny';
    let vysledek = '*';
    if (gm.vitez === 0) vysledek = '1-0';
    else if (gm.vitez === 1) vysledek = '0-1';
    else if (gm.stav_hry === 'pat' || gm.stav_hry === 'remiza') vysledek = '1/2-1/2';

    const pgn = gm.game_logger.exportujPGN(bilyJmeno, cernyJmeno, vysledek);
    const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sachy_partie_${Date.now()}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Stažení logu
  const handleStahnoutLog = () => {
    const log = gm.game_logger.exportujLog();
    const blob = new Blob([log], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sachy_log_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const material = gm.plocha.getMaterialAdvantage();
  const jeBilyVSachu = gm.revizor_tahu.check_Sach(0);
  const jeCernyVSachu = gm.revizor_tahu.check_Sach(1);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* 2. Top Bar Contract: Brand zone (1 line) — 4 clean nav links — 1-2 primary actions */}
      <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-6 py-3.5 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
            <Swords className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            Šachy MVC
          </span>
        </div>

        {/* Zone 2: Clean navigation links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-900/80 p-1 rounded-xl border border-stone-800">
          <button
            onClick={() => setAktivniZalozka('hra')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              aktivniZalozka === 'hra'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Herní Partie</span>
          </button>

          <button
            onClick={() => setAktivniZalozka('blueprint')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              aktivniZalozka === 'blueprint'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Vizuální Návrh (Úkol 1)</span>
          </button>

          <button
            onClick={() => setAktivniZalozka('mvc')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              aktivniZalozka === 'mvc'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Architektura MVC</span>
          </button>

          <button
            onClick={() => setAktivniZalozka('python')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ${
              aktivniZalozka === 'python'
                ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Python Kód</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleZvuk}
            title={zvukMuted ? 'Zapnout zvuk' : 'Ztlumit zvuk'}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            {zvukMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => handleNovaHra()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nová Hra</span>
          </button>
        </div>
      </header>

      {/* Mobilní přepínač záložek pro malé obrazovky */}
      <div className="md:hidden px-4 py-2 border-b border-stone-800 flex items-center gap-1 overflow-x-auto bg-stone-950">
        <button
          onClick={() => setAktivniZalozka('hra')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            aktivniZalozka === 'hra' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Hra
        </button>
        <button
          onClick={() => setAktivniZalozka('blueprint')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            aktivniZalozka === 'blueprint' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Návrh (Úkol 1)
        </button>
        <button
          onClick={() => setAktivniZalozka('mvc')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            aktivniZalozka === 'mvc' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          MVC Inspekce
        </button>
        <button
          onClick={() => setAktivniZalozka('python')}
          className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
            aktivniZalozka === 'python' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
          }`}
        >
          Python Tkinter
        </button>
      </div>

      {/* Hlavní obsahová část */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ZÁLOŽKA 1: ŽIVÁ ŠACHOVÁ PARTIE */}
        {aktivniZalozka === 'hra' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Levá / Středová část: Šachovnice a karty hráčů */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="w-full max-w-[560px] space-y-3">
                {/* Horní hráč (Černý) */}
                <HracView
                  hrac={gm.hraci[1].toState()}
                  jeNaTahu={gm.aktivni_hrac === 1}
                  vyhozeneFigurky={gm.plocha.vyhozene_figurky_b}
                  materialovyRozdil={material.rozdil < 0 ? Math.abs(material.rozdil) : 0}
                  jeVSachu={jeCernyVSachu}
                />

                {/* Šachovnice (GameView / BoardView) */}
                <div className="relative">
                  <BoardView
                    plocha={gm.plocha}
                    aktivniHrac={gm.aktivni_hrac}
                    vybranaPozice={controller.vybranaPozice}
                    mozneCile={controller.mozneCile}
                    posledniTah={gm.aktualni_tah}
                    jeVSachu={gm.stav_hry === 'sach'}
                    otocenaDeska={otocenaDeska}
                    onVyberPole={(pozice) => controller.vyber_pole(pozice)}
                  />

                  {/* Indikátor přemýšlení bota */}
                  {controller.botPremysli && (
                    <div className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>AI Bot přemýšlí...</span>
                    </div>
                  )}
                </div>

                {/* Spodní hráč (Bílý) */}
                <HracView
                  hrac={gm.hraci[0].toState()}
                  jeNaTahu={gm.aktivni_hrac === 0}
                  vyhozeneFigurky={gm.plocha.vyhozene_figurky_c}
                  materialovyRozdil={material.rozdil > 0 ? material.rozdil : 0}
                  jeVSachu={jeBilyVSachu}
                />

                {/* Ovládací lišta partie */}
                <div className="flex items-center justify-between p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => controller.vratZpet()}
                      disabled={gm.historieTahu.length === 0}
                      title="Vrátit tah zpět"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Zpět</span>
                    </button>

                    <button
                      onClick={() => setOtocenaDeska(!otocenaDeska)}
                      title="Otočit šachovnici"
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Volba režimu (vs Bot / 2 Hráči) */}
                  <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
                    <button
                      onClick={() => {
                        setHerniRezim('bot');
                        handleNovaHra(true);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        herniRezim === 'bot'
                          ? 'bg-amber-500 text-stone-950 font-semibold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Bot className="w-3 h-3" />
                      <span>vs Počítač</span>
                    </button>
                    <button
                      onClick={() => {
                        setHerniRezim('2hraci');
                        handleNovaHra(false);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        herniRezim === '2hraci'
                          ? 'bg-amber-500 text-stone-950 font-semibold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>2 Hráči</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => controller.nabidnoutRemizu()}
                      disabled={!gm.bezi}
                      title="Nabídnout remízu"
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-40 transition-colors"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => controller.vzdatSe(gm.aktivni_hrac)}
                      disabled={!gm.bezi}
                      title="Vzdat partii"
                      className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-950/60 text-stone-300 hover:text-red-400 disabled:opacity-40 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pravá část: Hodiny, Notace a Kwesty */}
            <div className="lg:col-span-5 space-y-4">
              {/* Digitální šachový časovač */}
              <TimerView
                timer={gm.casovac.toState()}
                aktivniHrac={gm.aktivni_hrac}
                hrajici={gm.bezi}
                onZmenaCasu={(min, inc) => controller.nastavCas(min, inc)}
              />

              {/* Záznamník tahů a log */}
              <GameLoggerView
                zaznamy={gm.game_logger.zaznamy}
                textovyLog={gm.game_logger.textovyLog}
                onStahnoutPGN={handleStahnoutPGN}
                onStahnoutLog={handleStahnoutLog}
                pgnString={gm.game_logger.exportujPGN(
                  gm.hraci[0]?.uzivatel.uzivatelske_jmeno,
                  gm.hraci[1]?.uzivatel.uzivatelske_jmeno
                )}
              />

              {/* Kwesty & Úkoly */}
              <KwestView
                kwesty={gm.kwesty.map((k) => k.toState())}
                aktivniHracJmeno={gm.hraci[gm.aktivni_hrac]?.uzivatel.jmeno || 'Hráč'}
              />
            </div>
          </div>
        )}

        {/* ZÁLOŽKA 2: VIZUÁLNÍ NÁVRH (ÚKOL Č. 1 ZE ZADÁNÍ) */}
        {aktivniZalozka === 'blueprint' && <VisualDesignBlueprint />}

        {/* ZÁLOŽKA 3: ARCHITEKTURA MVC A ŽIVÁ INSPEKCE */}
        {aktivniZalozka === 'mvc' && <MVCArchitectureInspector gameManager={gm} />}

        {/* ZÁLOŽKA 4: REKREOVANÝ PYTHON KÓD (TKINTER & MVC) */}
        {aktivniZalozka === 'python' && <PythonSourceCodeModal />}
      </main>

      {/* Dialog výběru povýšení pěšce */}
      {controller.cekajiciPovyseniTah && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="text-base font-bold text-stone-100">Povýšení pěšce</h3>
            <p className="text-xs text-stone-400 mt-1">Zvolte figuru, na kterou se má pěšák proměnit:</p>

            <div className="grid grid-cols-4 gap-3 my-6">
              {[
                { typ: 'dama' as TypFigurky, nazev: 'Dáma' },
                { typ: 'vez' as TypFigurky, nazev: 'Věž' },
                { typ: 'strelec' as TypFigurky, nazev: 'Střelec' },
                { typ: 'kun' as TypFigurky, nazev: 'Kůň' },
              ].map((item) => (
                <button
                  key={item.typ}
                  onClick={() => controller.potvrdPovyseni(item.typ)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 hover:bg-stone-800 transition-all group"
                >
                  <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                    <ChessPieceIcon typ={item.typ} barva={gm.aktivni_hrac} />
                  </div>
                  <span className="text-[11px] font-medium text-stone-300">{item.nazev}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => controller.zrusPovyseni()}
              className="w-full py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-medium transition-colors"
            >
              Zrušit tah
            </button>
          </div>
        </div>
      )}

      {/* Dialog konce hry (Mat / Pat / Vypršení času / Vzdání) */}
      {!gm.bezi && gm.stav_hry !== 'cekajici' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-stone-100">
              {gm.vitez !== null
                ? `Vítězství: ${gm.vitez === 0 ? 'Bílý' : 'Černý'}!`
                : 'Partie skončila nerozhodně'}
            </h3>

            <p className="text-xs text-stone-400 mt-1 capitalize">
              Důvod: {gm.stav_hry === 'mat' ? 'Šach mat' : gm.stav_hry === 'vyprsel_cas' ? 'Vypršel čas' : gm.stav_hry === 'vzdani' ? 'Hráč se vzdal' : 'Pat / Remíza'}
            </p>

            <div className="my-5 p-4 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-around font-mono text-xs">
              <div>
                <span className="text-stone-500 block text-[10px]">Bílý</span>
                <span className="font-bold text-stone-200">{gm.hraci[0].uzivatel.uzivatelske_jmeno}</span>
                <span className="text-amber-400 block text-[11px] font-semibold">{gm.hraci[0].uzivatel.elo} ELO</span>
              </div>
              <div className="text-stone-600 font-bold text-lg">vs</div>
              <div>
                <span className="text-stone-500 block text-[10px]">Černý</span>
                <span className="font-bold text-stone-200">{gm.hraci[1].uzivatel.uzivatelske_jmeno}</span>
                <span className="text-amber-400 block text-[11px] font-semibold">{gm.hraci[1].uzivatel.elo} ELO</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNovaHra()}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
              >
                Hrát znovu
              </button>
              <button
                onClick={() => setAktivniZalozka('blueprint')}
                className="py-2.5 px-4 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                Zobrazit návrh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
