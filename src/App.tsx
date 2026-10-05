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
import { ExperienceChoicePage } from './pages/ExperienceChoicePage';
import { MeasurePage } from './pages/MeasurePage';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PretAPorterModal } from './components/PretAPorterModal';
import { SplashScreen } from './components/SplashScreen';

function AppContent() {
  const { user, selectedProduct, isTrendingOpen, isPretAPorterOpen } = useStore();
  const [activePage, setActivePage] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldHideHeader, setShouldHideHeader] = useState(false);
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<'choice' | 'boutique' | 'measure'>(() => {
    return (localStorage.getItem('habe_selected_experience') as 'choice' | 'boutique' | 'measure') || 'choice';
  });
  const [hasSkipped, setHasSkipped] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleSkip = () => {
    localStorage.setItem('habe_selected_experience', 'choice');
    setSelectedExperience('choice');
    setHasSkipped(true);
  };

  const handleSelectBoutique = () => {
    localStorage.setItem('habe_selected_experience', 'boutique');
    setSelectedExperience('boutique');
  };

  const handleSelectMeasure = () => {
    localStorage.setItem('habe_selected_experience', 'measure');
    setSelectedExperience('measure');
  };

  const handleResetExperience = () => {
    localStorage.setItem('habe_selected_experience', 'choice');
    setSelectedExperience('choice');
  };

  useEffect(() => {
    if (activePage !== 0) {
      setIsScrolled(true);
      setShouldHideHeader(false);
      setShowBottomNav(true);
      return;
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      
      setIsScrolled(scrollPos > 20);
      // Hide header after Section 1 (which is HeroCarousel at h-screen)
      setShouldHideHeader(scrollPos > windowHeight - 100);
      setShowBottomNav(true);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activePage]);

  const renderPage = () => {
    const isActuallyAdmin = 
      user?.email?.toLowerCase() === 'prodioumar910@gmail.com' ||
      localStorage.getItem('habe_local_admin') === 'true' ||
      user?.role === 'admin' ||
      (user as any)?.user_metadata?.role === 'admin';
    if (isAdminMode && isActuallyAdmin) return <Admin onClose={() => setIsAdminMode(false)} />;
    
    switch (activePage) {
      case 0: return <Home />;
      case 1: return <Boutique />;
      case 2: return <Profile onOpenAdmin={() => setIsAdminMode(true)} onOpenMeasure={handleSelectMeasure} />;
      case 3: return <About />;
      default: return <Home />;
    }
  };

  // If user is not authenticated and has not skipped, display registration onboarding page first
  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onFinish={() => {
              setShowSplash(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
      {!user && !hasSkipped ? (
        <motion.div
          key="auth"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden select-none"
          style={{ background: "radial-gradient(circle, #FFAA5E 0%, #C1541A 100%)" }}
        >
          {/* Ambient background gold lighting */}
          <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />
          
          <Auth showSkip={true} onSkip={handleSkip} />
        </motion.div>
      ) : selectedExperience === 'choice' ? (
        <motion.div
          key="choice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <ExperienceChoicePage
            onSelectBoutique={handleSelectBoutique}
            onSelectMeasure={handleSelectMeasure}
          />
        </motion.div>
      ) : selectedExperience === 'measure' ? (
        <motion.div
          key="measure"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen"
        >
          <MeasurePage
            onBackToChoice={handleResetExperience}
            onGoToBoutique={handleSelectBoutique}
          />
        </motion.div>
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col min-h-screen"
        >
          {/* Admin Back Button */}
          {isAdminMode && (
            <button
              onClick={() => setIsAdminMode(false)}
              className="fixed bottom-6 left-6 z-[10001] bg-white/70 backdrop-blur-xl text-brand-black px-6 py-3 rounded-full flex items-center gap-2 text-xs font-heading font-bold shadow-2xl active:scale-95 border border-white/40"
            >
              <ArrowLeft className="w-4 h-4 text-brand-orange-dark" />
              Quitter Admin
            </button>
          )}

          {/* Header positioning - Transparent background, hides on scroll */}
          {!isAdminMode && !selectedProduct && !isTrendingOpen && !isPretAPorterOpen && (
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform-gpu ${shouldHideHeader ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
              <Header 
                activePage={activePage} 
                setActivePage={setActivePage} 
                onOpenMeasure={handleSelectMeasure}
              />
            </div>
          )}

          <main className={`flex-1 overflow-x-hidden ${activePage !== 0 && !isAdminMode ? 'pt-20' : ''}`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isAdminMode ? 'admin' : activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
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
                  <BottomNav 
                    activePage={activePage} 
                    setActivePage={setActivePage} 
                    onOpenMeasure={handleSelectMeasure}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global High-Z Product Detail Overlay */}
          <ProductDetailModal />
          <PretAPorterModal />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
