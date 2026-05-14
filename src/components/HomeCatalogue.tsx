import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useStore, MOCK_PRODUCTS } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { GarmentType, FabricType } from '../types';

const HomeCatalogue: React.FC = () => {
  const { activeTarget, setActiveTarget, filters, setFilters } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const matchTarget = p.target === activeTarget;
    const matchGarment = filters.garmentType ? p.garmentType === filters.garmentType : true;
    const matchFabric = filters.fabricType ? p.fabricType === filters.fabricType : true;
    return matchTarget && matchGarment && matchFabric;
  });

  const garmentTypes: GarmentType[] = ['chemise', 'pantalon', 'boubou', 'accessoire'];
  const fabricTypes: FabricType[] = ['wax', 'bazin', 'coton', 'soie'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="px-6 pb-32"
    >
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex gap-4">
          {(['Homme', 'Enfant'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTarget(t)}
              className={`px-5 py-2 rounded-full font-heading font-bold text-sm transition-all ${
                activeTarget === t ? 'bg-white text-brand-black' : 'bg-white/20 text-white/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-all"
        >
          <Filter className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Filtre</span>
        </button>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-white/60 mb-2">Vêtement</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, garmentType: null })}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${!filters.garmentType ? 'bg-white text-brand-black' : 'bg-white/10 text-white'}`}
                  >
                    Tous
                  </button>
                  {garmentTypes.map(gt => (
                    <button
                      key={gt}
                      onClick={() => setFilters({ ...filters, garmentType: gt })}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${filters.garmentType === gt ? 'bg-white text-brand-black' : 'bg-white/10 text-white'}`}
                    >
                      {gt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-white/60 mb-2">Tissu</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, fabricType: null })}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${!filters.fabricType ? 'bg-white text-brand-black' : 'bg-white/10 text-white'}`}
                  >
                    Tous
                  </button>
                  {fabricTypes.map(ft => (
                    <button
                      key={ft}
                      onClick={() => setFilters({ ...filters, fabricType: ft })}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${filters.fabricType === ft ? 'bg-white text-brand-black' : 'bg-white/10 text-white'}`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center text-white/60 font-body">
          Aucun produit trouvé avec ces filtres.
        </div>
      )}
    </motion.div>
  );
};

export default HomeCatalogue;
