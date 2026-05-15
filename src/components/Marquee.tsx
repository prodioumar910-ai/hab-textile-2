import React from 'react';

import { motion } from 'motion/react';

const testimonials = [
  { img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop' },
  { img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&auto=format&fit=crop' },
];

const Marquee: React.FC = () => {
  return (
    <motion.section 
      id="testimonials-section" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-16 flex flex-col items-center"
    >
      <h2 className="font-heading font-bold text-xl mb-10 text-brand-black px-6 text-center uppercase tracking-widest opacity-80">
        Ils nous font confiance
      </h2>
      
      <div className="marquee-container w-full overflow-hidden">
        <div className="marquee-content flex gap-6 pr-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              {testimonials.map((t, index) => (
                <div key={`${i}-${index}`} className="flex-shrink-0 w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden border-[0.5px] border-white/30 shadow-md">
                  <img 
                    src={t.img} 
                    alt="Trusted client" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
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
