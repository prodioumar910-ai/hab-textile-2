import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import { Category } from '../types';

const categories: { name: Category; icon: string }[] = [
  { name: 'Accessoires', icon: '⌚' },
  { name: 'Chaussures', icon: '👟' },
  { name: 'Ensemble Royal', icon: '👑' },
  { name: 'Tendance', icon: '🔥' },
  { name: 'Classique', icon: '👔' },
  { name: 'Chapeau', icon: '🎩' },
  { name: 'Parfum', icon: '🧴' },
];

const Boutique: React.FC = () => {
  const { activeCategory, setActiveCategory, products } = useStore();

  const filteredProducts = activeCategory 
    ? products.filter(p => p.category === activeCategory)
    : products.filter(p => p.garmentType === 'accessoire');

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-4 pt-4 pb-32"
    >
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <h2 className="font-heading font-bold text-center text-2xl mb-8 text-brand-black">
          Voir nos catégories
        </h2>

        <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-6 px-6">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 p-3 rounded-2xl transition-all duration-300 border-2 ${
                activeCategory === cat.name 
                  ? 'bg-white border-brand-black shadow-lg scale-105' 
                  : 'bg-white/20 border-transparent shadow-sm'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-[9px] font-body font-bold text-center leading-tight">
                {cat.name}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-2 gap-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Boutique;
