/**
 * Třída GameManagerController reprezentující Controller v MVC architektuře
 * Zpracovává události od uživatele (kliknutí, tahy, volba času, bot) a manipuluje s Modelem
 */
import { GameManager } from '../models/GameManager';
import { Tah } from '../models/Tah';
import { Barva, Pozice, TypFigurky } from '../types/chess';
import { sounds } from '../utils/sound';

export class GameManagerController {
  public game_manager: GameManager;
  public vybranaPozice: Pozice | null = null;
  public mozneCile: Tah[] = [];
  public cekajiciPovyseniTah: Tah | null = null;
  public botPremysli: boolean = false;

  private onStateChangeCallbacks: Array<() => void> = [];

  constructor(gameManager?: GameManager) {
    this.game_manager = gameManager || new GameManager();
    this.game_manager.pridejPosluchace(() => {
      this.upozorniZmenu();
    });
  }

  public subscribe(cb: () => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  private upozorniZmenu(): void {
    for (const cb of this.onStateChangeCallbacks) {
      cb();
    }
  }

  public start_game(vsBot: boolean = false, obtiznost: 'easy' | 'medium' | 'hard' = 'medium'): void {
    this.vybranaPozice = null;
    this.mozneCile = [];
    this.cekajiciPovyseniTah = null;
    this.botPremysli = false;
    this.game_manager.startHry(vsBot, obtiznost);
    sounds.playMove();
  }

  /**
   * Klíčová metoda pro obsluhu kliknutí uživatele na pole šachovnice (v souladu s vyber_pole v Pythonu)
   */
  public vyber_pole(souradnice: Pozice): void {
    if (!this.game_manager.bezi || this.botPremysli) {
      return;
    }

    const kliknutaFigurka = this.game_manager.plocha.vrat_obsah(souradnice);

    // Pokud ještě není vybrána žádná figurka
    if (!this.vybranaPozice) {
      if (kliknutaFigurka && kliknutaFigurka.barva === this.game_manager.aktivni_hrac) {
        this.vybranaPozice = { ...souradnice };
        this.mozneCile = this.game_manager.getMozneTahyProFigurku(kliknutaFigurka);
        this.upozorniZmenu();
      }
      return;
    }

    // Pokud uživatel kliknul na své vlastní pole znovu -> změna výběru
    if (kliknutaFigurka && kliknutaFigurka.barva === this.game_manager.aktivni_hrac) {
      if (souradnice.radka === this.vybranaPozice.radka && souradnice.sloupec === this.vybranaPozice.sloupec) {
        // Kliknul na stejnou figuru -> zrušit výběr
        this.vybranaPozice = null;
        this.mozneCile = [];
      } else {
        // Změna výběru na jinou vlastní figuru
        this.vybranaPozice = { ...souradnice };
        this.mozneCile = this.game_manager.getMozneTahyProFigurku(kliknutaFigurka);
      }
      this.upozorniZmenu();
      return;
    }

    // Uživatel kliknul na cílové pole pro přesun
    const vybranyTah = this.mozneCile.find(t => 
      t.cilova_pozice.radka === souradnice.radka && 
      t.cilova_pozice.sloupec === souradnice.sloupec
    );

    if (vybranyTah) {
      // Kontrola, zda tah vyžaduje dialog výběru povýšení pěšce
      if (vybranyTah.typ_tahu === 'povyseni' && !vybranyTah.povyseniNa) {
        this.cekajiciPovyseniTah = vybranyTah;
        this.upozorniZmenu();
        return;
      }

      this.vykonejTah(vybranyTah);
    } else {
      // Neplatné pole -> zrušit výběr
      this.vybranaPozice = null;
      this.mozneCile = [];
      this.upozorniZmenu();
    }
  }

  public potvrdPovyseni(typ: TypFigurky): void {
    if (!this.cekajiciPovyseniTah) return;

    const tah = new Tah(
      this.cekajiciPovyseniTah.vychozi_pozice,
      this.cekajiciPovyseniTah.cilova_pozice,
      this.cekajiciPovyseniTah.figurka,
      'povyseni',
      this.cekajiciPovyseniTah.figurkaBrana,
      typ
    );

    this.cekajiciPovyseniTah = null;
    this.vykonejTah(tah);
  }

  public zrusPovyseni(): void {
    this.cekajiciPovyseniTah = null;
    this.vybranaPozice = null;
    this.mozneCile = [];
    this.upozorniZmenu();
  }

  private vykonejTah(tah: Tah): void {
    const bylSach = tah.sach;
    const byloBrani = !!tah.figurkaBrana;

    const uspech = this.game_manager.proved_tah(tah);
    if (uspech) {
      // Zvuková odezva
      if (tah.mat) {
        sounds.playVictory();
      } else if (tah.sach || bylSach) {
        sounds.playCheck();
      } else if (byloBrani) {
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      this.vybranaPozice = null;
      this.mozneCile = [];
      this.upozorniZmenu();

      // Pokud je na tahu Bot, naplánovat jeho tah s realistickou prodlevou
      this.zkontrolujTahBota();
    }
  }

  private zkontrolujTahBota(): void {
    const aktivniHracObj = this.game_manager.hraci[this.game_manager.aktivni_hrac];
    if (this.game_manager.bezi && aktivniHracObj && aktivniHracObj.isBot) {
      this.botPremysli = true;
      this.upozorniZmenu();

      setTimeout(() => {
        if (!this.game_manager.bezi) {
          this.botPremysli = false;
          this.upozorniZmenu();
          return;
        }

        const botTah = this.game_manager.vypocitejTahBota(aktivniHracObj.botDifficulty || 'medium');
        this.botPremysli = false;

        if (botTah) {
          this.vykonejTah(botTah);
        } else {
          this.upozorniZmenu();
        }
      }, 500);
    }
  }

  public vratZpet(): void {
    this.vybranaPozice = null;
    this.mozneCile = [];
    this.cekajiciPovyseniTah = null;
    this.game_manager.vratZpet();
    sounds.playMove();
    this.upozorniZmenu();
  }

  public vzdatSe(barva: Barva): void {
    this.game_manager.vzdatSe(barva);
    sounds.playVictory();
    this.upozorniZmenu();
  }

  public nabidnoutRemizu(): void {
    this.game_manager.nabidnoutRemizu();
    this.upozorniZmenu();
  }

  public tikCasovace(): void {
    if (!this.game_manager.bezi) return;

    this.game_manager.casovac.tik((prohravajiciHrac) => {
      const vitez: Barva = prohravajiciHrac === 0 ? 1 : 0;
      this.game_manager.konecHry('vyprsel_cas', vitez);
      sounds.playVictory();
    });
    this.upozorniZmenu();
  }

  public nastavCas(minuty: number, inkrement: number): void {
    this.game_manager.casovac.nastavCas(minuty, inkrement);
    this.upozorniZmenu();
  }
}
