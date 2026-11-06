import React from 'react';
import { motion } from 'motion/react';
import { HerniPlocha } from '../models/HerniPlocha';
import { Tah } from '../models/Tah';
import { Barva, Pozice } from '../types/chess';
import { ChessPieceIcon } from './ChessPieceIcon';

interface BoardViewProps {
  plocha: HerniPlocha;
  aktivniHrac: Barva;
  vybranaPozice: Pozice | null;
  mozneCile: Tah[];
  posledniTah: Tah | null;
  jeVSachu: boolean;
  otocenaDeska?: boolean;
  onVyberPole: (pozice: Pozice) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  plocha,
  aktivniHrac,
  vybranaPozice,
  mozneCile,
  posledniTah,
  jeVSachu,
  otocenaDeska = false,
  onVyberPole,
}) => {
  const pismena = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const cisla = ['8', '7', '6', '5', '4', '3', '2', '1'];

  // Najít krále v šachu pro červené zvýraznění
  const kralVSachu = jeVSachu ? plocha.najdiKrale(aktivniHrac) : null;

  // Řazení řádků a sloupců podle otočení šachovnice
  const radkyIndexy = otocenaDeska ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const sloupceIndexy = otocenaDeska ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative select-none p-3 bg-stone-900 rounded-2xl shadow-2xl border border-stone-800">
      {/* Hlavní šachovnice s vnějším rámem */}
      <div className="relative grid grid-cols-8 grid-rows-8 w-full max-w-[560px] aspect-square rounded-lg overflow-hidden border-2 border-stone-700 shadow-inner bg-[#b58863]">
        {radkyIndexy.map((r) =>
          sloupceIndexy.map((c) => {
            const pozice: Pozice = { radka: r, sloupec: c };
            const figurka = plocha.vrat_obsah(pozice);
            const jeSvetle = (r + c) % 2 === 0;

            // Zda je pole vybráno
            const jeVybrano = vybranaPozice && vybranaPozice.radka === r && vybranaPozice.sloupec === c;

            // Zda je pole legálním cílem
            const legalniTah = mozneCile.find(
              (t) => t.cilova_pozice.radka === r && t.cilova_pozice.sloupec === c
            );
            const jeBrani = legalniTah && (!!legalniTah.figurkaBrana || legalniTah.typ_tahu === 'en_passant');

            // Zda bylo pole součástí posledního tahu
            const jePosledniTahZ = posledniTah && posledniTah.vychozi_pozice.radka === r && posledniTah.vychozi_pozice.sloupec === c;
            const jePosledniTahNa = posledniTah && posledniTah.cilova_pozice.radka === r && posledniTah.cilova_pozice.sloupec === c;

            // Zda je na tomto poli král v šachu
            const jeTentoKralVSachu = kralVSachu && kralVSachu.pozice.radka === r && kralVSachu.pozice.sloupec === c;

            // Barva podkladu
            let bgClass = jeSvetle ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
            if (jePosledniTahZ || jePosledniTahNa) {
              bgClass = jeSvetle ? 'bg-[#ced26b]' : 'bg-[#aaa23a]';
            }
            if (jeVybrano) {
              bgClass = 'bg-[#bbcb2b] ring-2 ring-amber-400 inset-0';
            }

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => onVyberPole(pozice)}
                className={`relative flex items-center justify-center transition-colors cursor-pointer ${bgClass}`}
                role="button"
                tabIndex={0}
                aria-label={`Pole ${pismena[c]}${cisla[r]}${figurka ? ` - ${figurka.nazev}` : ''}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onVyberPole(pozice);
                  }
                }}
              >
                {/* Popisky souřadnic na okrajích šachovnice */}
                {c === (otocenaDeska ? 7 : 0) && (
                  <span
                    className={`absolute top-1 left-1.5 text-[10px] font-bold pointer-events-none select-none ${
                      jeSvetle ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {cisla[r]}
                  </span>
                )}
                {r === (otocenaDeska ? 0 : 7) && (
                  <span
                    className={`absolute bottom-0.5 right-1.5 text-[10px] font-bold pointer-events-none select-none ${
                      jeSvetle ? 'text-[#b58863]' : 'text-[#f0d9b5]'
                    }`}
                  >
                    {pismena[c]}
                  </span>
                )}

                {/* Šachové červené pulzující varování krále */}
                {jeTentoKralVSachu && (
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="absolute inset-0 bg-red-600/40 rounded-full blur-xs"
                  />
                )}

                {/* Vykreslení figurky */}
                {figurka && (
                  <motion.div
                    layoutId={figurka.id}
                    initial={{ scale: 0.8, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="relative z-10 w-[84%] h-[84%] flex items-center justify-center"
                  >
                    <ChessPieceIcon typ={figurka.typ} barva={figurka.barva} />
                  </motion.div>
                )}

                {/* Indikátory možných legálních tahů */}
                {legalniTah && !jeBrani && (
                  <div className="absolute z-20 w-3.5 h-3.5 bg-black/20 hover:bg-black/30 rounded-full transition-transform transform hover:scale-125 pointer-events-none" />
                )}

                {legalniTah && jeBrani && (
                  <div className="absolute z-20 inset-1 rounded-full border-4 border-red-500/60 hover:border-red-500/80 transition-transform transform scale-95 pointer-events-none" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
