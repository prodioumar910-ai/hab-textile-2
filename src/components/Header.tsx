import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const Header: React.FC = () => {
  const { cart } = useStore();

  return (
    <header className="px-6 h-20 flex items-center justify-between z-40 relative">
      <div className="flex items-center gap-2">
        <img 
          src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma" 
          alt="Habé Textile Logo" 
          className="h-10 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <span className="font-heading font-bold text-xl text-brand-black sr-only">
          Habé Textile
        </span>
      </div>

      <div className="relative cursor-pointer">
        <ShoppingCart className="w-6 h-6 text-brand-black" />
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              key={cart.length}
              className="absolute -top-2 -right-2 bg-brand-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
            >
              <motion.span
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.3 }}
              >
                {cart.length}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
