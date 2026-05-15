/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Boutique from './pages/Boutique';
import Profile from './pages/Profile';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activePage, setActivePage] = useState(0);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (activePage !== 0) {
      setShowNav(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowNav(true);
      } else {
        setShowNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case 0: return <Home />;
      case 1: return <Boutique />;
      case 2: return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <StoreProvider>
      <div className="flex flex-col min-h-screen">
        {/* Header positioning */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform-gpu ${
          activePage === 0 && !showNav 
            ? 'opacity-0 -translate-y-full' 
            : activePage === 0 
              ? 'opacity-100 translate-y-0 bg-transparent' 
              : 'opacity-100 translate-y-0 bg-white/95 shadow-sm'
        }`}>
          <Header />
        </div>

        <main className={`flex-1 overflow-x-hidden ${activePage !== 0 ? 'pt-20' : ''}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activePage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="will-change-transform"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showNav && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="z-[9999] fixed inset-x-0 bottom-0 pointer-events-none"
            >
              <div className="pointer-events-auto">
                <BottomNav activePage={activePage} setActivePage={setActivePage} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StoreProvider>
  );
}
