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
import About from './pages/About';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PretAPorterModal } from './components/PretAPorterModal';

function AppContent() {
  const { user, selectedProduct, isTrendingOpen, isPretAPorterOpen } = useStore();
  const [activePage, setActivePage] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
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
      setShowBottomNav(true);
      return;
    }

    const handleScroll = () => {
      // Transition as we start moving into the second section (below Hero's 100vh)
      const scrollPos = window.scrollY;
      const thresholdHeader = window.innerHeight * 0.4;
      const thresholdNav = window.innerHeight * 1.5; // Threshold for 3rd section

      setIsScrolled(scrollPos > thresholdHeader);
      setShowBottomNav(scrollPos > thresholdNav);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const renderPage = () => {
    if (isAdminMode) return <Admin />;
    
    switch (activePage) {
      case 0: return <Home />;
      case 1: return <Boutique />;
      case 2: return <Profile onOpenAdmin={() => setIsAdminMode(true)} />;
      case 3: return <About />;
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
      {/* Admin Back Button */}
      {isAdminMode && (
        <button
          onClick={() => setIsAdminMode(false)}
          className="fixed bottom-6 left-6 z-[10001] bg-brand-black text-white px-6 py-3 rounded-full flex items-center gap-2 text-xs font-heading font-bold shadow-2xl active:scale-95 border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          Quitter Admin
        </button>
      )}

      {/* Header positioning */}
      {!isAdminMode && !selectedProduct && !isTrendingOpen && !isPretAPorterOpen && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-transparent border-transparent shadow-none border-b-0 transition-all duration-300 transform-gpu">
          <Header activePage={activePage} setActivePage={setActivePage} isTransparent={activePage === 0 && !isScrolled} />
        </div>
      )}

      <main className={`flex-1 overflow-x-hidden ${activePage !== 0 && !isAdminMode ? 'pt-20' : ''}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isAdminMode ? 'admin' : activePage}
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
        {!isAdminMode && !selectedProduct && !isTrendingOpen && !isPretAPorterOpen && showBottomNav && (
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

      {/* Global High-Z Product Detail Overlay */}
      <ProductDetailModal />
      <PretAPorterModal />
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
