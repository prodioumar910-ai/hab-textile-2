import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  isSharp?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isSharp = false }) => {
  const { toggleFavorite, favorites, addToCart } = useStore();
  const isFavorite = favorites.includes(product.id);

  return (
    <motion.div
      layout
      className="overflow-hidden group transform-gpu"
    >
      <div className={`relative aspect-[3/4] ${isSharp ? '' : 'rounded-lg'} overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 flex items-center justify-center border border-black/10`}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center select-none">
            <span className="font-heading font-extrabold text-3xl tracking-widest text-amber-500/80 group-hover:scale-115 transition-transform duration-500">
              HT
            </span>
            <span className="text-[8px] font-mono tracking-[0.25em] text-stone-400 mt-3 uppercase opacity-90">
              Habé Textile
            </span>
            <div className="w-8 h-[1px] bg-amber-500/20 mt-3" />
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="font-body font-medium text-sm text-brand-black line-clamp-1">
          {product.name}
        </h3>
        <p className="font-heading font-bold text-lg text-brand-black mt-1">
          {product.price} FCFA
        </p>
        
        <button
          onClick={() => addToCart(product)}
          className={`w-full mt-3 py-2 bg-white text-brand-black ${isSharp ? '' : 'rounded-lg'} font-body font-medium text-xs hover:bg-opacity-90 transition-all`}
        >
          Ajouter au panier
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
