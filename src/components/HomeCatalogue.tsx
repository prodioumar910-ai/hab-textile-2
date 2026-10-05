import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { Target } from '../types';

const HomeCatalogue: React.FC = () => {
  const { products } = useStore();

  const getProductsForTarget = (target: Target) => {
    return products.filter(p => p.garmentType !== 'accessoire' && p.target === target).slice(0, 8);
  };

  const hommeProducts = getProductsForTarget('Homme');
  const enfantProducts = getProductsForTarget('Enfant');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="px-4 pb-32">
      {/* Section Homme */}
      <motion.div 
        className="mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <motion.h2 
            variants={itemVariants}
            className="font-heading font-black text-xl uppercase tracking-wider text-white"
          >
            Collection Homme
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="h-px flex-1 bg-white/10 mx-4" 
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {hommeProducts.map((p) => (
            <motion.div key={p.id} variants={itemVariants}>
              <ProductCard product={p} isSharp={true} showDetails={false} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Section Enfant */}
      <motion.div 
        className="mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <motion.h2 
            variants={itemVariants}
            className="font-heading font-black text-xl uppercase tracking-wider text-white"
          >
            Collection Enfant
          </motion.h2>
          <motion.div 
            variants={itemVariants}
            className="h-px flex-1 bg-white/10 mx-4" 
          />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {enfantProducts.map((p) => (
            <motion.div key={p.id} variants={itemVariants}>
              <ProductCard product={p} isSharp={true} showDetails={false} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HomeCatalogue;
