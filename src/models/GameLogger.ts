/**
 * Třída GameLogger pro zápis tahů, událostí a export PGN a logu
 */
import { GameLoggerEntry } from '../types/chess';
import { Tah } from './Tah';

export class GameLogger {
  public soubor: string;
  public zaznamy: GameLoggerEntry[] = [];
  public textovyLog: string[] = [];

  constructor(soubor: string = 'sachy_log.txt') {
    this.soubor = soubor;
    this.vytvor_soubor(soubor);
  }

  public vytvor_soubor(nazev: string): void {
    this.soubor = nazev;
    this.zaznamy = [];
    this.textovyLog = [`[${new Date().toISOString()}] Šachy MVC - Záznam hry inicializován.`];
  }

  public logZprava(zprava: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.textovyLog.push(`[${timestamp}] ${zprava}`);
  }

  public uloz_tah(tah: Tah): void {
    const barva = tah.figurka.barva;
    const timestamp = new Date().toLocaleTimeString();

    if (barva === 0) {
      // Bílý zahajuje nový tah
      const cisloTahu = this.zaznamy.length + 1;
      this.zaznamy.push({
        cisloTahu,
        bily: tah.toState(),
        casRazitko: timestamp,
      });
      this.logZprava(`${cisloTahu}. Bílý (${tah.figurka.nazev}): ${tah.notation}`);
    } else {
      // Černý doplňuje stávající tah
      if (this.zaznamy.length > 0) {
        const aktualni = this.zaznamy[this.zaznamy.length - 1];
        aktualni.cerny = tah.toState();
        this.logZprava(`${aktualni.cisloTahu}... Černý (${tah.figurka.nazev}): ${tah.notation}`);
      } else {
        this.zaznamy.push({
          cisloTahu: 1,
          cerny: tah.toState(),
          casRazitko: timestamp,
        });
        this.logZprava(`1... Černý (${tah.figurka.nazev}): ${tah.notation}`);
      }
    }
  }

  public exportujPGN(bilyJmeno: string = 'Bílý', cernyJmeno: string = 'Černý', vysledek: string = '*'): string {
    const datum = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    const hlavicka = [
      `[Event "Šachy MVC Turnaj"]`,
      `[Site "Google AI Studio"]`,
      `[Date "${datum}"]`,
      `[Round "1"]`,
      `[White "${bilyJmeno}"]`,
      `[Black "${cernyJmeno}"]`,
      `[Result "${vysledek}"]`,
      ``
    ].join('\n');

    const tahyText = this.zaznamy.map(z => {
      const b = z.bily ? z.bily.notation : '';
      const c = z.cerny ? ` ${z.cerny.notation}` : '';
      return `${z.cisloTahu}. ${b}${c}`;
    }).join(' ');

    return `${hlavicka}\n${tahyText} ${vysledek}\n`;
  }

  public exportujLog(): string {
    return this.textovyLog.join('\n');
  }
}
