/**
 * Třída GameManager - centrální herní model koordinující pravidla, desku, časovač, log a hráče
 */
import { Barva, StavHry } from '../types/chess';
import { HerniPlocha } from './HerniPlocha';
import { RevizorTahu } from './RevizorTahu';
import { Timer } from './Timer';
import { GameLogger } from './GameLogger';
import { Hrac, Kwest, UserManager, Uzivatel } from './UserManager';
import { Tah } from './Tah';
import { Figurka } from './Figurky';

export class GameManager {
  public plocha: HerniPlocha;
  public revizor_tahu: RevizorTahu;
  public casovac: Timer;
  public game_logger: GameLogger;
  public user_manager: UserManager;

  public aktivni_hrac: Barva = 0; // 0 = bílý
  public hraci: Hrac[] = [];
  public aktualni_tah: Tah | null = null;
  public stav_hry: StavHry = 'cekajici';
  public kwesty: Kwest[] = [];
  public historieTahu: Tah[] = [];
  public bezi: boolean = false;
  public vitez: Barva | null = null;

  // Listenery pro observer pattern (Model -> View notifikace)
  private posluchaci: Array<() => void> = [];

  constructor() {
    this.plocha = new HerniPlocha();
    this.revizor_tahu = new RevizorTahu(this.plocha);
    this.casovac = new Timer(5, 3);
    this.game_logger = new GameLogger('sachy_log.txt');
    this.user_manager = new UserManager();
    this.kwesty = this.user_manager.vytvorStandardniKwesty();
    this.inicializujVychoziHru();
  }

  public pridejPosluchace(callback: () => void): () => void {
    this.posluchaci.push(callback);
    return () => {
      this.posluchaci = this.posluchaci.filter(cb => cb !== callback);
    };
  }

  public upozorniPosluchace(): void {
    for (const cb of this.posluchaci) {
      cb();
    }
  }

  public inicializujVychoziHru(): void {
    const u1 = this.user_manager.najdi_uzivatele('bily_jezdec')!;
    const u2 = this.user_manager.najdi_uzivatele('cerny_kral')!;

    this.hraci = [
      new Hrac(0, u1, false),
      new Hrac(1, u2, false)
    ];

    this.startHry();
  }

  public startHry(vsBot: boolean = false, botObtiznost: 'easy' | 'medium' | 'hard' = 'medium'): void {
    this.plocha = new HerniPlocha();
    this.revizor_tahu = new RevizorTahu(this.plocha);
    this.casovac.nuluj_cas();
    this.game_logger.vytvor_soubor(`sachy_${Date.now()}.txt`);
    this.aktivni_hrac = 0;
    this.aktualni_tah = null;
    this.historieTahu = [];
    this.stav_hry = 'probihajici';
    this.bezi = true;
    this.vitez = null;

    const u1 = this.user_manager.najdi_uzivatele('bily_jezdec')!;
    if (vsBot) {
      const bot = this.user_manager.najdi_uzivatele('ai_mistr')!;
      this.hraci = [
        new Hrac(0, u1, false),
        new Hrac(1, bot, true, botObtiznost)
      ];
    }

    this.casovac.start();
    this.game_logger.logZprava(`Zahájena nová partie: ${this.hraci[0].uzivatel.uzivatelske_jmeno} (Bílý) vs ${this.hraci[1].uzivatel.uzivatelske_jmeno} (Černý)`);
    this.upozorniPosluchace();
  }

