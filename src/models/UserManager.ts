/**
 * Třídy Kwest, Uzivatel, Hrac a UserManager odpovídající původnímu zadání
 */
import { Barva, HracState, KwestState, UzivatelState } from '../types/chess';
import { Tah } from './Tah';

export class Kwest {
  public id: string;
  public nazev: string;
  public popis: string;
  public splneno: boolean = false;
  public odmenaXp: number;
  public ikona: string;
  public kategorie: 'zatecnik' | 'taktik' | 'mistr';
  private validatorFn: (tah: Tah, kontext: any) => boolean;

  constructor(
    id: string,
    nazev: string,
    popis: string,
    odmenaXp: number,
    ikona: string,
    kategorie: 'zatecnik' | 'taktik' | 'mistr',
    validatorFn: (tah: Tah, kontext: any) => boolean
  ) {
    this.id = id;
    this.nazev = nazev;
    this.popis = popis;
    this.odmenaXp = odmenaXp;
    this.ikona = ikona;
    this.kategorie = kategorie;
    this.validatorFn = validatorFn;
  }

  public validate(tah: Tah, kontext: any): boolean {
    if (this.splneno) return true;
    const ok = this.validatorFn(tah, kontext);
    if (ok) {
      this.splneno = true;
    }
    return ok;
  }

  public toState(): KwestState {
    return {
      id: this.id,
      nazev: this.nazev,
      popis: this.popis,
      splneno: this.splneno,
      odmenaXp: this.odmenaXp,
      ikona: this.ikona,
      kategorie: this.kategorie,
    };
  }
}

export class Uzivatel {
  public id: string;
  public uzivatelske_jmeno: string;
  public jmeno: string;
  public email: string;
  public elo: number;
  public splnene_kwesty: Kwest[] = [];
  public odehraneHry: number = 0;
  public vyhry: number = 0;
  public remizy: number = 0;
  public prohry: number = 0;

  constructor(uzivatelske_jmeno: string, jmeno: string, email: string, elo: number = 1200) {
    this.id = `user_${uzivatelske_jmeno}`;
    this.uzivatelske_jmeno = uzivatelske_jmeno;
    this.jmeno = jmeno;
    this.email = email;
    this.elo = elo;
  }

  public pridej_kwest(quest: Kwest): void {
    if (!this.splnene_kwesty.some(q => q.id === quest.id)) {
      this.splnene_kwesty.push(quest);
      this.elo += Math.round(quest.odmenaXp / 10);
    }
  }

  public aktualizujElo(souperElo: number, skore: number): number {
    // ELO algoritmus: K-faktor = 32
    const K = 32;
    const ocekavane = 1 / (1 + Math.pow(10, (souperElo - this.elo) / 400));
    const zmena = Math.round(K * (skore - ocekavane));
    this.elo = Math.max(100, this.elo + zmena);
    return zmena;
  }

  public toState(): UzivatelState {
    return {
      id: this.id,
      uzivatelske_jmeno: this.uzivatelske_jmeno,
      jmeno: this.jmeno,
      email: this.email,
      elo: this.elo,
      splnene_kwesty: this.splnene_kwesty.map(k => k.id),
      odehraneHry: this.odehraneHry,
      vyhry: this.vyhry,
      remizy: this.remizy,
      prohry: this.prohry,
    };
  }
}

export class Hrac {
  public barva: Barva;
  public uzivatel: Uzivatel;
  public isBot: boolean = false;
  public botDifficulty?: 'easy' | 'medium' | 'hard';

  constructor(barva: Barva, uzivatel: Uzivatel, isBot: boolean = false, botDifficulty?: 'easy' | 'medium' | 'hard') {
    this.barva = barva;
    this.uzivatel = uzivatel;
    this.isBot = isBot;
    this.botDifficulty = botDifficulty;
  }

  public getEloRating(): number {
    return this.uzivatel.elo;
  }

  public toState(): HracState {
    return {
      barva: this.barva,
      uzivatel: this.uzivatel.toState(),
      isBot: this.isBot,
      botDifficulty: this.botDifficulty,
    };
  }
}

export class UserManager {
  public uzivatele: Map<string, Uzivatel> = new Map();
  public aktivniUzivatel: Uzivatel | null = null;
  public log_uzivatelu: string = '';
  public historie_uzivatele: string = '';

  constructor() {
    this.inicializujVychoziUzivatele();
  }

  private inicializujVychoziUzivatele(): void {
    const u1 = new Uzivatel('bily_jezdec', 'Jan Novák', 'jan.novak@sachy.cz', 1350);
    const u2 = new Uzivatel('cerny_kral', 'Petr Dvořák', 'petr.dvorak@sachy.cz', 1420);
    const bot = new Uzivatel('ai_mistr', 'Šachový Bot AI', 'bot@sachy.cz', 1500);

    this.uzivatele.set(u1.uzivatelske_jmeno, u1);
    this.uzivatele.set(u2.uzivatelske_jmeno, u2);
    this.uzivatele.set(bot.uzivatelske_jmeno, bot);

    this.aktivniUzivatel = u1;
  }

  public najdi_uzivatele(username: string): Uzivatel | undefined {
    return this.uzivatele.get(username);
  }

  public vytvorUzivatele(username: string, jmeno: string, email: string, elo: number = 1200): Uzivatel {
    const existujici = this.uzivatele.get(username);
    if (existujici) return existujici;

    const novy = new Uzivatel(username, jmeno, email, elo);
    this.uzivatele.set(username, novy);
    return novy;
  }

  public vytvorStandardniKwesty(): Kwest[] {
    return [
      new Kwest(
        'prvni_krok',
        'První tah',
        'Zahraj svůj první tah v partii',
        50,
        'Flag',
        'zatecnik',
        (tah) => tah.figurka.pocetTahu === 1
      ),
      new Kwest(
        'skok_konem',
        'Jezdcův skok',
        'Zahraj libovolný tah koněm',
        100,
        'Sparkles',
        'zatecnik',
        (tah) => tah.figurka.typ === 'kun'
      ),
      new Kwest(
        'prvni_korist',
        'První kořist',
        'Vyhoď jakoukoliv soupeřovu figurku',
        150,
        'ShieldAlert',
        'zatecnik',
        (tah) => !!tah.figurkaBrana
      ),
      new Kwest(
        'kralovska_rosada',
        'Královská rošáda',
        'Zabezpeč krále provedením malé nebo velké rošády',
        200,
        'Castle',
        'taktik',
        (tah) => tah.typ_tahu === 'rosada_kratka' || tah.typ_tahu === 'rosada_dlouha'
      ),
      new Kwest(
        'sach_krali',
        'Šach!',
        'Uveď soupeřova krále do přímého šachu',
        250,
        'Crown',
        'taktik',
        (tah) => tah.sach && !tah.mat
      ),
      new Kwest(
        'lov_na_damu',
        'Lov na dámu',
        'Vyhoď nejsilnější soupeřovu figuru - dámu',
        300,
        'Target',
        'mistr',
        (tah) => !!(tah.figurkaBrana && tah.figurkaBrana.typ === 'dama')
      ),
      new Kwest(
        'sach_mat',
        'Vítězný mat',
        'Ukonči partii nekompromisním matem',
        500,
        'Trophy',
        'mistr',
        (tah) => tah.mat
      )
    ];
  }
}
