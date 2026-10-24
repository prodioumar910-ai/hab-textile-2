import React from "react";
import { motion } from "motion/react";
import { useBrandLogo } from "../constants";

interface ExperienceChoicePageProps {
  onSelectBoutique: () => void;
  onSelectMeasure: () => void;
}

export const ExperienceChoicePage: React.FC<ExperienceChoicePageProps> = ({
  onSelectBoutique,
  onSelectMeasure,
}) => {
  const { logoWhite } = useBrandLogo();
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
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden select-none py-8" 
      style={{ background: "radial-gradient(circle, #FFAA5E 0%, #C1541A 100%)" }}
    >
      {/* Background Ambience */}
      <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-8 z-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <img
            src={logoWhite || "/logo-white.png"}
            alt="Habé Textile"
            className="h-20 sm:h-28 w-auto max-w-[200px] sm:max-w-[260px] object-contain drop-shadow-xl"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('logo-white.png')) {
                img.src = "/logo-white.png";
              }
            }}
          />
        </motion.div>
      </div>

      {/* Horizontal Buttons: Enlarged, Side-by-Side, Zero Icons, Zero Subtitles */}
      <div className="w-full max-w-lg sm:max-w-xl grid grid-cols-2 gap-4 sm:gap-6 z-10 relative px-2">
        
        {/* Button 1: Boutique */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSelectBoutique}
          className="group relative cursor-pointer overflow-hidden rounded-3xl h-36 sm:h-44 md:h-48 border-2 border-white/50 hover:border-amber-300 shadow-2xl flex items-center justify-center p-4 text-center transition-all duration-300"
        >
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={boutiqueSrc}
              alt="Boutique"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={handleBoutiqueError}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-stone-950/65 group-hover:bg-stone-950/45 transition-colors" />
          </div>

          {/* Button Content: Pure clean typography, no icons, no subtitles */}
          <div className="relative z-10">
            <span className="text-white font-heading font-black text-base sm:text-xl md:text-2xl uppercase tracking-widest drop-shadow-lg group-hover:text-amber-300 transition-colors">
              Boutique
            </span>
          </div>
        </motion.button>

        {/* Button 2: Modèle */}
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSelectMeasure}
          className="group relative cursor-pointer overflow-hidden rounded-3xl h-36 sm:h-44 md:h-48 border-2 border-white/50 hover:border-amber-300 shadow-2xl flex items-center justify-center p-4 text-center transition-all duration-300"
        >
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={measureSrc}
              alt="Modèle"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={handleMeasureError}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-stone-950/65 group-hover:bg-stone-950/45 transition-colors" />
          </div>

          {/* Button Content: Pure clean typography, no icons, no subtitles */}
          <div className="relative z-10">
            <span className="text-white font-heading font-black text-base sm:text-xl md:text-2xl uppercase tracking-widest drop-shadow-lg group-hover:text-amber-300 transition-colors">
              Modèle
            </span>
          </div>
        </motion.button>

      </div>

      {/* Subtle brand copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-8 text-[10px] text-white/80 font-body text-center tracking-wider"
      >
        Habé Haute Couture © {new Date().getFullYear()}
      </motion.p>
    </div>
  );
};
