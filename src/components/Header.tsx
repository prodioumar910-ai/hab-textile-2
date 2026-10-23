import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, User as UserIcon, Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useBrandLogo } from '../constants';

interface HeaderProps {
  activePage?: number;
  setActivePage?: (page: number) => void;
  isTransparent?: boolean;
  onOpenMeasure?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, isTransparent, onOpenMeasure }) => {
  const { cart, user } = useStore();
  const brandLogo = useBrandLogo();

  return (
    <header className="w-full h-20 sm:h-24 bg-transparent flex items-center justify-between px-6 sm:px-12 z-40 relative transition-all duration-300">
      <div 
        onClick={() => setActivePage && setActivePage(0)}
        className="flex items-center gap-4 cursor-pointer active:scale-95 transition-all group h-full py-4"
        role="button"
        tabIndex={0}
      >
        <div className="h-full flex items-center py-1">
          <img 
            src={brandLogo.logo || "/logo.png"} 
            alt="Habé Textile" 
            className="h-10 sm:h-12 w-auto max-w-[140px] sm:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('logo.png')) {
                img.src = "/logo.png";
              }
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-10">
        {/* User Account Button */}
        <button
          onClick={() => setActivePage && setActivePage(2)}
          className={`flex items-center gap-2 p-1 rounded-full transition-all duration-200 outline-none ${
            activePage === 2 
              ? 'text-brand-orange-dark scale-105' 
              : 'text-brand-black hover:text-brand-black/70'
          }`}
          aria-label="Mon compte"
        >
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-body font-bold hidden sm:inline-block max-w-[100px] truncate text-brand-black uppercase tracking-wider">
                {user.user_metadata?.full_name?.split(' ')[0] || 'Compte'}
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-brand-orange-dark/50 bg-stone-950 p-0.5 shadow-sm flex items-center justify-center">
                <img 
                  src={user.user_metadata?.avatar_url || brandLogo.logoIcon || "/logo-icon.png"} 
                  alt="Avatar Habé" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('logo-icon.png')) {
                      img.src = "/logo-icon.png";
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-1 rounded-full transition-colors hover:bg-black/5 text-brand-black">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-brand-orange-dark/40 bg-stone-950/90 p-0.5 shadow-xs flex items-center justify-center">
                <img 
                  src={brandLogo.logoIcon || "/logo-icon.png"} 
                  alt="Habé" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!img.src.includes('logo-icon.png')) {
                      img.src = "/logo-icon.png";
                    }
                  }}
                />
              </div>
            </div>
          )}
        </button>

        {/* Shopping Cart Button */}
        <div 
          onClick={() => setActivePage && setActivePage(1)} // Navigate to boutique/shop or show cart
          className="relative cursor-pointer p-2 rounded-full transition-colors hover:bg-black/5 text-brand-black"
        >
          <ShoppingCart className="w-6 h-6" />
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                key={cart.length}
                className="absolute -top-0.5 -right-0.5 bg-brand-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white/25 shadow-md"
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
