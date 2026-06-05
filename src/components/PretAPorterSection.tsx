import React from 'react';
import { useStore } from '../context/StoreContext';
import { PretProduct } from '../types';

export const PRET_PRODUCTS: PretProduct[] = [
  {
    id: 'p1',
    name: 'Tunique Sahel Chic',
    price: 35000,
    images: [
      'https://lh3.googleusercontent.com/d/1srnqXGTTedQmK9t8N4cFtM8u0lGHw7t7',
      'https://lh3.googleusercontent.com/d/1PNaxfG-rnihS1KCSo0Jo-SC9MorD2aVq',
      'https://lh3.googleusercontent.com/d/1R8_IVuUi7fNbv-pDXriCBREDhe-IAK4z',
      'https://lh3.googleusercontent.com/d/1elb6RCTzbeeW6CVSPyRNykjF-RVgT4de'
    ],
    description: 'Une somptueuse tunique en lin Premium avec de subtiles broderies artisanales pour un look moderne.'
  },
  {
    id: 'p2',
    name: 'Robe Kaftan Divine',
    price: 45000,
    images: [
      'https://lh3.googleusercontent.com/d/1BbR26kpQ4LdImgGrAVxeCIkBEX-E8TWF',
      'https://lh3.googleusercontent.com/d/1jnoz-YiJjiXAg5ulvILf85v_pAqmRtQ4',
      'https://lh3.googleusercontent.com/d/1oMoyw-7qyg4Ih6aWFzQFuHgTIi2m-_CV',
      'https://lh3.googleusercontent.com/d/1E9-lDyyWea8NtahCjY_p49Y4kkqhwGqT'
    ],
    description: 'Robe Kaftan traditionnelle révisitée avec des finitions en brocart et un drapé élégant.'
  },
  {
    id: 'p3',
    name: 'Sénateur Moderne',
    price: 55000,
    images: [
      'https://lh3.googleusercontent.com/d/1tMzFDhuxnNgBaKHkh4pRtAKllfSxBYdF',
      'https://lh3.googleusercontent.com/d/1l0xs1ZZQpnzhTE-OKc-8sl9VTwc7h-eb',
      'https://lh3.googleusercontent.com/d/1pvgXg-TO12SBeJ-EgHkvSxFGVd3pr7ve',
      'https://lh3.googleusercontent.com/d/1mVQd0T30KsH3VJk1d2uNjpHtXGAcIV9C'
    ],
    description: 'Ensemble de style Sénateur raffiné confectionné avec le coton le plus pur.'
  },
  {
    id: 'p4',
    name: 'Ensemble Urbain Junior',
    price: 28000,
    images: [
      'https://lh3.googleusercontent.com/d/1gicja5relC7Qa-SvwbTnmmKd8Ef3Z0Eo',
      'https://lh3.googleusercontent.com/d/1cxOd2dOGBbAG9cryAC5-UUDQFm0S2_x1',
      'https://lh3.googleusercontent.com/d/1c1UVTCsiflQFhYw6EgC_kdmsEyJfcw-y',
      'https://lh3.googleusercontent.com/d/1sXCLy4i4xgDykTNp1LkIK9DdnqSZt0sE'
    ],
    description: 'Somptueux ensemble pour enfant confortable et ultra stylé, mariant parfaitement nos traditions.'
  },
  {
    id: 'p5',
    name: 'Kaftan Citadin Pur',
    price: 48000,
    images: [
      'https://lh3.googleusercontent.com/d/1vS0ddy64oCSnvggkJs-kpzsJjxLrAf7I',
      'https://lh3.googleusercontent.com/d/1A9YMMSAigfMZFWjpufkWOSFDgaYKrK3a',
      'https://lh3.googleusercontent.com/d/1aKlS5fXkvaIXJ2uVjBp9m33A9mAvaDu9',
      'https://lh3.googleusercontent.com/d/11a8rfgbPLBLKsgAj1U1tdmqEcmuGfg0E'
    ],
    description: 'Un kaftan fluide d’une élégance rare et ajusté parfaitement pour toutes vos cérémonies.'
  }
];

const PretAPorterSection: React.FC = () => {
  const { setIsPretAPorterOpen, setSelectedPretProduct } = useStore();

  const handleProductClick = (product: PretProduct) => {
    setSelectedPretProduct(product);
    setIsPretAPorterOpen(true);
  };

  return (
    <div className="w-full">
      {/* Main horizontal scrolling section on the homepage */}
      <section className="px-5 py-8 bg-transparent">
        <h2 className="text-base font-heading font-black text-white uppercase tracking-widest mb-4 px-1">
          Vos Prêt-à-porter
        </h2>
        
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x snap-mandatory">
          {PRET_PRODUCTS.map((prod) => (
            <div 
              key={prod.id} 
              className="flex-shrink-0 w-[58vw] sm:w-[48vw] md:w-[36vw] lg:w-[24vw] max-w-[230px] snap-start cursor-pointer group"
              onClick={() => handleProductClick(prod)}
            >
              <div className="relative aspect-[9/16] h-auto w-full rounded-2xl overflow-hidden mb-2 border border-white/5 shadow-md">
                <img 
                  src={prod.images[0]} 
                  alt={prod.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-2 text-center md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] text-white font-mono tracking-wider uppercase font-bold">
                    Détails
                  </span>
                </div>
              </div>
              <h3 className="text-[11px] font-heading font-bold text-white/90 truncate px-1">
                {prod.name}
              </h3>
              <p className="text-[11px] font-body font-extrabold text-brand-orange-light px-1 mt-0.5">
                {prod.price.toLocaleString()} F CFA
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PretAPorterSection;