  public proved_tah(tah: Tah): boolean {
    if (!this.bezi || (this.stav_hry !== 'probihajici' && this.stav_hry !== 'sach')) {
      return false;
    }

    if (tah.figurka.barva !== this.aktivni_hrac) {
      return false;
    }

    // Ověření revizorem
    if (!this.revizor_tahu.jePlatny(tah)) {
      return false;
    }

    // Provedení tahu na desce
    this.plocha.posun_figurky(tah);
    this.revizor_tahu.posledniTah = tah;
    this.historieTahu.push(tah);
    this.aktualni_tah = tah;

    // Přepnutí času a přidání inkrementu
    const dalsiBarva: Barva = this.aktivni_hrac === 0 ? 1 : 0;
    this.casovac.prepni(dalsiBarva);

    // Kontrola šachu, matu a patu pro soupeře
    const soupereJeVSachu = this.revizor_tahu.check_Sach(dalsiBarva);
    const soupereJeVMatu = this.revizor_tahu.check_Mat(dalsiBarva);
    const soupereJeVPatu = this.revizor_tahu.check_Pat(dalsiBarva);
    const jeRemiza = this.revizor_tahu.over_Remizu(dalsiBarva);

    tah.sach = soupereJeVSachu;
    tah.mat = soupereJeVMatu;
    tah.pat = soupereJeVPatu;
    tah.generujNotaci();

    // Uložení tahu do logu
    this.game_logger.uloz_tah(tah);

    // Validace splněných questů
    this.overKwesty(tah);

    if (soupereJeVMatu) {
      this.konecHry('mat', this.aktivni_hrac);
    } else if (soupereJeVPatu || jeRemiza) {
      this.konecHry('pat');
    } else if (soupereJeVSachu) {
      this.stav_hry = 'sach';
      this.zmenHrace();
    } else {
      this.stav_hry = 'probihajici';
      this.zmenHrace();
    }

    this.upozorniPosluchace();
    return true;
  }

  private overKwesty(tah: Tah): void {
    const aktivniUzivatel = this.hraci[this.aktivni_hrac].uzivatel;
    for (const q of this.kwesty) {
      if (!q.splneno) {
        const splnenoTed = q.validate(tah, { plocha: this.plocha, revizor: this.revizor_tahu });
        if (splnenoTed) {
          aktivniUzivatel.pridej_kwest(q);
          this.game_logger.logZprava(`🏆 Kwest splněn: "${q.nazev}" (+${q.odmenaXp} XP pro ${aktivniUzivatel.uzivatelske_jmeno})`);
        }
      }
    }
  }

  public zmenHrace(): void {
    this.aktivni_hrac = this.aktivni_hrac === 0 ? 1 : 0;
  }

  public konecHry(vysledek: StavHry, vitez?: Barva): void {
    this.stav_hry = vysledek;
    this.bezi = false;
    this.vitez = vitez !== undefined ? vitez : null;
    this.casovac.stop();

    const uBily = this.hraci[0].uzivatel;
    const uCerny = this.hraci[1].uzivatel;
    uBily.odehraneHry++;
    uCerny.odehraneHry++;

    let vysledekText = '*';
    if (vitez === 0) {
      uBily.vyhry++;
      uCerny.prohry++;
      uBily.aktualizujElo(uCerny.elo, 1);
      uCerny.aktualizujElo(uBily.elo, 0);
      vysledekText = '1-0';
      this.game_logger.logZprava(`Partie skončila. Vítěz: Bílý (${uBily.uzivatelske_jmeno})`);
    } else if (vitez === 1) {
      uCerny.vyhry++;
      uBily.prohry++;
      uCerny.aktualizujElo(uBily.elo, 1);
      uBily.aktualizujElo(uCerny.elo, 0);
      vysledekText = '0-1';
      this.game_logger.logZprava(`Partie skončila. Vítěz: Černý (${uCerny.uzivatelske_jmeno})`);
    } else {
      uBily.remizy++;
      uCerny.remizy++;
      uBily.aktualizujElo(uCerny.elo, 0.5);
      uCerny.aktualizujElo(uBily.elo, 0.5);
      vysledekText = '1/2-1/2';
      this.game_logger.logZprava(`Partie skončila remízou (${vysledek}).`);
    }

    this.upozorniPosluchace();
  }

  public vzdatSe(barva: Barva): void {
    const vitez: Barva = barva === 0 ? 1 : 0;
    this.konecHry('vzdani', vitez);
  }

  public nabidnoutRemizu(): void {
    this.konecHry('remiza');
  }

