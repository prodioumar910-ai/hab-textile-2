import React from 'react';

import { motion } from 'motion/react';

interface TestimonialItem {
  id: string;
}

const testimonials: TestimonialItem[] = [
  { id: '1r1eip00LshkW8DYj5euNP7lElHlRfsRq' },
  { id: '1Pc3MTw0ha0QbDHoFVGCi6lJPV3F6xFDd' },
  { id: '1wsJGCg38-TmO4sjmqUgxvwiNXL2LKqnL' },
  { id: '1OpHtzFYrG5K2qGy5MYIBxU0AOT0ZVuTu' },
  { id: '19bBQNskiEuziLNG2yR5Elf94rmUeinCk' },
  { id: '1iUVa0U7R8NrE3OptOckHD-KrJniTvUyk' },
  { id: '1-P7ibruWPeyYtWcuUGOHjEZ5ka5BTQyZ' },
  { id: '1g3pDI-mMzr2KzDL-sZLxQzYApOJA_dx_' },
  { id: '16Od0MIq7GVtFTr4vY-ThRuX1jb6UgPa_' },
  { id: '1IgIsxn1dF-Scx4fjo9rhf1CCBBtBXaup' },
  { id: '1aauVhbSV1EKBYoIdf7LF9T2z_ETgB25T' },
  { id: '1oWOEGqyvd0V9TJ-9XqVQrG4r7MC2er4P' },
  { id: '11fctuHv86AY3IIlhvJg_8LNHAhAMAo3B' },
  { id: '17M0iOT3xU-bPRqIN9TjN8lXcxR548NHj' },
];

const SafeImage: React.FC<{ id: string }> = ({ id }) => {
  // Try dynamic high-res download first, then standard preview download, then direct show
  const [src, setSrc] = React.useState(`https://lh3.googleusercontent.com/d/${id}=w450-rw`);
  const [errorCount, setErrorCount] = React.useState(0);

  const handleError = () => {
    if (errorCount === 0) {
      setSrc(`https://drive.google.com/uc?export=view&id=${id}`);
      setErrorCount(1);
    } else if (errorCount === 1) {
      setSrc(`https://drive.google.com/thumbnail?id=${id}&sz=w1000`);
      setErrorCount(2);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent">
      {/* Ambient background matching the photo's colors */}
      <img 
        src={src} 
        alt="" 
        className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-20 select-none pointer-events-none"
        onError={handleError}
        referrerPolicy="no-referrer"
      />
      {/* 100% visible uncropped foreground image */}
      <img 
        src={src} 
        alt="Trusted client of Habé Textile" 
        className="relative z-10 w-full h-full object-contain" 
        onError={handleError}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

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
        <div className="marquee-content flex gap-8 pr-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>
              {testimonials.map((t, index) => (
                <div key={`${i}-${index}`} className="flex-shrink-0 w-64 h-[390px] md:w-96 md:h-[560px] rounded-2xl overflow-hidden shadow-sm">
                  <SafeImage id={t.id} />
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
