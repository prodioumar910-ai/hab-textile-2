import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, ShoppingBag } from 'lucide-react';
import { PRET_PRODUCTS } from './PretAPorterSection';
import { PretProduct } from '../types';

export const PretAPorterModal: React.FC = () => {
  const { isPretAPorterOpen, setIsPretAPorterOpen, selectedPretProduct, setSelectedPretProduct, addToCart } = useStore();
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset carousel index and scroll to top when product changes
  useEffect(() => {
    if (selectedPretProduct) {
      setCarouselIndex(0);
      setIsAdded(false);
      
      // Lock body scroll and scroll window
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
      
      // Scroll the modal container back to top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedPretProduct]);

  if (!isPretAPorterOpen || !selectedPretProduct) return null;

  const handleClose = () => {
    setIsPretAPorterOpen(false);
    setSelectedPretProduct(null);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex((prev) => (prev + 1) % selectedPretProduct.images.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCarouselIndex((prev) => (prev - 1 + selectedPretProduct.images.length) % selectedPretProduct.images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Convert to regular Product schema for cart compatibility
    const tempProduct = {
      id: selectedPretProduct.id,
      name: selectedPretProduct.name,
      price: selectedPretProduct.price,
      image: selectedPretProduct.images[0],
      category: 'Classique' as const,
      target: 'Homme' as const,
      garmentType: 'boubou' as const,
      fabricType: 'coton' as const,
      description: selectedPretProduct.description
    };
    addToCart(tempProduct);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const otherProducts = PRET_PRODUCTS.filter(p => p.id !== selectedPretProduct.id);

  const switchProduct = (prod: PretProduct) => {
    setSelectedPretProduct(prod);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={scrollContainerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-start overflow-y-auto"
      >
        {/* Main scrollable content container */}
        <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center relative min-h-screen pb-24">
          
          {/* Header */}
          <div className="w-full flex items-center justify-between mb-4 mt-2 px-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
              Vue Produit / Prêt-à-porter
            </span>
            <button
              onClick={handleClose}
              className="p-2.5 rounded-full bg-white text-brand-black hover:bg-brand-orange-light hover:text-white transition-all shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Carousel */}
          <div className="relative max-w-full flex items-center justify-center">
            {/* Nav Arrows */}
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

            {/* Slides */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center bg-black/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={carouselIndex}
                  src={selectedPretProduct.images[carouselIndex]}
                  alt={`${selectedPretProduct.name} - Vue ${carouselIndex + 1}`}
                  className="w-auto h-auto max-w-[85vw] max-h-[64vh] object-contain rounded-3xl"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
              {selectedPretProduct.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    carouselIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                  aria-label={`Aller à l'image ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full text-center mt-5 px-1">
            <h3 className="text-lg font-heading font-black text-white leading-tight uppercase tracking-wide">
              {selectedPretProduct.name}
            </h3>
            <p className="text-lg font-body font-black text-brand-orange-light mt-1">
              {selectedPretProduct.price.toLocaleString()} F CFA
            </p>
            <p className="text-xs text-white/60 font-body leading-relaxed mt-2 max-w-xs mx-auto text-center">
              {selectedPretProduct.description}
            </p>

            {/* Cart Button */}
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

          {/* Recommendations / Other Models */}
          <div className="w-full mt-8 pt-6 border-t border-white/5">
            <h4 className="text-[11px] font-heading font-black text-white/55 uppercase tracking-widest mb-4 px-1 text-left">
              Découvrir les autres modèles
            </h4>

            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x snap-mandatory text-left">
              {otherProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="flex-shrink-0 w-[48vw] sm:w-[38vw] max-w-[190px] snap-start cursor-pointer group"
                  onClick={() => switchProduct(prod)}
                >
                  <div className="relative aspect-[9/16] h-auto w-full rounded-xl overflow-hidden mb-2 border border-white/5 shadow-md bg-stone-900">
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
    </AnimatePresence>
  );
};
