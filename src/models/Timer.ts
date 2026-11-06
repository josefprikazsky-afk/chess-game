/**
 * Třída Timer pro měření a správu herního času obou hráčů
 */
import { Barva, TimerState } from '../types/chess';

export class Timer {
  public cas_hrac: [number, number] = [300, 300]; // 5 minut v sekundách
  public vychoziCas: number = 300;
  public inkrement: number = 3;
  public bezi: boolean = false;
  public aktivniHrac: Barva = 0; // 0 = bílý

  constructor(vychoziMinuty: number = 5, inkrementSekundy: number = 3) {
    this.vychoziCas = vychoziMinuty * 60;
    this.inkrement = inkrementSekundy;
    this.nuluj_cas();
  }

  public nuluj_cas(): void {
    this.cas_hrac = [this.vychoziCas, this.vychoziCas];
    this.bezi = false;
    this.aktivniHrac = 0;
  }

  public nastavCas(minuty: number, inkrement: number): void {
    this.vychoziCas = minuty * 60;
    this.inkrement = inkrement;
    this.nuluj_cas();
  }

  public start(): void {
    this.bezi = true;
  }

  public stop(): void {
    this.bezi = false;
  }

  public tik(onCasVyprsel?: (prohravajiciHrac: Barva) => void): void {
    if (!this.bezi) return;

    if (this.cas_hrac[this.aktivniHrac] > 0) {
      this.cas_hrac[this.aktivniHrac]--;
      if (this.cas_hrac[this.aktivniHrac] <= 0) {
        this.bezi = false;
        if (onCasVyprsel) {
          onCasVyprsel(this.aktivniHrac);
        }
      }
    }
  }

  public prepni(dalsiHrac: Barva): void {
    // Přičti inkrement hráči, který právě dokončil tah
    if (this.cas_hrac[this.aktivniHrac] > 0) {
      this.cas_hrac[this.aktivniHrac] += this.inkrement;
    }
    this.aktivniHrac = dalsiHrac;
  }

  public formatujCas(sekundy: number): string {
    const s = Math.max(0, Math.floor(sekundy));
    const minuty = Math.floor(s / 60);
    const zbytek = s % 60;
    return `${minuty.toString().padStart(2, '0')}:${zbytek.toString().padStart(2, '0')}`;
  }

  public toState(): TimerState {
    return {
      casBily: this.cas_hrac[0],
      casCerny: this.cas_hrac[1],
      vychoziCas: this.vychoziCas,
      inkrement: this.inkrement,
      bezi: this.bezi,
      aktivniHrac: this.aktivniHrac,
    };
  }
}
