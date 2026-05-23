import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const TRENDING_ITEMS = [
  { id: 't1', name: 'Boubou Majesté', image: 'https://lh3.googleusercontent.com/d/1jnoz-YiJjiXAg5ulvILf85v_pAqmRtQ4' },
  { id: 't2', name: 'Ensemble Royal', image: 'https://lh3.googleusercontent.com/d/1oMoyw-7qyg4Ih6aWFzQFuHgTIi2m-_CV' },
  { id: 't3', name: 'Robe Divine Coton', image: 'https://lh3.googleusercontent.com/d/1BbR26kpQ4LdImgGrAVxeCIkBEX-E8TWF' },
  { id: 't4', name: 'Bazin Prestige Or', image: 'https://lh3.googleusercontent.com/d/1E9-lDyyWea8NtahCjY_p49Y4kkqhwGqT' },
  { id: 't5', name: 'Ensemble Signature', image: 'https://lh3.googleusercontent.com/d/1l0xs1ZZQpnzhTE-OKc-8sl9VTwc7h-eb' },
  { id: 't6', name: 'Sénateur Raffiné', image: 'https://lh3.googleusercontent.com/d/1tMzFDhuxnNgBaKHkh4pRtAKllfSxBYdF' },
  { id: 't7', name: 'Wax Couture Impérial', image: 'https://lh3.googleusercontent.com/d/1pvgXg-TO12SBeJ-EgHkvSxFGVd3pr7ve' },
  { id: 't8', name: 'Gandoura Élite', image: 'https://lh3.googleusercontent.com/d/1mVQd0T30KsH3VJk1d2uNjpHtXGAcIV9C' },
  { id: 't9', name: 'Kaftan Pureté', image: 'https://lh3.googleusercontent.com/d/1vS0ddy64oCSnvggkJs-kpzsJjxLrAf7I' },
  { id: 't10', name: 'Abaya Moderne', image: 'https://lh3.googleusercontent.com/d/1gicja5relC7Qa-SvwbTnmmKd8Ef3Z0Eo' },
  { id: 't11', name: 'Boubou Céleste', image: 'https://lh3.googleusercontent.com/d/1cxOd2dOGBbAG9cryAC5-UUDQFm0S2_x1' },
  { id: 't12', name: 'Linen d’Exception', image: 'https://lh3.googleusercontent.com/d/1c1UVTCsiflQFhYw6EgC_kdmsEyJfcw-y' },
  { id: 't13', name: 'Wax Élégance', image: 'https://lh3.googleusercontent.com/d/1sXCLy4i4xgDykTNp1LkIK9DdnqSZt0sE' },
  { id: 't14', name: 'Grand Boubou Suprême', image: 'https://lh3.googleusercontent.com/d/1A9YMMSAigfMZFWjpufkWOSFDgaYKrK3a' },
  { id: 't15', name: 'Ensemble Ambassadeur', image: 'https://lh3.googleusercontent.com/d/1aKlS5fXkvaIXJ2uVjBp9m33A9mAvaDu9' },
];

