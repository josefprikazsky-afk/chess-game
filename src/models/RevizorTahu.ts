/**
 * Třída RevizorTahu ověřující platnost tahů a pravidla šachu (šach, mat, pat, rošáda, en passant)
 */
import { Barva, Pozice, TypFigurky, TypTahu } from '../types/chess';
import { Figurka, Pesak } from './Figurky';
import { HerniPlocha } from './HerniPlocha';
import { Tah } from './Tah';

export class RevizorTahu {
  public herni_plocha: HerniPlocha;
  public posledniTah: Tah | null = null;

  constructor(herni_plocha: HerniPlocha) {
    this.herni_plocha = herni_plocha;
  }

  public simulate_Move(plocha: HerniPlocha, tah: Tah): HerniPlocha {
    const kopie = plocha.kopie();
    const figNaKopii = kopie.vrat_obsah(tah.vychozi_pozice);
    if (!figNaKopii) return kopie;

    const simulovanyTah = new Tah(
      tah.vychozi_pozice,
      tah.cilova_pozice,
      figNaKopii,
      tah.typ_tahu,
      tah.figurkaBrana,
      tah.povyseniNa
    );
    kopie.posun_figurky(simulovanyTah);
    return kopie;
  }

  public check_Sach(barva: Barva, plocha: HerniPlocha = this.herni_plocha): boolean {
    const kral = plocha.najdiKrale(barva);
    if (!kral) return false;

    const opacnaBarva: Barva = barva === 0 ? 1 : 0;
    const soupereFigurky = plocha.getVsechnyFigurky(opacnaBarva);

    for (const f of soupereFigurky) {
      if (this.muzeOhrozitPole(f, kral.pozice, plocha)) {
        return true;
      }
    }
    return false;
  }

  public mozeOhrozitPole(figurka: Figurka, cil: Pozice, plocha: HerniPlocha = this.herni_plocha): boolean {
    return this.muzeOhrozitPole(figurka, cil, plocha);
  }

  private muzeOhrozitPole(figurka: Figurka, cil: Pozice, plocha: HerniPlocha): boolean {
    const { radka: zR, sloupec: zS } = figurka.pozice;
    const { radka: cR, sloupec: cS } = cil;

    if (zR === cR && zS === cS) return false;

    switch (figurka.typ) {
      case 'kun': {
        for (const [dR, dS] of figurka.vektory) {
          if (zR + dR === cR && zS + dS === cS) return true;
        }
        return false;
      }

      case 'kral': {
        const diffR = Math.abs(zR - cR);
        const diffS = Math.abs(zS - cS);
        return diffR <= 1 && diffS <= 1;
      }

      case 'pesak': {
        const pesak = figurka as Pesak;
        const diffR = cR - zR;
        const diffS = Math.abs(cS - zS);
        return diffR === pesak.smer && diffS === 1;
      }

      case 'strelec':
      case 'vez':
      case 'dama': {
        const dR = cR - zR;
        const dS = cS - zS;
        const absR = Math.abs(dR);
        const absS = Math.abs(dS);

        const jeOrtogonalni = (zR === cR || zS === cS);
        const jeDiagonalni = (absR === absS);

        if (figurka.typ === 'strelec' && !jeDiagonalni) return false;
        if (figurka.typ === 'vez' && !jeOrtogonalni) return false;
        if (figurka.typ === 'dama' && !jeOrtogonalni && !jeDiagonalni) return false;

        const stepR = dR === 0 ? 0 : dR / absR;
        const stepS = dS === 0 ? 0 : dS / (dS === 0 ? 1 : absS);

        let curR = zR + stepR;
        let curS = zS + stepS;

        while (curR !== cR || curS !== cS) {
          if (plocha.vrat_obsah({ radka: curR, sloupec: curS }) !== null) {
            return false; // překážka
          }
          curR += stepR;
          curS += stepS;
        }
        return true;
      }
    }
  }

