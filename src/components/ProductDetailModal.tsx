import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImage } from '../utils/image';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, toggleFavorite, favorites } = useStore();
  const [selectedImg, setSelectedImg] = useState('');

  // Update selected thumbnail image when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImg(selectedProduct.image || '');
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const isFavorite = favorites.includes(selectedProduct.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] bg-brand-black/98 overflow-y-auto text-white select-none">
        {/* Extremely visible and well-positioned Close Button */}
        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="fixed top-6 right-6 z-[100002] p-3 rounded-full bg-white text-brand-black hover:bg-brand-orange-light hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center cursor-pointer"
          title="Fermer"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Container */}
        <div className="min-h-screen flex items-center justify-center p-4 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-4xl bg-stone-900/60 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: Images */}
            <div className="flex flex-col gap-4">
              <div className="aspect-[3/4] rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-white/5 relative">
                {selectedImg ? (
                  <img
                    src={getOptimizedImage(selectedImg, 600)}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center font-mono text-xs text-stone-500">
                    Aucun visuel disponible
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery if image2 or image3 is set */}
              {(selectedProduct.image2 || selectedProduct.image3) && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setSelectedImg(selectedProduct.image)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      selectedImg === selectedProduct.image ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={getOptimizedImage(selectedProduct.image, 150)} alt="image 1" className="w-full h-full object-cover pointer-events-none" />
                  </button>
                  {selectedProduct.image2 && (
                    <button
                      onClick={() => setSelectedImg(selectedProduct.image2!)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImg === selectedProduct.image2 ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={getOptimizedImage(selectedProduct.image2, 150)} alt="image 2" className="w-full h-full object-cover pointer-events-none" />
                    </button>
                  )}
                  {selectedProduct.image3 && (
                    <button
                      onClick={() => setSelectedImg(selectedProduct.image3!)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImg === selectedProduct.image3 ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={getOptimizedImage(selectedProduct.image3, 150)} alt="image 3" className="w-full h-full object-cover pointer-events-none" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Information */}
            <div className="flex flex-col justify-between text-left h-full">
              <div className="space-y-6">
                <div>
                  {/* Meta Tags */}
                  <span className="text-[10px] uppercase font-bold text-brand-orange-light tracking-[0.25em] block mb-2">
                    {selectedProduct.category} • {selectedProduct.target}
                  </span>
                  <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-white uppercase">
                    {selectedProduct.name}
                  </h2>
                  <div className="w-12 h-[2px] bg-brand-orange-light mt-3" />
                </div>

                {/* Price Block */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Prix unitaire</span>
                  <span className="font-heading font-black text-2xl text-white">
                    {selectedProduct.price} FCFA
                  </span>
                </div>

                {/* Badges / Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-stone-500 block tracking-widest mb-1">Tissu</span>
                    <span className="text-xs font-semibold uppercase font-heading text-stone-200">
                      {selectedProduct.fabricType || 'Coton'}
                    </span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase font-bold text-stone-500 block tracking-widest mb-1">Type</span>
                    <span className="text-xs font-semibold uppercase font-heading text-stone-200">
                      {selectedProduct.garmentType || 'Vêtement'}
                    </span>
                  </div>
                </div>

                {/* Premium Description */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block">Description du modèle</span>
                  <p className="text-xs font-body font-normal text-stone-300 leading-relaxed">
                    Cette superbe pièce de haute couture signée par la maison <strong className="text-brand-orange-light font-bold">Habé Textile</strong> est le symbole suprême de raffinement et d'authenticité. Conçue avec des finitions d'excellence à la main, elle assure une silhouette majestueuse et un confort haut de gamme pour toutes vos grandes occasions.
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="w-full py-4 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white font-heading font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-orange-dark/20 hover:scale-[1.01] transition-all active:scale-95"
                >
                  Ajouter au Panier • {selectedProduct.price} FCFA
                </button>
                
                <button
                  onClick={() => toggleFavorite(selectedProduct.id)}
                  className={`w-full py-3.5 rounded-xl border ${
                    isFavorite 
                      ? 'border-red-500 text-red-500 bg-red-500/10' 
                      : 'border-white/20 text-white hover:bg-white/5'
                  } font-body font-bold text-xs flex items-center justify-center gap-2 transition-all`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Retirer des Favoris' : 'Ajouter aux Favoris'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
