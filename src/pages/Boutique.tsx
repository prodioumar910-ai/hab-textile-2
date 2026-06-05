import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Category } from '../types';
import { TransparentIcon } from '../components/TransparentIcon';

const categories: { name: Category; src?: string; icon: string; directImg?: boolean }[] = [
  { name: 'Accessoires', src: '/accessories_raw.jpg', icon: '⌚' },
  { name: 'Chaussures', src: '/shoes_raw.jpg', icon: '👟' },
  { name: 'Ensemble Royal', src: '/royal_raw.jpg', icon: '👑' },
  { name: 'Tendance', icon: '🔥' },
  { name: 'Classique', icon: '👔' },
  { name: 'Chapeau', icon: '🎩' },
  { name: 'Parfum', src: '/parfum_raw.jpg', icon: '🧴' },
];

const Boutique: React.FC = () => {
  const { activeCategory, setActiveCategory, products } = useStore();

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category === activeCategory && p.target !== 'Enfant')
    : products.filter(p => p.garmentType === 'accessoire' && p.target !== 'Enfant');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 pb-32"
    >
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <h2 className="font-heading font-bold text-center text-2xl mb-8 text-brand-black">
          Voir nos catégories
        </h2>

        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-6 px-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`flex-shrink-0 flex flex-col items-center justify-between w-[100px] h-[110px] py-2 transition-all duration-300 select-none ${
                activeCategory === cat.name 
                  ? 'scale-110 opacity-100' 
                  : 'opacity-50 hover:opacity-90 hover:scale-105'
              }`}
            >
              <div className="flex-1 flex items-center justify-center w-full min-h-[55px]">
                {cat.src ? (
                  cat.directImg ? (
                    <img
                      src={cat.src}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-full select-none shadow-md border-2 border-brand-black/10 transition-transform duration-300"
                    />
                  ) : (
                    <TransparentIcon
                      src={cat.src}
                      alt={cat.name}
                      fallbackIcon={<span className="text-4xl">{cat.icon}</span>}
                      className="w-20 h-20 object-contain drop-shadow-md select-none transition-transform duration-300"
                    />
                  )
                ) : (
                  <span className="text-[48px] select-none leading-none drop-shadow-sm transition-transform duration-300">
                    {cat.icon}
                  </span>
                )}
              </div>
              <span className="text-[13px] font-body font-black text-center leading-tight tracking-tight uppercase text-brand-black mt-2 select-none transition-all">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <AnimatePresence mode="wait">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <ProductCard product={p} showDetails={false} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Boutique;
