import React from 'react';
import { Instagram, Facebook, Phone, MapPin, Clock } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-brand-black/90 border-t border-white/5 pt-12 pb-28 px-6 mt-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 md:flex-row md:justify-between md:items-start text-left">
        
        {/* Brand Details */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-heading font-black text-white tracking-widest uppercase">
            Maison Habé
          </h2>
          <p className="text-xs text-white/50 leading-relaxed max-w-xs font-body">
            L'excellence du prêt-à-porter traditionnel revisité. Des créations uniques façonnées avec passion pour sublimer toutes vos apparitions.
          </p>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-heading font-bold text-brand-orange-light uppercase tracking-widest">
            Contact & Support
          </h3>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3 text-xs text-white/70 font-body">
              <Phone className="w-4 h-4 text-brand-orange-light shrink-0" />
              <a href="tel:+22394020209" className="hover:text-white transition-colors">
                +223 94 02 02 09
              </a>
            </li>
            <li className="flex items-center gap-3 text-xs text-white/70 font-body">
              <MapPin className="w-4 h-4 text-brand-orange-light shrink-0" />
              <span>Torokorobougou, non loin du Dibisso</span>
            </li>
            <li className="flex items-center gap-3 text-xs text-white/70 font-body">
              <Clock className="w-4 h-4 text-brand-orange-light shrink-0" />
              <span>Lun - Sam: 09h00 - 20h00</span>
            </li>
          </ul>
        </div>

        {/* Social Networks & Community */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-heading font-bold text-brand-orange-light uppercase tracking-widest">
            Suivez-nous
          </h3>
          <p className="text-[11px] text-white/40 leading-relaxed max-w-xs font-body">
            Rejoignez-nous sur nos réseaux pour ne manquer aucune nouveauté de nos collections.
          </p>
          <div className="flex items-center gap-4 mt-1">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full bg-white/5 hover:bg-brand-orange-light hover:text-white text-white/80 transition-all active:scale-95"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="p-2.5 rounded-full bg-white/5 hover:bg-brand-orange-light hover:text-white text-white/80 transition-all active:scale-95"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-tighter mb-2">
              Installer l'application mobile
            </h4>
            <p className="text-[9px] text-white/40 leading-tight mb-3">
              Sur iPhone: Partager &gt; "Sur l'écran d'accueil"<br/>
              Sur Android: Menu &gt; "Installer l'application"
            </p>
          </div>
        </div>

      </div>

      {/* Footer Bottom copyright and attribution */}
      <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-center sm:text-left">
        <p className="text-[10px] text-white/30 font-mono tracking-wider uppercase">
          &copy; {new Date().getFullYear()} Maison Habé. Tous droits réservés.
        </p>
        <p className="text-[9px] text-white/20 font-mono tracking-wider uppercase">
          Création de luxe africain
        </p>
      </div>
    </footer>
  );
};

export default Footer;
