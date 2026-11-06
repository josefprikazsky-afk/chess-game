/**
 * Typové definice pro šachovou hru v architektuře MVC
 * Odpovídá původnímu Python návrhu a UML diagramu
 */

export type Barva = 0 | 1; // 0 = Bílý (White), 1 = Černý (Black)

export type TypFigurky = 'pesak' | 'kun' | 'strelec' | 'vez' | 'dama' | 'kral';

export interface Pozice {
  radka: number;    // 0 až 7 (0 = 8. řada pro černého, 7 = 1. řada pro bílého z pohledu pole)
  sloupec: number;  // 0 až 7 (0 = sloupec 'a', 7 = sloupec 'h')
}

export interface FigurkaState {
  id: string;
  nazev: string;
  typ: TypFigurky;
  barva: Barva;
  pozice: Pozice;
  pocetTahu: number;
  aktivni: boolean;
  hodnota: number;
  symbol: string;
  skok: boolean;
  vektory: number[][];
  vektoryUtoku: number[][];
}

export type TypTahu = 
  | 'normal' 
  | 'brani' 
  | 'rosada_kratka' 
  | 'rosada_dlouha' 
  | 'en_passant' 
  | 'povyseni';

export interface TahState {
  id: string;
  figurka: FigurkaState;
  zPozice: Pozice;
  naPozice: Pozice;
  figurkaBrana?: FigurkaState | null;
  typTahu: TypTahu;
  sach: boolean;
  mat: boolean;
  pat?: boolean;
  notation: string;
  cas: string;
  povyseniNa?: TypFigurky;
}

export type StavHry = 
  | 'cekajici' 
  | 'probihajici' 
  | 'sach' 
  | 'mat' 
  | 'pat' 
  | 'remiza' 
  | 'vyprsel_cas' 
  | 'vzdani';

export interface KwestState {
  id: string;
  nazev: string;
  popis: string;
  splneno: boolean;
  odmenaXp: number;
  ikona: string;
  kategorie: 'zatecnik' | 'taktik' | 'mistr';
}

export interface UzivatelState {
  id: string;
  uzivatelske_jmeno: string;
  jmeno: string;
  email: string;
  elo: number;
  splnene_kwesty: string[];
  odehraneHry: number;
  vyhry: number;
  remizy: number;
  prohry: number;
}

export interface HracState {
  barva: Barva;
  uzivatel: UzivatelState;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
}

export interface TimerState {
  casBily: number;    // v sekundách
  casCerny: number;   // v sekundách
  vychoziCas: number; // např. 300 s (5 min)
  inkrement: number;  // např. 3 s
  bezi: boolean;
  aktivniHrac: Barva;
}

export interface GameLoggerEntry {
  cisloTahu: number;
  bily?: TahState;
  cerny?: TahState;
  fen?: string;
  casRazitko: string;
}

export interface MVCComponentLabel {
  id: string;
  number: number;
  name: string;
  czechName: string;
  layer: 'Model' | 'View' | 'Controller';
  pythonClass: string;
  roleDescription: string;
  coordinates: { x: number; y: number }; // percentage position on design mockup
  tags: string[];
}
