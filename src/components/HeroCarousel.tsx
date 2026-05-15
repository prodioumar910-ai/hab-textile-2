import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const images = [
  'https://lh3.googleusercontent.com/d/1srnqXGTTedQmK9t8N4cFtM8u0lGHw7t7',
  'https://lh3.googleusercontent.com/d/1PNaxfG-rnihS1KCSo0Jo-SC9MorD2aVq',
  'https://lh3.googleusercontent.com/d/1R8_IVuUi7fNbv-pDXriCBREDhe-IAK4z',
  'https://lh3.googleusercontent.com/d/1elb6RCTzbeeW6CVSPyRNykjF-RVgT4de',
  'https://lh3.googleusercontent.com/d/11a8rfgbPLBLKsgAj1U1tdmqEcmuGfg0E',
];

const HeroCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={images[index]}
            alt={`Hero ${index + 1}`}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
