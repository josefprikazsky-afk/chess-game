/**
 * Třída Tah odpovídající původnímu návrhu Tah(vychozi_pozice, cilova_pozice, figurka, typ_tahu)
 */
import { Figurka } from './Figurky';
import { Pozice, TahState, TypFigurky, TypTahu } from '../types/chess';

export class Tah {
  public id: string;
  public vychozi_pozice: Pozice;
  public cilova_pozice: Pozice;
  public figurka: Figurka;
  public figurkaBrana: Figurka | null = null;
  public typ_tahu: TypTahu = 'normal';
  public sach: boolean = false;
  public mat: boolean = false;
  public pat: boolean = false;
  public cas: string = '';
  public povyseniNa?: TypFigurky;
  public notation: string = '';

  constructor(
    vychozi_pozice: Pozice,
    cilova_pozice: Pozice,
    figurka: Figurka,
    typ_tahu: TypTahu = 'normal',
    figurkaBrana: Figurka | null = null,
    povyseniNa?: TypFigurky
  ) {
    this.id = `tah_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.vychozi_pozice = { ...vychozi_pozice };
    this.cilova_pozice = { ...cilova_pozice };
    this.figurka = figurka;
    this.typ_tahu = typ_tahu;
    this.figurkaBrana = figurkaBrana;
    this.povyseniNa = povyseniNa;
    this.cas = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.generujNotaci();
  }

  public generujNotaci(): void {
    if (this.typ_tahu === 'rosada_kratka') {
      this.notation = 'O-O';
      return;
    }
    if (this.typ_tahu === 'rosada_dlouha') {
      this.notation = 'O-O-O';
      return;
    }

    const sloupcePismena = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const radkyCisla = ['8', '7', '6', '5', '4', '3', '2', '1'];

    let piecePrefix = '';
    switch (this.figurka.typ) {
      case 'kral': piecePrefix = 'K'; break;
      case 'dama': piecePrefix = 'D'; break;
      case 'vez': piecePrefix = 'V'; break;
      case 'strelec': piecePrefix = 'S'; break;
      case 'kun': piecePrefix = 'J'; break;
      case 'pesak': piecePrefix = ''; break;
    }

    const targetSquare = `${sloupcePismena[this.cilova_pozice.sloupec]}${radkyCisla[this.cilova_pozice.radka]}`;
    const captureMark = this.figurkaBrana ? 'x' : '';
    const pawnCapturePrefix = (this.figurka.typ === 'pesak' && this.figurkaBrana)
      ? sloupcePismena[this.vychozi_pozice.sloupec]
      : '';

    let promotionMark = '';
    if (this.povyseniNa) {
      const promoMap: Record<TypFigurky, string> = {
        dama: '=D',
        vez: '=V',
        strelec: '=S',
        kun: '=J',
        kral: '',
        pesak: ''
      };
      promotionMark = promoMap[this.povyseniNa] || '=D';
    }

    let checkMark = '';
    if (this.mat) checkMark = '#';
    else if (this.sach) checkMark = '+';

    this.notation = `${pawnCapturePrefix}${piecePrefix}${captureMark}${targetSquare}${promotionMark}${checkMark}`;
  }

  public over_platnost(): boolean {
    return true;
  }

  public toState(): TahState {
    return {
      id: this.id,
      figurka: this.figurka.toState(),
      zPozice: { ...this.vychozi_pozice },
      naPozice: { ...this.cilova_pozice },
      figurkaBrana: this.figurkaBrana ? this.figurkaBrana.toState() : null,
      typTahu: this.typ_tahu,
      sach: this.sach,
      mat: this.mat,
      pat: this.pat,
      notation: this.notation,
      cas: this.cas,
      povyseniNa: this.povyseniNa,
    };
  }
}
