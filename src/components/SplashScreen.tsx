import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { APP_LOGO_TEXT_WHITE, BRAND_NAME, useBrandLogo } from '../constants';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const { logo, logoWide, isCustom } = useBrandLogo();

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800;
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(progressInterval);
      }
    }, 30);

    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <motion.div
      key="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onClick={onFinish}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden bg-white"
    >
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        {/* Animated Brand Showcase with 360 Rotation - No Background */}
        <motion.div 
          className="relative mb-12 flex items-center justify-center"
        >
          {/* Logo container - Purely transparent background */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              rotate: 360
            }}
            transition={{
              duration: 1.2,
              ease: [0.34, 1.56, 0.64, 1], // Sudden stop with bounce
              delay: 0.2
            }}
            className={`relative flex items-center justify-center overflow-visible ${isCustom ? 'w-[80vw] max-w-[400px] h-32 sm:h-40' : 'w-24 h-24 sm:w-32 sm:h-32'}`}
          >
            <motion.img
              src={isCustom ? (logoWide || logo) : logo}
              alt="Habé"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Elegant Progress Indicator (Dark for visibility) */}
        <div className="mt-4 flex flex-col items-center gap-4">
          <div className="w-48 h-[1px] bg-stone-200 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-brand-orange-dark"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            className="text-[9px] text-brand-black font-mono uppercase tracking-[0.4em]"
          >
            Maison de Couture
          </motion.span>
        </div>
      </div>

      {/* Touch to enter prompt (Dark for visibility) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 text-[10px] text-brand-black font-mono tracking-widest uppercase"
      >
        Entrer dans l'univers Habé
      </motion.div>
    </motion.div>
  );
};
