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
    { icon: User, label: 'Profil', index: 2 },
    { icon: Info, label: 'À propos', index: 3 },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] h-12 bg-white/95 backdrop-blur-xl flex items-center justify-around px-3 z-[9999] rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.18)] border border-white/40">
      {navItems.map((item) => {
        const isActive = activePage === item.index;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.index}
            onClick={() => setActivePage(item.index)}
            layout
            initial={false}
            animate={{
              width: isActive ? "105px" : "40px",
              backgroundColor: isActive ? "rgba(193, 84, 26, 0.12)" : "rgba(255, 255, 255, 0)"
            }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`relative flex items-center justify-center h-9 rounded-full overflow-hidden select-none cursor-pointer transition-colors ${
              isActive ? 'text-brand-orange-dark font-extrabold' : 'text-brand-black/40 hover:text-brand-black/75'
            }`}
            aria-label={item.label}
          >
            <div className="flex items-center justify-center gap-1.5 px-2">
              <Icon
                className={`w-4 h-4 transition-transform duration-200 shrink-0 ${
                  isActive ? 'scale-110 text-brand-orange-dark' : 'scale-100'
                }`}
              />
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.15 }}
                  className="text-[9px] font-heading font-extrabold tracking-wider uppercase whitespace-nowrap text-brand-orange-dark"
                >
                  {item.label}
                </motion.span>
              )}
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
