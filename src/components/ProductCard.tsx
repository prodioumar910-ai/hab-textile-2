import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { toggleFavorite, favorites, addToCart } = useStore();
  const isFavorite = favorites.includes(product.id);

  return (
    <motion.div
      layout
      className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 p-2 group transform-gpu"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
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
          className="w-full mt-3 py-2 bg-white text-brand-black rounded-lg font-body font-medium text-xs hover:bg-opacity-90 transition-all"
        >
          Ajouter au panier
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
