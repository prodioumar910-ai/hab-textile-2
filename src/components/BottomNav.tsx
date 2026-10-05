import React from 'react';
import { motion } from 'motion/react';
import { Home, ShoppingBag, User, Info, Camera } from 'lucide-react';

interface BottomNavProps {
  activePage: number;
  setActivePage: (index: number) => void;
  onOpenMeasure?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage, onOpenMeasure }) => {
  const navItems = [
    { icon: Home, label: 'Accueil', index: 0 },
    { icon: ShoppingBag, label: 'Boutique', index: 1 },
    { icon: Camera, label: 'Mesures IA', onClick: onOpenMeasure, isSpecial: true },
    { icon: Info, label: 'À propos', index: 3 },
    { icon: User, label: 'Profil', index: 2 },
  ];

  return (
    <div className="fixed bottom-[14px] sm:bottom-[18px] left-1/2 -translate-x-1/2 z-[9999] select-none font-sans">
      {/* Glass Background Bar */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 px-4 py-2 bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
        {navItems.map((item, idx) => {
          const isActive = !item.isSpecial && activePage === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.index ?? `special-${idx}`}
              onClick={item.onClick ? item.onClick : () => setActivePage(item.index!)}
              className="flex flex-col items-center justify-center cursor-pointer group focus:outline-none w-[50px] sm:w-[58px]"
            >
              {/* Circular Button Wrapper */}
              <div className={`w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isActive || item.isSpecial
                  ? isActive 
                    ? 'bg-[#F97316] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)] scale-105'
                    : 'bg-brand-orange-dark text-white shadow-lg scale-110'
                  : 'text-stone-600 hover:text-brand-black hover:bg-black/5'
              }`}>
                {/* Highlight Overlay for active */}
                {(isActive || item.isSpecial) && (
                  <div className="absolute inset-[1px] rounded-full bg-gradient-to-tr from-white/0 via-white/5 to-white/30 pointer-events-none" />
                )}
                
                <Icon
                  className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-300 ${
                    isActive || item.isSpecial ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[8px] sm:text-[9px] font-semibold mt-1 tracking-wide select-none transition-all duration-300 ${
                  isActive || item.isSpecial 
                    ? isActive 
                      ? 'text-[#F97316] font-bold opacity-100'
                      : 'text-brand-orange-dark font-black opacity-100'
                    : 'text-stone-600 opacity-80 group-hover:opacity-100 group-hover:text-brand-black'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
