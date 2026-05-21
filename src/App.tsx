/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Boutique from './pages/Boutique';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { user } = useStore();
  const [activePage, setActivePage] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(() => {
    return localStorage.getItem('habe_skip_auth') === 'true';
  });

  const handleSkip = () => {
    localStorage.setItem('habe_skip_auth', 'true');
    setHasSkipped(true);
  };

  useEffect(() => {
    if (activePage !== 0) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      // Transition as we start moving into the second section (below Hero's 100vh)
      const threshold = window.innerHeight * 0.6;
      if (window.scrollY > threshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
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

  // If user is not authenticated and has not skipped, display registration onboarding page first
  if (!user && !hasSkipped) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-stone-900 to-stone-950 px-4 relative overflow-hidden select-none">
        {/* Ambient background gold lighting */}
        <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />
        
        <Auth showSkip={true} onSkip={handleSkip} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header positioning */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent border-transparent shadow-none border-b-0 transition-all duration-300 transform-gpu">
        <Header activePage={activePage} setActivePage={setActivePage} isTransparent={activePage === 0 && !isScrolled} />
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
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