  public vratZpet(): boolean {
    if (this.historieTahu.length === 0) return false;

    // Vrátit zpět 1 tah (nebo 2 pokud hraje hráč proti botovi)
    const pocetZpet = (this.hraci[1].isBot && this.aktivni_hrac === 0 && this.historieTahu.length >= 2) ? 2 : 1;
    for (let i = 0; i < pocetZpet; i++) {
      this.historieTahu.pop();
    }

    // Rekonstruovat hrací desku z počátku
    this.plocha = new HerniPlocha();
    this.revizor_tahu = new RevizorTahu(this.plocha);
    this.aktivni_hrac = 0;

    for (const t of this.historieTahu) {
      const fig = this.plocha.vrat_obsah(t.vychozi_pozice);
      if (fig) {
        const replayTah = new Tah(t.vychozi_pozice, t.cilova_pozice, fig, t.typ_tahu, t.figurkaBrana, t.povyseniNa);
        this.plocha.posun_figurky(replayTah);
        this.revizor_tahu.posledniTah = replayTah;
      }
      this.aktivni_hrac = this.aktivni_hrac === 0 ? 1 : 0;
    }

    this.aktualni_tah = this.historieTahu[this.historieTahu.length - 1] || null;
    this.stav_hry = this.revizor_tahu.check_Sach(this.aktivni_hrac) ? 'sach' : 'probihajici';
    this.bezi = true;
    this.vitez = null;

    this.upozorniPosluchace();
    return true;
  }

  public getMozneTahyProFigurku(figurka: Figurka): Tah[] {
    if (figurka.barva !== this.aktivni_hrac) return [];
    return this.revizor_tahu.getMozneTahy(figurka, this.plocha);
  }

  // Jednoduchý šachový bot (AI)
  public vypocitejTahBota(obtiznost: 'easy' | 'medium' | 'hard' = 'medium'): Tah | null {
    const mozneTahy = this.revizor_tahu.getVsechnyMozneTahy(this.aktivni_hrac, this.plocha);
    if (mozneTahy.length === 0) return null;

    if (obtiznost === 'easy') {
      // Náhodný tah s lehkou preferencí braní
      const berouci = mozneTahy.filter(t => !!t.figurkaBrana);
      if (berouci.length > 0 && Math.random() > 0.4) {
        return berouci[Math.floor(Math.random() * berouci.length)];
      }
      return mozneTahy[Math.floor(Math.random() * mozneTahy.length)];
    }

    // Ohodnocovací funkce figur
    let nejlepsiTah: Tah = mozneTahy[0];
    let nejlepsiSkore = -Infinity;

    for (const t of mozneTahy) {
      let skore = 0;
      if (t.figurkaBrana) {
        skore += t.figurkaBrana.hodnota * 10;
      }
      if (t.sach) skore += 2;
      if (t.mat) skore += 1000;

      // Bonus za středová pole (d4, e4, d5, e5)
      const c = t.cilova_pozice;
      if ((c.radka === 3 || c.radka === 4) && (c.sloupec === 3 || c.sloupec === 4)) {
        skore += 1.5;
      }

      // Simulace 1 krok dopředu
      const sim = this.revizor_tahu.simulate_Move(this.plocha, t);
      const protihrac = (this.aktivni_hrac === 0 ? 1 : 0) as Barva;
      const protihracTahy = this.revizor_tahu.getVsechnyMozneTahy(protihrac, sim);
      
      // Postih, pokud soupeř může hned sebrat naši figuru
      let maxOdpoved = 0;
      for (const pt of protihracTahy) {
        if (pt.cilova_pozice.radka === c.radka && pt.cilova_pozice.sloupec === c.sloupec) {
          maxOdpoved = Math.max(maxOdpoved, t.figurka.hodnota * 8);
        }
      }
      skore -= maxOdpoved;

      // Malé náhodné rozptýlení pro variabilitu hry
      skore += Math.random() * 0.5;

      if (skore > nejlepsiSkore) {
        nejlepsiSkore = skore;
        nejlepsiTah = t;
      }
    }

    return nejlepsiTah;
  }
}
