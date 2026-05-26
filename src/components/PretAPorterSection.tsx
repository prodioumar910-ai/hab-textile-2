import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ShoppingBag } from 'lucide-react';

interface PretProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
}

const PRET_PRODUCTS: PretProduct[] = [
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
  const { isPretAPorterOpen, setIsPretAPorterOpen, addToCart } = useStore();
  const [activeProduct, setActiveProduct] = useState<PretProduct | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);

  const handleProductClick = (product: PretProduct) => {
    setActiveProduct(product);
    setCarouselIndex(0);
    setIsPretAPorterOpen(true);
    setIsAdded(false);
  };

  const handleClose = () => {
    setIsPretAPorterOpen(false);
    setActiveProduct(null);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProduct) {
      setCarouselIndex((prev) => (prev + 1) % activeProduct.images.length);
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProduct) {
      setCarouselIndex((prev) => (prev - 1 + activeProduct.images.length) % activeProduct.images.length);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeProduct) {
      // Create a temporary Product object that matches standard category/types to add to cart
      const tempProduct = {
        id: activeProduct.id,
        name: activeProduct.name,
        price: activeProduct.price,
        image: activeProduct.images[0],
        category: 'Classique' as const,
        target: 'Homme' as const,
        garmentType: 'boubou' as const,
        fabricType: 'coton' as const,
        description: activeProduct.description
      };
      addToCart(tempProduct);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const otherProducts = activeProduct 
    ? PRET_PRODUCTS.filter(p => p.id !== activeProduct.id) 
    : PRET_PRODUCTS;

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
              <div className="relative aspect-[3/4] h-auto w-full rounded-2xl overflow-hidden mb-2 border border-white/5 shadow-md">
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

      {/* Dynamic Detail Overlay Modal view */}
      <AnimatePresence>
        {isPretAPorterOpen && activeProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-2xl flex flex-col items-center justify-start overflow-y-auto"
          >
            {/* Main scrollable wrapper */}
            <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center relative min-h-screen pb-24">
              
              {/* Header inside Modal with navigation back instruction and X button next to it */}
              <div className="w-full flex items-center justify-between mb-4 mt-2 px-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
                  Vue Produit / Prêt-à-porter
                </span>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full bg-white text-brand-black hover:bg-brand-orange-light hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* 4-Image Premium Manual Carousel - wrapping the image snugly */}
              <div className="relative max-w-full flex items-center justify-center">
                {/* Manual Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-brand-orange-light text-white transition-all active:scale-90 flex items-center justify-center cursor-pointer border border-white/10"
                  title="Photo précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 hover:bg-brand-orange-light text-white transition-all active:scale-90 flex items-center justify-center cursor-pointer border border-white/10"
                  title="Photo suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Slides mapping - with border and shadow tightly adhering to the image */}
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-black/10">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={carouselIndex}
                      src={activeProduct.images[carouselIndex]}
                      alt={`${activeProduct.name} - Vue ${carouselIndex + 1}`}
                      className="w-auto h-auto max-w-[85vw] max-h-[64vh] object-contain rounded-3xl"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      referrerPolicy="no-referrer"
                    />
                  </AnimatePresence>
                </div>

                {/* Counter index dot bubbles */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {activeProduct.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        carouselIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Product Info description sheet below the carousel */}
              <div className="w-full text-center mt-5 px-1">
                <h3 className="text-lg font-heading font-black text-white leading-tight uppercase tracking-wide">
                  {activeProduct.name}
                </h3>
                <p className="text-lg font-body font-black text-brand-orange-light mt-1">
                  {activeProduct.price.toLocaleString()} F CFA
                </p>
                <p className="text-xs text-white/60 font-body leading-relaxed mt-2 max-w-xs mx-auto">
                  {activeProduct.description}
                </p>

                {/* Action button: add to cart */}
                <button
                  onClick={handleAddToCart}
                  className={`mt-4 px-6 py-2.5 rounded-full text-xs font-heading font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mx-auto ${
                    isAdded 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-white text-black hover:bg-brand-orange-light hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {isAdded ? 'Ajouté au panier !' : 'Ajouter au panier'}
                </button>
              </div>

              {/* Bottom Carousel List of other Prêt-à-porter items */}
              <div className="w-full mt-8 pt-6 border-t border-white/5">
                <h4 className="text-[11px] font-heading font-black text-white/55 uppercase tracking-widest mb-4 px-1 text-left">
                  Découvrir les autres modèles
                </h4>

                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x snap-mandatory text-left">
                  {otherProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className="flex-shrink-0 w-[48vw] sm:w-[38vw] max-w-[190px] snap-start cursor-pointer group"
                      onClick={() => handleProductClick(prod)}
                    >
                      <div className="relative aspect-[3/4] h-auto w-full rounded-xl overflow-hidden mb-2 border border-white/5 shadow-md">
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h3 className="text-[10px] font-heading font-bold text-white/80 truncate px-1">
                        {prod.name}
                      </h3>
                      <p className="text-[10px] font-body font-bold text-brand-orange-light px-1 mt-0.5">
                        {prod.price.toLocaleString()} F CFA
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PretAPorterSection;
