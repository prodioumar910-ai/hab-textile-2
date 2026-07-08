import React from "react";
import { motion } from "motion/react";
import { ShoppingBag, Camera, Sparkles, ChevronRight } from "lucide-react";

interface ExperienceChoicePageProps {
  onSelectBoutique: () => void;
  onSelectMeasure: () => void;
}

export const ExperienceChoicePage: React.FC<ExperienceChoicePageProps> = ({
  onSelectBoutique,
  onSelectMeasure,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden select-none py-12" style={{ background: "radial-gradient(circle, #FFAA5E 0%, #C1541A 100%)" }}>
      {/* Background Ambience consistent with existing theme */}
      <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-12 z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-4"
        >
          <img
            src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma"
            alt="Habé Textile Logo"
            className="h-20 w-auto mx-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-widest uppercase mt-2"
        >
          Maison Habé
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs font-body font-extrabold tracking-widest text-stone-950/85 uppercase mt-3"
        >
          L'élégance et la tradition sur mesure
        </motion.p>
      </div>

      {/* Choice Panel */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-3 sm:gap-6 z-10 relative px-2">
        
        {/* Choice 1: Existing Boutique */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring", stiffness: 100 }}
          onClick={onSelectBoutique}
          className="group cursor-pointer bg-[#FFEAD8]/95 hover:bg-[#FFE3CD] backdrop-blur-md border border-stone-200/80 hover:border-brand-orange-dark/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between h-[180px] sm:h-[240px] shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-500/5 pointer-events-none" />
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-100 group-hover:bg-brand-orange-dark/15 border border-stone-200 group-hover:border-brand-orange-light/30 flex items-center justify-center text-stone-700 group-hover:text-brand-orange-dark transition-all duration-300 shadow-inner">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[7px] sm:text-[9px] font-heading font-extrabold uppercase tracking-widest bg-stone-100 border border-stone-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-stone-600">
              Boutique
            </span>
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-xl md:text-2xl lg:text-3xl text-stone-950 uppercase tracking-wider leading-tight">
              Découvrir la Boutique
            </h2>
          </div>

          <div className="flex items-center gap-1 text-[9px] sm:text-xs font-heading font-extrabold uppercase tracking-widest text-stone-500 group-hover:text-brand-orange-dark transition-colors duration-300">
            Explorer <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Choice 2: Virtual AI Tailor Cabin */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
          onClick={onSelectMeasure}
          className="group cursor-pointer bg-[#FFEAD8]/95 hover:bg-[#FFE3CD] backdrop-blur-md border border-stone-200/80 hover:border-brand-orange-dark/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between h-[180px] sm:h-[240px] shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
        >
          {/* Subtle neon glow on hover */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange-dark/10 rounded-full blur-2xl group-hover:scale-150 transition-all duration-500 pointer-events-none" />
          
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-stone-100 group-hover:bg-brand-orange-dark/15 border border-stone-200 group-hover:border-brand-orange-light/30 flex items-center justify-center text-stone-700 group-hover:text-brand-orange-dark transition-all duration-300 shadow-inner">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className="text-[7px] sm:text-[9px] font-heading font-extrabold uppercase tracking-widest bg-brand-orange-dark/15 border border-brand-orange-dark/25 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-brand-orange-dark flex items-center gap-0.5 sm:gap-1 shadow-sm shadow-brand-orange-dark/5">
              <Sparkles className="w-2.5 h-2.5 animate-pulse" /> Offert
            </span>
          </div>

          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-xl md:text-2xl lg:text-3xl text-stone-950 uppercase tracking-wider leading-tight">
              Mesure IA
            </h2>
          </div>

          <div className="flex items-center gap-1 text-[9px] sm:text-xs font-heading font-extrabold uppercase tracking-widest text-stone-500 group-hover:text-brand-orange-dark transition-colors duration-300">
            Mesurer <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

      </div>

      {/* Small informative tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-12 text-[10px] text-white font-body text-center"
      >
        Maison Habé Haute Couture © {new Date().getFullYear()} — Tous droits réservés.
      </motion.p>
    </div>
  );
};
