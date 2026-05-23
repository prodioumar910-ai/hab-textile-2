import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { GarmentType, FabricType } from '../types';

const HomeCatalogue: React.FC = () => {
  const { activeTarget, setActiveTarget, filters, setFilters, products } = useStore();
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = products.filter(p => {
    const isClothing = p.garmentType !== 'accessoire';
    const matchTarget = p.target === activeTarget;
    const matchGarment = filters.garmentType ? p.garmentType === filters.garmentType : true;
    const matchFabric = filters.fabricType ? p.fabricType === filters.fabricType : true;
    return isClothing && matchTarget && matchGarment && matchFabric;
  });

  const garmentTypes: GarmentType[] = ['chemise', 'pantalon', 'boubou'];
  const fabricTypes: FabricType[] = ['wax', 'bazin', 'coton', 'soie'];

  return (
    <div className="px-4 pb-32">
      <div className="flex items-center justify-between mb-8 px-2">
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
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 grid grid-cols-2 gap-4">
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
        layout
        className="grid grid-cols-2 gap-3"
      >
        <AnimatePresence mode="wait">
          {filteredProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard product={p} isSharp={true} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center text-white/60 font-body">
          Aucun produit trouvé avec ces filtres.
        </div>
      )}
    </div>
  );
};

export default HomeCatalogue;
