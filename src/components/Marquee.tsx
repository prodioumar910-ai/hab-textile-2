import React from 'react';

import { motion } from 'motion/react';

const testimonials = [
  { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop', name: 'Moussa D.', text: 'Une élégance inégalée.' },
  { img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=300&auto=format&fit=crop', name: 'Amadou K.', text: 'Le tissu est d\'une qualité rare.' },
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', name: 'Fatou B.', text: 'Parfait pour mes cérémonies.' },
  { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop', name: 'Omar S.', text: 'Habé Textile, le choix du roi.' },
  { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop', name: 'Zainab L.', text: 'Service client impeccable.' },
];

const Marquee: React.FC = () => {
  return (
    <motion.section 
      id="testimonials-section" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-20 flex flex-col items-center"
    >
      <h2 className="font-heading font-bold text-2xl mb-12 text-brand-black px-6 text-center">
        Ils nous ont fait confiance
      </h2>
      
      <div className="marquee-container w-full">
        <div className="marquee-content">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              {testimonials.map((t, index) => (
                <div key={index} className="flex-shrink-0 w-64 bg-white/30 backdrop-blur-md rounded-2xl p-4 border border-white/40 shadow-lg">
                  <div className="flex items-center gap-4">
                    <img 
                      src={t.img} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/50" 
                    />
                    <div>
                      <p className="font-heading font-bold text-sm text-brand-black">{t.name}</p>
                      <p className="text-[10px] italic text-brand-black/80 font-body">" {t.text} "</p>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Marquee;
