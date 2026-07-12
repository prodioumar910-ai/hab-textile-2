import React from 'react';
import { motion } from 'motion/react';
import { Home, ShoppingBag, User, Info } from 'lucide-react';

interface BottomNavProps {
  activePage: number;
  setActivePage: (index: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { icon: Home, label: 'Accueil', index: 0 },
    { icon: ShoppingBag, label: 'Boutique', index: 1 },
    { icon: Info, label: 'À propos', index: 3 },
    { icon: User, label: 'Profil', index: 2 },
  ];

  return (
    <div className="fixed bottom-[14px] sm:bottom-[18px] left-1/2 -translate-x-1/2 z-[9999] select-none font-sans">
      {/* Centered Transparent Bar with Packed Icons */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 px-3 py-2 bg-transparent">
        {navItems.map((item) => {
          const isActive = activePage === item.index;
          const Icon = item.icon;

          return (
            <button
              key={item.index}
              onClick={() => setActivePage(item.index)}
              className="flex flex-col items-center justify-center cursor-pointer group focus:outline-none w-[50px] sm:w-[58px]"
            >
              {/* Circular Button Wrapper */}
              <div className={`w-[36px] h-[36px] sm:w-[42px] sm:h-[42px] rounded-full flex items-center justify-center relative transition-all duration-300 ${
                isActive
                  ? 'bg-[#F97316] text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)] scale-105'
                  : 'text-stone-400 hover:text-white hover:bg-white/10'
              }`}>
                {/* Highlight Overlay for active */}
                {isActive && (
                  <div className="absolute inset-[1px] rounded-full bg-gradient-to-tr from-white/0 via-white/5 to-white/30 pointer-events-none" />
                )}
                
                <Icon
                  className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[9px] sm:text-[10px] font-semibold mt-1 tracking-wide select-none transition-all duration-300 ${
                  isActive ? 'text-[#F97316] font-bold opacity-100' : 'text-stone-400 opacity-80 group-hover:opacity-100 group-hover:text-white'
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
