import React from 'react';
import { motion } from 'motion/react';
import { Home, ShoppingBag, User } from 'lucide-react';

interface BottomNavProps {
  activePage: number;
  setActivePage: (index: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const navItems = [
    { icon: Home, label: 'Accueil', index: 0 },
    { icon: ShoppingBag, label: 'Boutique', index: 1 },
    { icon: User, label: 'Profil', index: 2 },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-[280px] h-12 bg-white/95 backdrop-blur-xl flex items-center justify-around px-2 z-[9999] rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-white/40">
      {navItems.map((item) => {
        const isActive = activePage === item.index;
        const Icon = item.icon;

        return (
          <button
            key={item.index}
            onClick={() => setActivePage(item.index)}
            className="relative flex flex-col items-center justify-center w-10 h-10 group"
            aria-label={item.label}
          >
            {isActive && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-brand-orange-dark/5 rounded-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <Icon
              className={`w-4 h-4 transition-transform duration-200 transform-gpu ${
                isActive ? 'text-brand-orange-dark scale-110' : 'text-brand-black/40 group-hover:text-brand-black/70'
              }`}
            />
            <span className={`text-[7px] mt-0.5 font-extrabold tracking-tight ${isActive ? 'text-brand-orange-dark' : 'text-brand-black/40'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
