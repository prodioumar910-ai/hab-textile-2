import React from "react";
import { motion } from "motion/react";

interface ExperienceChoicePageProps {
  onSelectBoutique: () => void;
  onSelectMeasure: () => void;
}

export const ExperienceChoicePage: React.FC<ExperienceChoicePageProps> = ({
  onSelectBoutique,
  onSelectMeasure,
}) => {
  const [boutiqueSrc, setBoutiqueSrc] = React.useState('https://lh3.googleusercontent.com/d/1vXWUkn_u2vcKnHTiBvW0dLsUTsLSbI13');
  const [boutiqueErrCount, setBoutiqueErrCount] = React.useState(0);
  
  const [measureSrc, setMeasureSrc] = React.useState('https://lh3.googleusercontent.com/d/1jXQCZWaKK7cm4QhBg0o2HYmnEIAvgtIQ');
  const [measureErrCount, setMeasureErrCount] = React.useState(0);

  const handleBoutiqueError = () => {
    if (boutiqueErrCount === 0) {
      setBoutiqueSrc('https://drive.google.com/uc?export=view&id=1vXWUkn_u2vcKnHTiBvW0dLsUTsLSbI13');
      setBoutiqueErrCount(1);
    } else if (boutiqueErrCount === 1) {
      setBoutiqueSrc('https://drive.google.com/thumbnail?id=1vXWUkn_u2vcKnHTiBvW0dLsUTsLSbI13&sz=w1000');
      setBoutiqueErrCount(2);
    }
  };

  const handleMeasureError = () => {
    if (measureErrCount === 0) {
      setMeasureSrc('https://drive.google.com/uc?export=view&id=1jXQCZWaKK7cm4QhBg0o2HYmnEIAvgtIQ');
      setMeasureErrCount(1);
    } else if (measureErrCount === 1) {
      setMeasureSrc('https://drive.google.com/thumbnail?id=1jXQCZWaKK7cm4QhBg0o2HYmnEIAvgtIQ&sz=w1000');
      setMeasureErrCount(2);
    }
  };

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
          className="group cursor-pointer bg-[#FFEAD8]/95 hover:bg-[#FFE3CD] backdrop-blur-md border border-stone-200/80 hover:border-brand-orange-dark/40 rounded-2xl sm:rounded-3xl h-[180px] sm:h-[240px] shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
        >
          <img
            src={boutiqueSrc}
            alt="Boutique"
            className="absolute inset-0 w-full h-full object-cover drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
            onError={handleBoutiqueError}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* Choice 2: Virtual AI Tailor Cabin */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4, type: "spring", stiffness: 100 }}
          onClick={onSelectMeasure}
          className="group cursor-pointer bg-[#FFEAD8]/95 hover:bg-[#FFE3CD] backdrop-blur-md border border-stone-200/80 hover:border-brand-orange-dark/40 rounded-2xl sm:rounded-3xl h-[180px] sm:h-[240px] shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
        >
          <img
            src={measureSrc}
            alt="Mesure IA"
            className="absolute inset-0 w-full h-full object-cover drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
            onError={handleMeasureError}
            referrerPolicy="no-referrer"
          />
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
