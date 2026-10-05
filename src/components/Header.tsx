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
        <div className="h-full flex items-center justify-center">
          {/* Logo with a small outline background for visibility */}
          <div className="h-14 sm:h-18 px-3 py-1 bg-white rounded-xl shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center min-w-[120px]">
            <img 
              src={brandLogo.logoWide || brandLogo.logo || "/logo.png"} 
              alt="Habé" 
              className="h-full w-auto max-w-[160px] sm:max-w-[280px] object-contain transition-opacity duration-300"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.includes('logo-icon')) {
                  img.src = "/logo-icon.png";
                }
              }}
            />
          </div>
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
              {user.email?.toLowerCase() === 'prodioumar910@gmail.com' ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-orange-dark/60 bg-stone-950 p-0.5 shadow-sm flex items-center justify-center">
                  <img 
                    src={brandLogo.logoIcon} 
                    alt="Admin Avatar" 
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-brand-orange-dark text-white rounded-full flex items-center justify-center text-[11px] font-heading font-bold uppercase shadow-sm">
                  {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U')}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 rounded-full transition-colors hover:bg-black/5 text-brand-black">
              <UserIcon className="w-6 h-6" />
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
