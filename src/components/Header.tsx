import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  activePage?: number;
  setActivePage?: (page: number) => void;
  isTransparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, isTransparent }) => {
  const { cart, user } = useStore();

  return (
    <header className="px-6 h-20 flex items-center justify-between z-40 relative">
      <div 
        onClick={() => setActivePage && setActivePage(0)}
        className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
      >
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

      <div className="flex items-center gap-5">
        {/* User Account Button */}
        <button
          onClick={() => setActivePage && setActivePage(2)}
          className={`flex items-center gap-1.5 p-1 rounded-full transition-all duration-200 outline-none ${
            activePage === 2 
              ? 'text-brand-orange-dark scale-105' 
              : isTransparent 
                ? 'text-white hover:text-white/80'
                : 'text-brand-black hover:text-brand-black/70'
          }`}
          aria-label="Mon compte"
        >
          {user ? (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-body font-bold hidden sm:inline-block max-w-[100px] truncate ${
                isTransparent ? 'text-white' : 'text-brand-black'
              }`}>
                {user.user_metadata?.full_name?.split(' ')[0] || 'Compte'}
              </span>
              {user.email?.toLowerCase() === 'prodioumar910@gmail.com' ? (
                <div className="w-7 h-7 rounded-full overflow-hidden border border-brand-orange-dark/50 bg-white p-0.5 shadow-sm">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma" 
                    alt="Admin Avatar" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 bg-brand-orange-dark text-white rounded-full flex items-center justify-center text-xs font-heading font-bold uppercase shadow-sm">
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U')}
                </div>
              )}
            </div>
          ) : (
            <div className={`p-1 rounded-full transition-colors ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}>
              <UserIcon className="w-5 h-5" />
            </div>
          )}
        </button>

        {/* Shopping Cart Button */}
        <div 
          onClick={() => setActivePage && setActivePage(1)} // Navigate to boutique/shop or show cart
          className={`relative cursor-pointer p-1 rounded-full transition-colors ${
            isTransparent 
              ? 'text-white hover:bg-white/10' 
              : 'text-brand-black hover:bg-black/5'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key={cart.length}
                className="absolute -top-1 -right-1 bg-brand-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white/25"
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
      </div>
    </header>
  );
};

export default Header;
