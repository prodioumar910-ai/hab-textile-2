import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImage } from '../utils/image';

const TRENDING_ITEMS = [
  { id: 'hm-1', name: "Boubou Royal d'Or", image: 'https://lh3.googleusercontent.com/d/18HxJiKqb9dRx5J_9OHyLwQwbwViDnmws' },
  { id: 'kd-1', name: "Ensemble Royal Junior Or", image: 'https://lh3.googleusercontent.com/d/1WhYofpnj4MpoDAIY2wvWX-qYwfl9Nqve' },
  { id: 'hm-8', name: 'Boubou Royal Excellence', image: 'https://lh3.googleusercontent.com/d/1CSU6vDruqukQpvS5FV8_pWFIZdITPRZj' },
  { id: 'kd-9', name: "Boubou d'Or Enfant", image: 'https://lh3.googleusercontent.com/d/11H8t34yu0Xe4lQUgEkTWHk8BWP3UdKmX' },
  { id: 'hm-6', name: 'Kaftan Impérial Brodé', image: 'https://lh3.googleusercontent.com/d/1eZ48hX3O_tlrBe1iDSTCIBlmlBsjX6Ma' },
  { id: 'kd-3', name: "Boubou Impérial Kid", image: 'https://lh3.googleusercontent.com/d/1T0OQcSvsgR6GbMuR128mIjIr46scc5Px' },
  { id: 'hm-4', name: 'Boubou Prestige Moutarde', image: 'https://lh3.googleusercontent.com/d/1w9n95-LCG8z6oSKgrY4pz78VlSMJ7gR2' },
  { id: 'kd-8', name: "Ensemble Dynastie Kid Wax", image: 'https://lh3.googleusercontent.com/d/1MgkG5BWdubX74GSs1QSOihYxPNOI4HLL' },
  { id: 'hm-2', name: 'Kaftan Bleu Nuit Brodé', image: 'https://lh3.googleusercontent.com/d/1G3sC5y1cwyJd3Ml2pX7yXS0NbH_pVtoY' },
  { id: 'kd-2', name: "Kaftan Royal Kid Indigo", image: 'https://lh3.googleusercontent.com/d/13urnzRLr1NkJfn8Q4Y5vO3GAieBEAxrY' },
];

const TrendingSection: React.FC = () => {
  const { setIsTrendingOpen } = useStore();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setIsTrendingOpen(viewerIndex !== null);
    return () => {
      setIsTrendingOpen(false);
    };
  }, [viewerIndex, setIsTrendingOpen]);

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
            <motion.div 
              key={`${product.id}-prefix`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }}
              className="flex-shrink-0 w-60"
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="group cursor-pointer relative">
                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-transparent relative">
                  <img 
                    src={getOptimizedImage(product.image, 600)} 
                    alt={product.name} 
                    loading="lazy"
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
            </motion.div>
          ))}
        </div>

        {/* Track 2: Main */}
        <div className="flex gap-6 flex-shrink-0">
          {TRENDING_ITEMS.map((product, idx) => (
            <motion.div 
              key={`${product.id}-main`}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 4) * 0.1 }}
              className="flex-shrink-0 w-60"
              onClick={(e) => handleItemClick(idx, e)}
            >
              <div className="group cursor-pointer relative">
                <div className="aspect-[9/16] overflow-hidden rounded-2xl bg-transparent relative">
                  <img 
                    src={getOptimizedImage(product.image, 600)} 
                    alt={product.name} 
                    loading="lazy"
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
            </motion.div>
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
                    src={getOptimizedImage(product.image, 600)} 
                    alt={product.name} 
                    loading="lazy"
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
            className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xl flex items-center justify-center overflow-hidden"
          >
            {/* Screen-level navigation controls next to/beside the content */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100003] p-3 rounded-full bg-white/10 hover:bg-brand-orange-light text-white hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer shadow-lg"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100003] p-3 rounded-full bg-white/10 hover:bg-brand-orange-light text-white hover:text-white border border-white/10 transition-all hover:scale-110 active:scale-90 flex items-center justify-center cursor-pointer shadow-lg"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Close button in top right of the viewport screen, next to the image content */}
            <button
              onClick={handleClose}
              className="fixed top-6 right-6 z-[100003] p-3 rounded-full bg-white text-brand-black hover:bg-brand-orange-light hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center cursor-pointer"
              title="Fermer"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>

            {/* Main Stage (Full screen space with backdrop click to close) */}
            <div 
              className="absolute inset-0 flex items-center justify-center overflow-hidden w-full h-full select-none cursor-pointer"
              onClick={handleClose}
            >
              <div className="w-full h-full flex items-center justify-center p-4">
                <motion.div
                  key={viewerIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()} // Prevent click inside image container from closing
                >
                  <img
                    src={getOptimizedImage(TRENDING_ITEMS[viewerIndex].image, 600)}
                    alt={TRENDING_ITEMS[viewerIndex].name}
                    className="w-auto h-auto max-w-[85vw] max-h-[82vh] md:max-w-[70vw] md:max-h-[82vh] rounded-3xl object-contain shadow-[0_25px_60px_rgba(0,0,0,0.6)] border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
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
