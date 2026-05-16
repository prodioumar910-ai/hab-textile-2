import React from 'react';
import { motion } from 'motion/react';

const TRENDING_ITEMS = [
  { id: 't1', name: 'Boubou Grand Royal', image: 'https://images.unsplash.com/photo-1583267746897-2cf415888172?q=80&w=600&auto=format&fit=crop' },
  { id: 't2', name: 'Ensemble Wax Prestige', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop' },
  { id: 't3', name: 'Chemise Bazin Elite', image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop' },
  { id: 't4', name: 'Pantalon Coton Premium', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop' },
  { id: 't5', name: 'Robe Africaine Moderne', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop' },
  { id: 't6', name: 'Costume Traditionnel', image: 'https://images.unsplash.com/photo-1621335829175-95f437384d7c?q=80&w=600&auto=format&fit=crop' },
];

const TrendingSection: React.FC = () => {
  return (
    <section className="py-12 bg-white/5">
      <div className="px-6 mb-8">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-xl uppercase tracking-wider text-brand-black/90"
        >
          Tendance du moment
        </motion.h2>
      </div>
      
      <div className="flex overflow-x-auto gap-6 px-6 pb-6 no-scrollbar snap-x snap-mandatory">
        {TRENDING_ITEMS.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-60 snap-start"
          >
            <div className="aspect-[2/3] overflow-hidden mb-4 shadow-lg rounded-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-xs font-body font-bold text-brand-black uppercase tracking-tight text-center truncate px-2 opacity-80">
              {product.name}
            </h3>
          </motion.div>
        ))}
        {/* Spacer at the end for padding-right equivalent in scroll */}
        <div className="flex-shrink-0 w-4" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default TrendingSection;
