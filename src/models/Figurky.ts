/**
 * Třídy figurek implementující strukturu z Python kódu a UML diagramu
 */
import { Barva, FigurkaState, Pozice, TypFigurky } from '../types/chess';

export abstract class Figurka {
  public id: string;
  public nazev: string;
  public barva: Barva;
  public typ: TypFigurky;
  public pozice: Pozice;
  public pocetTahu: number = 0;
  public aktivni: boolean = true;
  public hodnota: number = 1;
  public symbol: string = '';
  public skok: boolean = false;
  public vektory: number[][] = [];
  public vektoryUtoku: number[][] = [];

  constructor(nazev: string, barva: Barva, typ: TypFigurky, pozice: Pozice) {
    this.id = `${typ}_${barva}_${pozice.radka}_${pozice.sloupec}_${Math.random().toString(36).substring(2, 7)}`;
    this.nazev = nazev;
    this.barva = barva;
    this.typ = typ;
    this.pozice = { ...pozice };
  }

  public toState(): FigurkaState {
    return {
      id: this.id,
      nazev: this.nazev,
      typ: this.typ,
      barva: this.barva,
      pozice: { ...this.pozice },
      pocetTahu: this.pocetTahu,
      aktivni: this.aktivni,
      hodnota: this.hodnota,
      symbol: this.symbol,
      skok: this.skok,
      vektory: this.vektory,
      vektoryUtoku: this.vektoryUtoku,
    };
  }

  public abstract klon(): Figurka;
}

export class Kun extends Figurka {
  constructor(barva: Barva, pozice: Pozice) {
    super('Kůň', barva, 'kun', pozice);
    this.hodnota = 3;
    this.symbol = barva === 0 ? '♘' : '♞';
    this.skok = true;
    this.vektory = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    this.vektoryUtoku = [...this.vektory];
  }

  public klon(): Kun {
    const k = new Kun(this.barva, this.pozice);
    k.id = this.id;
    k.pocetTahu = this.pocetTahu;
    k.aktivni = this.aktivni;
    return k;
  }
}

export class Kral extends Figurka {
  constructor(barva: Barva, pozice: Pozice) {
    super('Král', barva, 'kral', pozice);
    this.hodnota = 1000;
    this.symbol = barva === 0 ? '♔' : '♚';
    this.skok = false;
    this.vektory = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    this.vektoryUtoku = [...this.vektory];
  }

  public klon(): Kral {
    const k = new Kral(this.barva, this.pozice);
    k.id = this.id;
    k.pocetTahu = this.pocetTahu;
    k.aktivni = this.aktivni;
    return k;
  }
}

export class Dama extends Figurka {
  constructor(barva: Barva, pozice: Pozice) {
    super('Dáma', barva, 'dama', pozice);
    this.hodnota = 9;
    this.symbol = barva === 0 ? '♕' : '♛';
    this.skok = false;
    this.vektory = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    this.vektoryUtoku = [...this.vektory];
  }

  public klon(): Dama {
    const d = new Dama(this.barva, this.pozice);
    d.id = this.id;
    d.pocetTahu = this.pocetTahu;
    d.aktivni = this.aktivni;
    return d;
  }
}

export class Strelec extends Figurka {
  constructor(barva: Barva, pozice: Pozice) {
    super('Střelec', barva, 'strelec', pozice);
    this.hodnota = 3;
    this.symbol = barva === 0 ? '♗' : '♝';
    this.skok = false;
    this.vektory = [
      [-1, -1], [-1, 1],
      [1, -1],  [1, 1]
    ];
    this.vektoryUtoku = [...this.vektory];
  }

  public klon(): Strelec {
    const s = new Strelec(this.barva, this.pozice);
    s.id = this.id;
    s.pocetTahu = this.pocetTahu;
    s.aktivni = this.aktivni;
    return s;
  }
}

export class Vez extends Figurka {
  constructor(barva: Barva, pozice: Pozice) {
    super('Věž', barva, 'vez', pozice);
    this.hodnota = 5;
    this.symbol = barva === 0 ? '♖' : '♜';
    this.skok = false;
    this.vektory = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];
    this.vektoryUtoku = [...this.vektory];
  }

  public klon(): Vez {
    const v = new Vez(this.barva, this.pozice);
    v.id = this.id;
    v.pocetTahu = this.pocetTahu;
    v.aktivni = this.aktivni;
    return v;
  }
}

export class Pesak extends Figurka {
  public smer: number; // -1 pro bílého (stoupá 6 -> 0), +1 pro černého (klesá 1 -> 7)

  constructor(barva: Barva, pozice: Pozice) {
    super('Pěšák', barva, 'pesak', pozice);
    this.hodnota = 1;
    this.symbol = barva === 0 ? '♙' : '♟';
    this.skok = false;
    this.smer = barva === 0 ? -1 : 1;
    this.vektory = [[this.smer, 0]];
    this.vektoryUtoku = [[this.smer, -1], [this.smer, 1]];
  }

  public klon(): Pesak {
    const p = new Pesak(this.barva, this.pozice);
    p.id = this.id;
    p.pocetTahu = this.pocetTahu;
    p.aktivni = this.aktivni;
    return p;
  }
}

export function vytvorFigurku(typ: TypFigurky, barva: Barva, pozice: Pozice): Figurka {
  switch (typ) {
    case 'kral': return new Kral(barva, pozice);
    case 'dama': return new Dama(barva, pozice);
    case 'vez': return new Vez(barva, pozice);
    case 'strelec': return new Strelec(barva, pozice);
    case 'kun': return new Kun(barva, pozice);
    case 'pesak': return new Pesak(barva, pozice);
  }
}