const TrendingSection: React.FC = () => {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const isDragActive = React.useRef(false);
  const startX = React.useRef(0);
  const startScrollLeft = React.useRef(0);
  const dragMoved = React.useRef(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Initialize and handle endless wrap-around scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initScroll = () => {
      const singleTrackWidth = container.scrollWidth / 3;
      // Scroll to the start of the middle track
      container.scrollLeft = singleTrackWidth;
    };

    // Run immediately and after a short paint cycle
    initScroll();
    const rAF = requestAnimationFrame(initScroll);
    const timer = setTimeout(initScroll, 150);

    return () => {
      cancelAnimationFrame(rAF);
      clearTimeout(timer);
    };
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth } = container;
    const singleTrackWidth = scrollWidth / 3;

    // Left threshold: near the first half of the first division, snap to second division
    if (scrollLeft < singleTrackWidth - 100) {
      container.scrollLeft = scrollLeft + singleTrackWidth;
    } 
    // Right threshold: near the start of the third division, snap to second division
    else if (scrollLeft >= singleTrackWidth * 2 - 100) {
      container.scrollLeft = scrollLeft - singleTrackWidth;
    }
  };

  // Mouse drag functionality for desktop users
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    isDragActive.current = true;
    setIsMouseDown(true);
    startX.current = e.pageX - container.offsetLeft;
    startScrollLeft.current = container.scrollLeft;
    dragMoved.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragActive.current) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX.current) * 1.5; // scroll speed multiplier

    if (Math.abs(walk) > 5) {
      dragMoved.current = true;
    }

    container.scrollLeft = startScrollLeft.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragActive.current = false;
    setIsMouseDown(false);
  };

  const handleItemClick = (idx: number, e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setViewerIndex(idx % TRENDING_ITEMS.length);
  };

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setViewerIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : TRENDING_ITEMS.length - 1));
  }, []);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setViewerIndex((prev) => (prev !== null && prev < TRENDING_ITEMS.length - 1 ? prev + 1 : 0));
  }, []);

  const handleClose = useCallback(() => {
    setViewerIndex(null);
    setIsZoomed(false);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (viewerIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerIndex, handleClose, handlePrev, handleNext]);

  return (
    <section className="py-12 bg-white/5">
      <div className="px-6 mb-8 flex justify-between items-center">
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="font-heading font-bold text-xl uppercase tracking-wider text-brand-black/90"
        >
          Tendance Habé
        </motion.h2>
        <span className="text-[10px] uppercase font-mono tracking-widest text-brand-black/40">
          Clic pour zoomer
        </span>
      </div>
      
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex overflow-x-auto gap-6 py-6 px-6 no-scrollbar select-none w-full scroll-smooth ${isMouseDown ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        {/* Track 1: Prefix */}
        <div className="flex gap-6 flex-shrink-0">
          {TRENDING_ITEMS.map((product, idx) => (
            <div 
              key={`${product.id}-prefix`}
              className="flex-shrink-0 w-60"
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="group cursor-pointer relative">
                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-transparent relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/10 transition-all pointer-events-none rounded-2xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md text-brand-black py-2 px-4 rounded-full text-[10px] font-heading font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      Agrandir
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Track 2: Main */}
        <div className="flex gap-6 flex-shrink-0">
          {TRENDING_ITEMS.map((product, idx) => (
            <div 
              key={`${product.id}-main`}
              className="flex-shrink-0 w-60"
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="group cursor-pointer relative">
                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-transparent relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/10 transition-all pointer-events-none rounded-2xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md text-brand-black py-2 px-4 rounded-full text-[10px] font-heading font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      Agrandir
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Track 3: Suffix */}
        <div className="flex gap-6 flex-shrink-0">
          {TRENDING_ITEMS.map((product, idx) => (
            <div 
              key={`${product.id}-suffix`}
              className="flex-shrink-0 w-60"
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="group cursor-pointer relative">
                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-transparent relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-contain pointer-events-none transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/[0.02] group-hover:bg-black/10 transition-all pointer-events-none rounded-2xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-md text-brand-black py-2 px-4 rounded-full text-[10px] font-heading font-semibold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      Agrandir
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern High-Fidelity Lightbox with Animation */}
      <AnimatePresence>
        {viewerIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-brand-black/98 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8"
          >
            {/* Top Toolbar */}
            <div className="flex items-center justify-between w-full h-16 z-50">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">
                  Tendance {viewerIndex + 1} / {TRENDING_ITEMS.length}
                </span>
                <span className="text-sm font-heading font-semibold text-white tracking-wide uppercase mt-0.5">
                  {TRENDING_ITEMS[viewerIndex].name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Zoom Helper Buttons */}
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="p-3 bg-white/5 hover:bg-white/15 text-white/80 hover:text-white rounded-full transition-all outline-none"
                  title={isZoomed ? "Zoom arrière" : "Zoom avant"}
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-medium rounded-full transition-all outline-none"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full select-none">
              {/* Left Navigation Arrow */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-6 z-50 p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all outline-none active:scale-90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Lightbox Image Container */}
              <div className="w-full h-full flex items-center justify-center">
                <motion.div
                  key={viewerIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative max-w-full max-h-[75vh] flex items-center justify-center"
                >
                  <motion.img
                    src={TRENDING_ITEMS[viewerIndex].image}
                    alt={TRENDING_ITEMS[viewerIndex].name}
                    className={`max-w-[90vw] max-h-[75vh] object-contain transition-all duration-300 ease-out ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                    referrerPolicy="no-referrer"
                    onClick={() => setIsZoomed(!isZoomed)}
                    layout
                  />
                </motion.div>
              </div>

              {/* Right Navigation Arrow */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-6 z-50 p-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition-all outline-none active:scale-90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Info Bar / Instructions */}
            <div className="w-full text-center py-4 z-50">
              <p className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
                {isZoomed ? "Pincez ou cliquez sur la photo pour revenir à l'affichage normal" : "Cliquez sur la photo pour zoomer sur les détails du tissu"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes trending-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-100% - 1.5rem));
          }
        }
        .animate-trending-scroll {
          animation: trending-scroll 45s linear infinite;
          will-change: transform;
        }
        .trending-marquee-content:hover .animate-trending-scroll {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
};

export default TrendingSection;
