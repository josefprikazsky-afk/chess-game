/**
 * Třída HerniPlocha reprezentující 8x8 šachovnici a obsah polí
 */
import { Barva, Pozice } from '../types/chess';
import { Dama, Figurka, Kral, Kun, Pesak, Strelec, Vez, vytvorFigurku } from './Figurky';
import { Tah } from './Tah';

export class HerniPlocha {
  public rozmery: [number, number] = [8, 8];
  public herni_deska: (Figurka | null)[][];
  public vyhozene_figurky_b: Figurka[] = []; // bílé figurky sebrané černým
  public vyhozene_figurky_c: Figurka[] = []; // černé figurky sebrané bílým

  constructor(prazdna: boolean = false) {
    this.herni_deska = Array.from({ length: 8 }, () => Array(8).fill(null));
    if (!prazdna) {
      this.nastavZakladniRozestaveni();
    }
  }

  public nastavZakladniRozestaveni(): void {
    // 0 = Bílý (řadka 7 pro pěšce, 6 pro figury? Pozor: index 0 = 8. řada černý, index 7 = 1. řada bílý)
    // Černé figury (radka 0 a 1)
    const cerneFigury = [Vez, Kun, Strelec, Dama, Kral, Strelec, Kun, Vez];
    for (let col = 0; col < 8; col++) {
      const Trida = cerneFigury[col];
      this.herni_deska[0][col] = new Trida(1, { radka: 0, sloupec: col });
      this.herni_deska[1][col] = new Pesak(1, { radka: 1, sloupec: col });
    }

    // Bílé figury (radka 6 a 7)
    const bileFigury = [Vez, Kun, Strelec, Dama, Kral, Strelec, Kun, Vez];
    for (let col = 0; col < 8; col++) {
      this.herni_deska[6][col] = new Pesak(0, { radka: 6, sloupec: col });
      const Trida = bileFigury[col];
      this.herni_deska[7][col] = new Trida(0, { radka: 7, sloupec: col });
    }
  }

  public jeValidniPozice(pozice: Pozice): boolean {
    return (
      pozice.radka >= 0 &&
      pozice.radka < 8 &&
      pozice.sloupec >= 0 &&
      pozice.sloupec < 8
    );
  }

  public vrat_obsah(souradnice: Pozice): Figurka | null {
    if (!this.jeValidniPozice(souradnice)) return null;
    return this.herni_deska[souradnice.radka][souradnice.sloupec];
  }

  public nastavFigurku(fig: Figurka | null, pozice: Pozice): void {
    if (!this.jeValidniPozice(pozice)) return;
    this.herni_deska[pozice.radka][pozice.sloupec] = fig;
    if (fig) {
      fig.pozice = { ...pozice };
    }
  }

  public odeberFigurku(pozice: Pozice): Figurka | null {
    if (!this.jeValidniPozice(pozice)) return null;
    const fig = this.herni_deska[pozice.radka][pozice.sloupec];
    this.herni_deska[pozice.radka][pozice.sloupec] = null;
    return fig;
  }

  public posun_figurky(tah: Tah): boolean {
    const { vychozi_pozice, cilova_pozice, figurka, typ_tahu } = tah;

    // Speciální tahy
    if (typ_tahu === 'rosada_kratka') {
      const radka = figurka.barva === 0 ? 7 : 0;
      // Král z e1/e8 (sloupec 4) na g1/g8 (sloupec 6)
      const kral = this.odeberFigurku({ radka, sloupec: 4 });
      if (kral) {
        kral.pocetTahu++;
        this.nastavFigurku(kral, { radka, sloupec: 6 });
      }
      // Věž z h1/h8 (sloupec 7) na f1/f8 (sloupec 5)
      const vez = this.odeberFigurku({ radka, sloupec: 7 });
      if (vez) {
        vez.pocetTahu++;
        this.nastavFigurku(vez, { radka, sloupec: 5 });
      }
      return true;
    }

    if (typ_tahu === 'rosada_dlouha') {
      const radka = figurka.barva === 0 ? 7 : 0;
      // Král z e1/e8 na c1/c8 (sloupec 2)
      const kral = this.odeberFigurku({ radka, sloupec: 4 });
      if (kral) {
        kral.pocetTahu++;
        this.nastavFigurku(kral, { radka, sloupec: 2 });
      }
      // Věž z a1/a8 (sloupec 0) na d1/d8 (sloupec 3)
      const vez = this.odeberFigurku({ radka, sloupec: 0 });
      if (vez) {
        vez.pocetTahu++;
        this.nastavFigurku(vez, { radka, sloupec: 3 });
      }
      return true;
    }

    if (typ_tahu === 'en_passant') {
      // Sebrání pěšce vedle cílového pole
      const sebranyRadka = vychozi_pozice.radka;
      const sebranySloupec = cilova_pozice.sloupec;
      const sebranyPesak = this.odeberFigurku({ radka: sebranyRadka, sloupec: sebranySloupec });
      if (sebranyPesak) {
        sebranyPesak.aktivni = false;
        if (sebranyPesak.barva === 0) this.vyhozene_figurky_b.push(sebranyPesak);
        else this.vyhozene_figurky_c.push(sebranyPesak);
      }
    } else {
      // Standardní braní
      const cilovaFigurka = this.vrat_obsah(cilova_pozice);
      if (cilovaFigurka) {
        cilovaFigurka.aktivni = false;
        if (cilovaFigurka.barva === 0) {
          this.vyhozene_figurky_b.push(cilovaFigurka);
        } else {
          this.vyhozene_figurky_c.push(cilovaFigurka);
        }
      }
    }

    // Přesun figurky
    this.odeberFigurku(vychozi_pozice);
    figurka.pocetTahu++;

    if (tah.povyseniNa) {
      const novaFigurka = vytvorFigurku(tah.povyseniNa, figurka.barva, cilova_pozice);
      novaFigurka.pocetTahu = figurka.pocetTahu;
      this.nastavFigurku(novaFigurka, cilova_pozice);
    } else {
      this.nastavFigurku(figurka, cilova_pozice);
    }

    return true;
  }

  public nahrad_figurku(novaFigurka: Figurka, tah: Tah): void {
    this.nastavFigurku(novaFigurka, tah.cilova_pozice);
  }

  public najdiKrale(barva: Barva): Figurka | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const f = this.herni_deska[r][c];
        if (f && f.typ === 'kral' && f.barva === barva) {
          return f;
        }
      }
    }
    return null;
  }

  public getVsechnyFigurky(barva?: Barva): Figurka[] {
    const result: Figurka[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const f = this.herni_deska[r][c];
        if (f && (barva === undefined || f.barva === barva)) {
          result.push(f);
        }
      }
    }
    return result;
  }

  public kopie(): HerniPlocha {
    const nova = new HerniPlocha(true);
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const f = this.herni_deska[r][c];
        if (f) {
          nova.herni_deska[r][c] = f.klon();
        }
      }
    }
    nova.vyhozene_figurky_b = this.vyhozene_figurky_b.map(f => f.klon());
    nova.vyhozene_figurky_c = this.vyhozene_figurky_c.map(f => f.klon());
    return nova;
  }

  public getMaterialAdvantage(): { bily: number; cerny: number; rozdil: number } {
    let bily = 0;
    let cerny = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const f = this.herni_deska[r][c];
        if (f && f.typ !== 'kral') {
          if (f.barva === 0) bily += f.hodnota;
          else cerny += f.hodnota;
        }
      }
    }
    return { bily, cerny, rozdil: bily - cerny };
  }
}
