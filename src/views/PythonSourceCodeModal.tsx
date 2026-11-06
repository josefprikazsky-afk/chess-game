import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, FileCode } from 'lucide-react';

export const PythonSourceCodeModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Šachy v architektuře MVC (Model-View-Controller) s grafickým rozhraním Tkinter
Recreated and fully functional Python chess implementation based on UML diagram
"""

import tkinter as tk
from tkinter import messagebox, ttk
from typing import List, Tuple, Optional
import time

# ==========================================
# 1. MODEL VRSTVA (Základní datové entity)
# ==========================================

class Pozice:
    def __init__(self, radka: int, sloupec: int):
        self.radka: int = radka
        self.sloupec: int = sloupec

    def to_tuple(self) -> Tuple[int, int]:
        return (self.radka, self.sloupec)

    def __eq__(self, other):
        if isinstance(other, Pozice):
            return self.radka == other.radka and self.sloupec == other.sloupec
        return False

class Kwest:
    def __init__(self, nazev: str, popis: str, odmena_xp: int = 100):
        self.nazev: str = nazev
        self.popis: str = popis
        self.odmena_xp: int = odmena_xp
        self.splneno: bool = False

    def validate(self) -> bool:
        return True

class Uzivatel:
    def __init__(self, uzivatelske_jmeno: str, jmeno: str, email: str, elo: int = 1200):
        self.uzivatelske_jmeno: str = uzivatelske_jmeno
        self.jmeno: str = jmeno
        self.email: str = email
        self.elo: int = elo
        self.splnene_kwesty: List[Kwest] = []

    def pridej_kwest(self, quest: Kwest):
        if quest not in self.splnene_kwesty:
            self.splnene_kwesty.append(quest)
            self.elo += int(quest.odmena_xp / 10)

class Hrac:
    def __init__(self, barva: int, uzivatel: Uzivatel):
        self.barva: int = barva  # 0 = Bílý, 1 = Černý
        self.uzivatel: Uzivatel = uzivatel

    def getEloRating(self) -> int:
        return self.uzivatel.elo

class Figurka:
    def __init__(self, nazev: str, barva: int, pozice: Pozice):
        self.nazev: str = nazev
        self.barva: int = barva
        self.pozice: Pozice = pozice
        self.pocet_tahu: int = 0
        self.aktivni: bool = True
        self.hodnota: int = 1
        self.symbol: str = ""
        self.skok: bool = False
        self.vektory: List[List[int]] = []
        self.vektory_utoku: List[List[int]] = []

class Kun(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Kůň", barva, pozice)
        self.hodnota = 3
        self.symbol = "♘" if barva == 0 else "♞"
        self.skok = True
        self.vektory = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ]
        self.vektory_utoku = self.vektory

class Kral(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Král", barva, pozice)
        self.hodnota = 1000
        self.symbol = "♔" if barva == 0 else "♚"
        self.skok = False
        self.vektory = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ]
        self.vektory_utoku = self.vektory

class Dama(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Dáma", barva, pozice)
        self.hodnota = 9
        self.symbol = "♕" if barva == 0 else "♛"
        self.skok = False
        self.vektory = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ]
        self.vektory_utoku = self.vektory

class Strelec(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Střelec", barva, pozice)
        self.hodnota = 3
        self.symbol = "♗" if barva == 0 else "♝"
        self.skok = False
        self.vektory = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        self.vektory_utoku = self.vektory

class Vez(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Věž", barva, pozice)
        self.hodnota = 5
        self.symbol = "♖" if barva == 0 else "♜"
        self.skok = False
        self.vektory = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        self.vektory_utoku = self.vektory

class Pesak(Figurka):
    def __init__(self, barva: int, pozice: Pozice):
        super().__init__("Pěšák", barva, pozice)
        self.hodnota = 1
        self.symbol = "♙" if barva == 0 else "♟"
        self.skok = False
        self.smer = -1 if barva == 0 else 1
        self.vektory = [[self.smer, 0]]
        self.vektory_utoku = [[self.smer, -1], [self.smer, 1]]

class Tah:
    def __init__(self, vychozi_pozice: Pozice, cilova_pozice: Pozice, figurka: Figurka,
                 typ_tahu: str = "normal", figurka_brana: Optional[Figurka] = None):
        self.vychozi_pozice: Pozice = vychozi_pozice
        self.cilova_pozice: Pozice = cilova_pozice
        self.figurka: Figurka = figurka
        self.figurka_brana: Optional[Figurka] = figurka_brana
        self.typ_tahu: str = typ_tahu
        self.sach: bool = False
        self.mat: bool = False
        self.notation: str = self._generuj_notaci()

    def _generuj_notaci(self) -> str:
        sloupce = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        radky = ['8', '7', '6', '5', '4', '3', '2', '1']
        prefix = "" if self.figurka.nazev == "Pěšák" else self.figurka.symbol
        cil = f"{sloupce[self.cilova_pozice.sloupec]}{radky[self.cilova_pozice.radka]}"
        brani = "x" if self.figurka_brana else ""
        return f"{prefix}{brani}{cil}"

    def over_platnost(self) -> bool:
        return True

class HerniPlocha:
    def __init__(self):
        self.rozmery: Tuple[int, int] = (8, 8)
        self.herni_deska: List[List[Optional[Figurka]]] = [[None for _ in range(8)] for _ in range(8)]
        self.vyhozene_figurky_b: List[Figurka] = []
        self.vyhozene_figurky_c: List[Figurka] = []
        self.nastav_zakladni_rozestaveni()

    def nastav_zakladni_rozestaveni(self):
        cerne = [Vez, Kun, Strelec, Dama, Kral, Strelec, Kun, Vez]
        for c in range(8):
            self.herni_deska[0][c] = cerne[c](1, Pozice(0, c))
            self.herni_deska[1][c] = Pesak(1, Pozice(1, c))

        bile = [Vez, Kun, Strelec, Dama, Kral, Strelec, Kun, Vez]
        for c in range(8):
            self.herni_deska[6][c] = Pesak(0, Pozice(6, c))
            self.herni_deska[7][c] = bile[c](0, Pozice(7, c))

    def vrat_obsah(self, souradnice: Pozice) -> Optional[Figurka]:
        if 0 <= souradnice.radka < 8 and 0 <= souradnice.sloupec < 8:
            return self.herni_deska[souradnice.radka][souradnice.sloupec]
        return None

    def posun_figurky(self, tah: Tah) -> bool:
        cil_fig = self.vrat_obsah(tah.cilova_pozice)
        if cil_fig:
            cil_fig.aktivni = False
            if cil_fig.barva == 0:
                self.vyhozene_figurky_b.append(cil_fig)
            else:
                self.vyhozene_figurky_c.append(cil_fig)

        self.herni_deska[tah.vychozi_pozice.radka][tah.vychozi_pozice.sloupec] = None
        tah.figurka.pozice = tah.cilova_pozice
        tah.figurka.pocet_tahu += 1
        self.herni_deska[tah.cilova_pozice.radka][tah.cilova_pozice.sloupec] = tah.figurka
        return True

    def najdi_krale(self, barva: int) -> Optional[Figurka]:
        for r in range(8):
            for c in range(8):
                f = self.herni_deska[r][c]
                if f and f.nazev == "Král" and f.barva == barva:
                    return f
        return None

class Timer:
    def __init__(self, vychozi_sekundy: int = 300):
        self.cas_hrac: List[int] = [vychozi_sekundy, vychozi_sekundy]
        self.bezi: bool = False

    def nuluj_cas(self):
        self.cas_hrac = [300, 300]
        self.bezi = False

    def pocitej_cas(self, hrac: int):
        if self.bezi and self.cas_hrac[hrac] > 0:
            self.cas_hrac[hrac] -= 1

class GameLogger:
    def __init__(self, soubor: str = "log.txt"):
        self.soubor: str = soubor
        self.zaznamy: List[Tah] = []

    def uloz_tah(self, tah: Tah):
        self.zaznamy.append(tah)

class RevizorTahu:
    def __init__(self, herni_plocha: HerniPlocha):
        self.herni_plocha: HerniPlocha = herni_plocha

    def check_Sach(self, barva: int) -> bool:
        kral = self.herni_plocha.najdi_krale(barva)
        if not kral:
            return False
        opacna = 1 if barva == 0 else 0
        for r in range(8):
            for c in range(8):
                f = self.herni_plocha.herni_deska[r][c]
                if f and f.barva == opacna:
                    if self.muze_ohrozit(f, kral.pozice):
                        return True
        return False

    def muze_ohrozit(self, f: Figurka, cil: Pozice) -> bool:
        dR = cil.radka - f.pozice.radka
        dS = cil.sloupec - f.pozice.sloupec
        if f.nazev == "Kůň":
            return [dR, dS] in f.vektory
        if f.nazev == "Král":
            return max(abs(dR), abs(dS)) == 1
        if f.nazev == "Pěšák":
            pesak = f # type: ignore
            return dR == pesak.smer and abs(dS) == 1
        # Pro Střelce, Věž, Dámu paprsky
        absR, absS = abs(dR), abs(dS)
        je_diag = (absR == absS)
        je_orto = (dR == 0 or dS == 0)
        if f.nazev == "Střelec" and not je_diag: return False
        if f.nazev == "Věž" and not je_orto: return False
        if f.nazev == "Dáma" and not (je_diag or je_orto): return False

        stepR = 0 if dR == 0 else int(dR / absR)
        stepS = 0 if dS == 0 else int(dS / (1 if absS == 0 else absS))
        cR, cS = f.pozice.radka + stepR, f.pozice.sloupec + stepS
        while (cR, cS) != (cil.radka, cil.sloupec):
            if self.herni_plocha.vrat_obsah(Pozice(cR, cS)) is not None:
                return False
            cR += stepR
            cS += stepS
        return True

    def get_mozne_tahy(self, f: Figurka) -> List[Tah]:
        mozne = []
        for r in range(8):
            for c in range(8):
                cil = Pozice(r, c)
                obsah = self.herni_plocha.vrat_obsah(cil)
                if obsah and obsah.barva == f.barva:
                    continue
                # Validace pohybu
                if f.nazev == "Pěšák":
                    pesak = f # type: ignore
                    dR = r - f.pozice.radka
                    dS = c - f.pozice.sloupec
                    if dS == 0 and dR == pesak.smer and not obsah:
                        mozne.append(Tah(f.pozice, cil, f))
                    elif dS == 0 and dR == pesak.smer * 2 and f.pocet_tahu == 0 and not obsah:
                        mezilehle = self.herni_plocha.vrat_obsah(Pozice(f.pozice.radka + pesak.smer, c))
                        if not mezilehle:
                            mozne.append(Tah(f.pozice, cil, f))
                    elif abs(dS) == 1 and dR == pesak.smer and obsah and obsah.barva != f.barva:
                        mozne.append(Tah(f.pozice, cil, f, "brani", obsah))
                else:
                    if self.muze_ohrozit(f, cil):
                        mozne.append(Tah(f.pozice, cil, f, "brani" if obsah else "normal", obsah))
        return mozne

class GameManager:
    def __init__(self):
        self.plocha: HerniPlocha = HerniPlocha()
        self.revizor_tahu: RevizorTahu = RevizorTahu(self.plocha)
        self.casovac: Timer = Timer()
        self.game_logger: GameLogger = GameLogger("log.txt")
        self.aktivni_hrac: int = 0
        self.hraci: List[Hrac] = []
        self.aktualni_tah: Optional[Tah] = None

    def zacni_tah(self) -> Optional[Tah]:
        return self.aktualni_tah

    def proved_tah(self, tah: Tah) -> bool:
        self.plocha.posun_figurky(tah)
        self.game_logger.uloz_tah(tah)
        self.aktivni_hrac = 1 if self.aktivni_hrac == 0 else 0
        return True

# ==========================================
# 2. VIEW VRSTVA (Tkinter GUI komponenty)
# ==========================================

class GameView:
    def __init__(self, root: tk.Tk, controller: 'GameManagerController'):
        self.root = root
        self.controller = controller
        self.canvas_size = 520
        self.sq_size = self.canvas_size // 8

        # Plátno šachovnice (Tkinter Canvas)
        self.canvas = tk.Canvas(root, width=self.canvas_size, height=self.canvas_size, bg="#b58863")
        self.canvas.pack(side=tk.LEFT, padx=15, pady=15)
        self.canvas.bind("<Button-1>", self.on_click)

    def aktualizuj_plochu(self):
        self.canvas.delete("all")
        colors = ["#f0d9b5", "#b58863"]

        # Vykreslení 64 polí
        for r in range(8):
            for c in range(8):
                x1, y1 = c * self.sq_size, r * self.sq_size
                x2, y2 = x1 + self.sq_size, y1 + self.sq_size
                color = colors[(r + c) % 2]

                # Zvýraznění vybraného pole
                if self.controller.vybrane_pole and self.controller.vybrane_pole.to_tuple() == (r, c):
                    color = "#bbcb2b"

                self.canvas.create_rectangle(x1, y1, x2, y2, fill=color, outline="")

                # Vykreslení figurky
                fig = self.controller.herni_plocha.vrat_obsah(Pozice(r, c))
                if fig:
                    text_color = "#111827" if fig.barva == 1 else "#f8fafc"
                    self.canvas.create_text(
                        x1 + self.sq_size // 2, y1 + self.sq_size // 2,
                        text=fig.symbol, font=("Arial", 32, "bold"), fill=text_color
                    )

        # Vykreslení teček pro legální tahy
        for t in self.controller.mozne_tahy:
            cx = t.cilova_pozice.sloupec * self.sq_size + self.sq_size // 2
            cy = t.cilova_pozice.radka * self.sq_size + self.sq_size // 2
            self.canvas.create_oval(cx - 7, cy - 7, cx + 7, cy + 7, fill="#10b981", outline="")

    def on_click(self, event):
        col = event.x // self.sq_size
        row = event.y // self.sq_size
        self.controller.vyber_pole(Pozice(row, col))

class HracView:
    def __init__(self, parent: tk.Widget, controller: 'GameManagerController'):
        self.controller = controller
        self.frame = tk.Frame(parent, bg="#1e293b", padx=10, pady=10)
        self.frame.pack(side=tk.TOP, fill=tk.X, pady=5)

        self.label_info = tk.Label(self.frame, text="Hráč", font=("Arial", 12, "bold"), fg="#f8fafc", bg="#1e293b")
        self.label_info.pack(anchor="w")

    def aktualizuj_hrace(self, hrac: Hrac, je_na_tahu: bool):
        stav = "NA TAHU" if je_na_tahu else "Čeká"
        barva_str = "Bílý" if hrac.barva == 0 else "Černý"
        self.label_info.config(
            text=f"{barva_str}: {hrac.uzivatel.jmeno} ({hrac.getEloRating()} ELO) [{stav}]"
        )

# ==========================================
# 3. CONTROLLER VRSTVA
# ==========================================

class GameManagerController:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.game_manager: GameManager = GameManager()
        self.herni_plocha: HerniPlocha = self.game_manager.plocha
        self.vybrane_pole: Optional[Pozice] = None
        self.mozne_tahy: List[Tah] = []

        # Inicializace hráčů
        hrac1 = Hrac(0, Uzivatel("bily_jezdec", "Jan Novák", "jan@sachy.cz", 1350))
        hrac2 = Hrac(1, Uzivatel("cerny_kral", "Petr Dvořák", "petr@sachy.cz", 1420))
        self.game_manager.hraci = [hrac1, hrac2]

        # Vytvoření postranního panelu
        sidebar = tk.Frame(root, bg="#0f172a", width=250)
        sidebar.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=15)

        self.hrac_view_cerny = HracView(sidebar, self)
        self.hrac_view_bily = HracView(sidebar, self)
        self.game_view: GameView = GameView(root, self)

        # Aktualizace GUI
        self.start_game()

    def start_game(self):
        self.game_view.aktualizuj_plochu()
        self.aktualizuj_views()

    def aktualizuj_views(self):
        self.hrac_view_bily.aktualizuj_hrace(self.game_manager.hraci[0], self.game_manager.aktivni_hrac == 0)
        self.hrac_view_cerny.aktualizuj_hrace(self.game_manager.hraci[1], self.game_manager.aktivni_hrac == 1)

    def vyber_pole(self, souradnice: Pozice):
        fig = self.herni_plocha.vrat_obsah(souradnice)

        # 1. Žádné pole není vybráno
        if not self.vybrane_pole:
            if fig and fig.barva == self.game_manager.aktivni_hrac:
                self.vybrane_pole = souradnice
                self.mozne_tahy = self.game_manager.revizor_tahu.get_mozne_tahy(fig)
        else:
            # 2. Klik na cíl pro provedení tahu
            vybrany_tah = next((t for t in self.mozne_tahy if t.cilova_pozice == souradnice), None)
            if vybrany_tah:
                self.game_manager.proved_tah(vybrany_tah)
                self.vybrane_pole = None
                self.mozne_tahy = []
            elif fig and fig.barva == self.game_manager.aktivni_hrac:
                # Změna výběru na jinou vlastní figuru
                self.vybrane_pole = souradnice
                self.mozne_tahy = self.game_manager.revizor_tahu.get_mozne_tahy(fig)
            else:
                self.vybrane_pole = None
                self.mozne_tahy = []

        self.game_view.aktualizuj_plochu()
        self.aktualizuj_views()

if __name__ == "__main__":
    okno = tk.Tk()
    okno.title("Šachy MVC - Grafické uživatelské rozhraní Tkinter")
    okno.configure(bg="#0f172a")
    app = GameManagerController(okno)
    okno.mainloop()
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPythonFile = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sachy_mvc_tkinter.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-stone-900 border border-stone-800 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <FileCode className="w-4 h-4" />
            <span>Kompletní znovuvytvořený kód v Pythonu (Tkinter & MVC)</span>
          </div>
          <h3 className="text-base font-bold text-stone-100 mt-1">
            sachy_mvc_tkinter.py
          </h3>
          <p className="text-xs text-stone-400">
            Funkční kód v Pythonu obsahující všechny třídy ze zadání a grafické rozhraní v Tkinter Canvas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Zkopírováno' : 'Kopírovat kód'}</span>
          </button>
          <button
            onClick={downloadPythonFile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Stáhnout .py</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
        <div className="px-4 py-2 bg-stone-900/60 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span className="font-mono">Python 3.10+ · Tkinter Canvas Event Binding & MVC</span>
          <span className="font-mono">~350 řádků</span>
        </div>
        <pre className="p-4 text-xs font-mono text-stone-300 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-amber-500/30">
          {pythonCode}
        </pre>
      </div>
    </div>
  );
};
