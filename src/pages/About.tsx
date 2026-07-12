import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, MessageSquare, Instagram, Truck, ExternalLink } from 'lucide-react';
import { getOptimizedImage } from '../utils/image';

const About: React.FC = () => {
  const whatsappUrl1 = "https://wa.me/22394077011?text=Bonjour%20Hab%C3%A9%20Textile%2C%20je%20souhaite%20finaliser%20ma%20commande.";
  const whatsappUrl2 = "https://wa.me/22394020209?text=Bonjour%20Hab%C3%A9%20Textile%2C%20je%20souhaite%20finaliser%20ma%20commande.";
  const instagramUrl = "https://www.instagram.com/habe_textile";
  const tiktokUrl = "https://www.tiktok.com/@habe_textile";

  const [imgSrc, setImgSrc] = React.useState('https://drive.google.com/thumbnail?id=1CoA_6G1815Rkxit3aHaXmUhakZO3NuMi&sz=w1000');
  const [errCount, setErrCount] = React.useState(0);

  const handleImgError = () => {
    if (errCount === 0) {
      setImgSrc('https://drive.google.com/uc?export=view&id=1CoA_6G1815Rkxit3aHaXmUhakZO3NuMi');
      setErrCount(1);
    } else if (errCount === 1) {
      setImgSrc('https://drive.google.com/thumbnail?id=1CoA_6G1815Rkxit3aHaXmUhakZO3NuMi&sz=w1000');
      setErrCount(2);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="px-6 pt-4 pb-32 max-w-lg mx-auto"
    >
      {/* SECTION 1: PRESENTATION IMAGE & WORLDWIDE DELIVERY CAPTION */}
      <section className="mb-6">
        {/* Caption below the video */}
        <div className="flex items-center justify-center gap-2 p-3 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm">
          <Truck className="w-4 h-4 text-brand-orange-dark shrink-0 animate-bounce" />
          <p className="font-heading font-medium text-xs text-brand-black tracking-wide">
            Habé Textile livre partout dans le monde
          </p>
        </div>
      </section>

      {/* SECTION 2: BRAND IDENTITY & DESCRIPTION */}
      <section className="mb-6 text-left">
        <h3 className="font-heading font-bold text-base text-brand-black mb-3">Notre Identité</h3>
        
        <div className="bg-white/25 backdrop-blur-md border border-white/25 rounded-3xl p-5 shadow-sm font-body text-xs text-brand-black/90 space-y-4">
          <p className="leading-relaxed">
            Habé Textile est une entreprise malienne du secteur de luxe fondée à Bamako par Abdoulaye Sylla.
          </p>
          <p className="leading-relaxed">
            Elle est spécialisée dans le style homme et garçon qui confectionne des vêtements de luxe pour des grandes événements et quotidiennement.
          </p>
          <p className="leading-relaxed">
            Elle est située à Torokorobougou près du Dibisoni Da et de Tanti Choco.
          </p>

          <div className="pt-3 border-t border-brand-black/10">
            <span className="font-heading font-bold text-[10px] tracking-widest uppercase text-brand-black/60 block mb-2">
              CONTACTS DIRECTS & WHATSAPP
            </span>
            <div className="space-y-2 font-mono text-[11px] text-brand-orange-dark font-semibold">
              <a href="tel:+22394077011" className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" /> +223 94 07 70 11
              </a>
              <a href="tel:+22394020209" className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5" /> +223 94 02 02 09
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MAPS GEOLOCATION ONLY */}
      <section className="mb-6 text-left">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-base text-brand-black flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-orange-dark" /> Notre Localisation
          </h3>
          <span className="text-[10px] bg-brand-orange-light/20 text-brand-orange-dark px-2.5 py-0.5 rounded-full font-bold">
            Bamako, Mali
          </span>
        </div>

        <div className="bg-white/25 backdrop-blur-md border border-white/25 rounded-3xl p-3 shadow-md overflow-hidden">
          {/* Active Interactive standard google map easily embedded using Torokorobougou point */}
          <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
            <iframe
              title="Google Map Location"
              src="https://maps.google.com/maps?q=Torokorobougou,Bamako,Mali&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className="absolute inset-0 w-full h-full border-0 grayscale-[10%]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-2.5 flex items-center justify-between px-1">
            <p className="text-[10px] text-brand-black/50 font-mono">
              Torokorobougou, Bamako, Mali
            </p>
            <a 
              href="https://maps.google.com/maps?q=Torokorobougou,Bamako,Mali"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] font-bold text-brand-orange-dark hover:underline flex items-center gap-1 cursor-pointer"
            >
              Itinéraire <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4: WHATSAPP FINALIZATION ACTION */}
      <section className="mb-6 text-left">
        <h3 className="font-heading font-bold text-base text-brand-black mb-3">Votre Commande</h3>
        
        <div className="space-y-3">
          <motion.a
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappUrl1}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-heading font-bold text-sm tracking-wide shadow-lg shadow-green-600/20 cursor-pointer select-none"
          >
            <MessageSquare className="w-5 h-5 shrink-0" />
            <span>Finaliser votre commande (+223 94 07 70 11)</span>
          </motion.a>

          <motion.a
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappUrl2}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 bg-green-600/90 hover:bg-green-700 text-white rounded-2xl font-heading font-semibold text-xs tracking-wide shadow-md cursor-pointer select-none"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Contact de secours (+223 94 02 02 09)</span>
          </motion.a>
        </div>
      </section>

      {/* SECTION 5: FOLLOW SOCIAL MEDIA SHARING */}
      <section className="text-left font-body">
        <h3 className="font-heading font-bold text-base text-brand-black mb-3">Suivez-nous</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.a
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3.5 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white shadow-md font-semibold text-xs justify-center cursor-pointer select-none"
          >
            <Instagram className="w-4 h-4 shrink-0" />
            <span>Instagram</span>
          </motion.a>

          <motion.a
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3.5 rounded-2xl bg-stone-900 hover:bg-stone-950 text-white shadow-md font-semibold text-xs justify-center cursor-pointer select-none border border-white/5"
          >
            <svg className="w-4 h-4 text-white fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.51-.71-.53-1.3-1.22-1.77-1.97v7.03c-.02 2.03-.64 4.07-1.96 5.61-1.42 1.72-3.72 2.79-6.01 2.83-2.61.1-5.22-1.01-6.81-3.08-1.55-1.98-2.02-4.66-1.43-7.11C1.04 11.23 2.92 8.87 5.4 7.82c1.77-.77 3.8-.82 5.62-.23.61.19 1.2.49 1.7.88.08-2.79.03-5.59.04-8.38-.07-.03-.16-.06-.24-.07z"/>
            </svg>
            <span>TikTok</span>
          </motion.a>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