  public getMozneTahy(figurka: Figurka, plocha: HerniPlocha = this.herni_plocha): Tah[] {
    const mozneTahy: Tah[] = [];
    const { radka: zR, sloupec: zS } = figurka.pozice;

    if (figurka.typ === 'kun') {
      for (const [dR, dS] of figurka.vektory) {
        const cR = zR + dR;
        const cS = zS + dS;
        const cilPoz: Pozice = { radka: cR, sloupec: cS };
        if (plocha.jeValidniPozice(cilPoz)) {
          const cilFig = plocha.vrat_obsah(cilPoz);
          if (!cilFig || cilFig.barva !== figurka.barva) {
            mozneTahy.push(new Tah(
              figurka.pozice,
              cilPoz,
              figurka,
              cilFig ? 'brani' : 'normal',
              cilFig
            ));
          }
        }
      }
    } else if (figurka.typ === 'kral') {
      for (const [dR, dS] of figurka.vektory) {
        const cR = zR + dR;
        const cS = zS + dS;
        const cilPoz: Pozice = { radka: cR, sloupec: cS };
        if (plocha.jeValidniPozice(cilPoz)) {
          const cilFig = plocha.vrat_obsah(cilPoz);
          if (!cilFig || cilFig.barva !== figurka.barva) {
            mozneTahy.push(new Tah(
              figurka.pozice,
              cilPoz,
              figurka,
              cilFig ? 'brani' : 'normal',
              cilFig
            ));
          }
        }
      }

      // Rošáda (Castling)
      if (figurka.pocetTahu === 0 && !this.check_Sach(figurka.barva, plocha)) {
        const radka = figurka.barva === 0 ? 7 : 0;

        // Krátká rošáda (sloupce 5 a 6 musí být volné, věž na sloupci 7 se nepohnula)
        const vezKratka = plocha.vrat_obsah({ radka, sloupec: 7 });
        if (
          vezKratka &&
          vezKratka.typ === 'vez' &&
          vezKratka.barva === figurka.barva &&
          vezKratka.pocetTahu === 0 &&
          !plocha.vrat_obsah({ radka, sloupec: 5 }) &&
          !plocha.vrat_obsah({ radka, sloupec: 6 })
        ) {
          // Král nesmí projít přes šachované pole
          const sim1 = this.simulate_Move(plocha, new Tah(figurka.pozice, { radka, sloupec: 5 }, figurka));
          if (!this.check_Sach(figurka.barva, sim1)) {
            mozneTahy.push(new Tah(
              figurka.pozice,
              { radka, sloupec: 6 },
              figurka,
              'rosada_kratka'
            ));
          }
        }

        // Dlouhá rošáda (sloupce 1, 2, 3 volné, věž na 0)
        const vezDlouha = plocha.vrat_obsah({ radka, sloupec: 0 });
        if (
          vezDlouha &&
          vezDlouha.typ === 'vez' &&
          vezDlouha.barva === figurka.barva &&
          vezDlouha.pocetTahu === 0 &&
          !plocha.vrat_obsah({ radka, sloupec: 1 }) &&
          !plocha.vrat_obsah({ radka, sloupec: 2 }) &&
          !plocha.vrat_obsah({ radka, sloupec: 3 })
        ) {
          const sim1 = this.simulate_Move(plocha, new Tah(figurka.pozice, { radka, sloupec: 3 }, figurka));
          if (!this.check_Sach(figurka.barva, sim1)) {
            mozneTahy.push(new Tah(
              figurka.pozice,
              { radka, sloupec: 2 },
              figurka,
              'rosada_dlouha'
            ));
          }
        }
      }
    } else if (figurka.typ === 'pesak') {
      const pesak = figurka as Pesak;
      const smer = pesak.smer;

      // Krok o 1 pole dopředu
      const krok1: Pozice = { radka: zR + smer, sloupec: zS };
      if (plocha.jeValidniPozice(krok1) && !plocha.vrat_obsah(krok1)) {
        // Kontrola povýšení
        if ((pesak.barva === 0 && krok1.radka === 0) || (pesak.barva === 1 && krok1.radka === 7)) {
          const promoMoznosti: TypFigurky[] = ['dama', 'vez', 'strelec', 'kun'];
          for (const p of promoMoznosti) {
            mozneTahy.push(new Tah(figurka.pozice, krok1, figurka, 'povyseni', null, p));
          }
        } else {
          mozneTahy.push(new Tah(figurka.pozice, krok1, figurka, 'normal'));
        }

        // Krok o 2 pole dopředu při prvním tahu
        const startRadka = pesak.barva === 0 ? 6 : 1;
        const krok2: Pozice = { radka: zR + smer * 2, sloupec: zS };
        if (zR === startRadka && plocha.jeValidniPozice(krok2) && !plocha.vrat_obsah(krok2)) {
          mozneTahy.push(new Tah(figurka.pozice, krok2, figurka, 'normal'));
        }
      }

      // Útok šikmo (vlevo a vpravo)
      for (const dS of [-1, 1]) {
        const utokPoz: Pozice = { radka: zR + smer, sloupec: zS + dS };
        if (plocha.jeValidniPozice(utokPoz)) {
          const cilFig = plocha.vrat_obsah(utokPoz);
          if (cilFig && cilFig.barva !== pesak.barva) {
            if ((pesak.barva === 0 && utokPoz.radka === 0) || (pesak.barva === 1 && utokPoz.radka === 7)) {
              for (const p of ['dama', 'vez', 'strelec', 'kun'] as TypFigurky[]) {
                mozneTahy.push(new Tah(figurka.pozice, utokPoz, figurka, 'povyseni', cilFig, p));
              }
            } else {
              mozneTahy.push(new Tah(figurka.pozice, utokPoz, figurka, 'brani', cilFig));
            }
          }

          // En Passant
          if (
            this.posledniTah &&
            this.posledniTah.figurka.typ === 'pesak' &&
            Math.abs(this.posledniTah.vychozi_pozice.radka - this.posledniTah.cilova_pozice.radka) === 2 &&
            this.posledniTah.cilova_pozice.radka === zR &&
            this.posledniTah.cilova_pozice.sloupec === zS + dS
          ) {
            mozneTahy.push(new Tah(
              figurka.pozice,
              utokPoz,
              figurka,
              'en_passant',
              this.posledniTah.figurka
            ));
          }
        }
      }
    } else {
      // Střelec, Věž, Dáma (paprsky)
      const smery: number[][] = [];
      if (figurka.typ === 'strelec' || figurka.typ === 'dama') {
        smery.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (figurka.typ === 'vez' || figurka.typ === 'dama') {
        smery.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      for (const [dR, dS] of smery) {
        let curR = zR + dR;
        let curS = zS + dS;

        while (plocha.jeValidniPozice({ radka: curR, sloupec: curS })) {
          const cilPoz: Pozice = { radka: curR, sloupec: curS };
          const cilFig = plocha.vrat_obsah(cilPoz);

          if (!cilFig) {
            mozneTahy.push(new Tah(figurka.pozice, cilPoz, figurka, 'normal'));
          } else {
            if (cilFig.barva !== figurka.barva) {
              mozneTahy.push(new Tah(figurka.pozice, cilPoz, figurka, 'brani', cilFig));
            }
            break; // zastaveno figurou
          }

          curR += dR;
          curS += dS;
        }
      }
    }

    // Filtrovat pouze tahy, které nenechají vlastního krále v šachu!
    return mozneTahy.filter(t => {
      const simulace = this.simulate_Move(plocha, t);
      return !this.check_Sach(figurka.barva, simulace);
    });
  }

  public getVsechnyMozneTahy(barva: Barva, plocha: HerniPlocha = this.herni_plocha): Tah[] {
    const figurky = plocha.getVsechnyFigurky(barva);
    const vsechnyTahy: Tah[] = [];

    for (const f of figurky) {
      const tahyFigurky = this.getMozneTahy(f, plocha);
      vsechnyTahy.push(...tahyFigurky);
    }
    return vsechnyTahy;
  }

  public check_Mat(barva: Barva, plocha: HerniPlocha = this.herni_plocha): boolean {
    const jeSach = this.check_Sach(barva, plocha);
    if (!jeSach) return false;

    const mozneTahy = this.getVsechnyMozneTahy(barva, plocha);
    return mozneTahy.length === 0;
  }

  public check_Pat(barva: Barva, plocha: HerniPlocha = this.herni_plocha): boolean {
    const jeSach = this.check_Sach(barva, plocha);
    if (jeSach) return false;

    const mozneTahy = this.getVsechnyMozneTahy(barva, plocha);
    return mozneTahy.length === 0;
  }

  public over_Remizu(barva: Barva, plocha: HerniPlocha = this.herni_plocha): boolean {
    if (this.check_Pat(barva, plocha)) return true;

    // Nedostatek materiálu (Král vs Král, Král+Střelec vs Král, Král+Jezdec vs Král)
    const vsechny = plocha.getVsechnyFigurky();
    if (vsechny.length === 2) return true; // 2 králové
    if (vsechny.length === 3) {
      const nonKing = vsechny.find(f => f.typ !== 'kral');
      if (nonKing && (nonKing.typ === 'kun' || nonKing.typ === 'strelec')) return true;
    }

    return false;
  }

  public jePlatny(tah: Tah): boolean {
    const mozneTahy = this.getMozneTahy(tah.figurka);
    return mozneTahy.some(t => 
      t.vychozi_pozice.radka === tah.vychozi_pozice.radka &&
      t.vychozi_pozice.sloupec === tah.vychozi_pozice.sloupec &&
      t.cilova_pozice.radka === tah.cilova_pozice.radka &&
      t.cilova_pozice.sloupec === tah.cilova_pozice.sloupec &&
      (!t.povyseniNa || t.povyseniNa === tah.povyseniNa)
    );
  }
}
