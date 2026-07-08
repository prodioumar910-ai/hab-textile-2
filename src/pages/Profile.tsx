import React from 'react';
import { motion } from 'motion/react';
import { Package, Heart, Settings, LogOut, ChevronRight, Bell, Globe, ShieldCheck, Ruler, Sparkles, Camera } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Auth from './Auth';

interface ProfileProps {
  onOpenAdmin?: () => void;
  onOpenMeasure?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onOpenAdmin, onOpenMeasure }) => {
  const { favorites, user, signOut, products } = useStore();
  
  if (!user) {
    return <Auth />;
  }

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  const savedMeasurements = (() => {
    try {
      const data = localStorage.getItem("habe_ai_measurements");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  })();

  const orders = [
    { id: '#HB-1029', date: '12 Mai 2024', status: 'en cours', total: 150 },
    { id: '#HB-0982', date: '15 Avril 2024', status: 'livré', total: 85 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6 pt-4 pb-32"
    >
      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-12"
      >
        <div className="w-24 h-24 rounded-full border-4 border-white/40 overflow-hidden mb-4 shadow-xl bg-white p-1">
          <img
            src={user.email?.toLowerCase() === 'prodioumar910@gmail.com'
              ? "https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma"
              : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
            }
            alt="Avatar"
            className="w-full h-full object-contain rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="font-heading font-bold text-xl text-brand-black">
          {user.user_metadata?.full_name || user.email}
        </h2>
        <button className="mt-2 px-4 py-1.5 bg-white/30 backdrop-blur-md rounded-full text-xs font-body font-medium text-brand-black border border-white/20">
          Modifier le profil
        </button>
      </motion.section>

      {/* AI Measurements Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-brand-black" />
            <h3 className="font-heading font-bold text-lg text-brand-black">Mes Mesures IA</h3>
          </div>
          {savedMeasurements && (
            <span className="text-[9px] font-heading font-extrabold uppercase bg-brand-orange-dark/15 text-brand-orange-dark border border-brand-orange-dark/25 px-2 py-0.5 rounded-full shadow-sm">
              Analysé le {savedMeasurements.date}
            </span>
          )}
        </div>

        {savedMeasurements ? (
          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { label: "Poitrine", value: savedMeasurements.poitrine },
                { label: "Taille", value: savedMeasurements.taille },
                { label: "Hanches", value: savedMeasurements.hanche },
                { label: "Manche", value: savedMeasurements.manche },
                { label: "Coude", value: savedMeasurements.coude },
                { label: "Pantalon", value: savedMeasurements.pantalon }
              ].map((m, i) => (
                <div key={i} className="bg-white/30 border border-white/20 rounded-2xl p-3 text-center shadow-xs">
                  <span className="text-brand-black/50 text-[9px] font-body font-extrabold block truncate uppercase tracking-wider">
                    {m.label}
                  </span>
                  <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                    <span className="font-heading font-extrabold text-brand-black text-lg">
                      {m.value}
                    </span>
                    <span className="text-[8px] text-brand-orange-dark font-heading font-bold">cm</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 mb-4 relative overflow-hidden">
              <span className="text-[9px] font-heading font-extrabold uppercase text-brand-orange-dark tracking-widest flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Avis Maître Tailleur
              </span>
              <p className="text-xs text-brand-black/80 font-body italic leading-relaxed">
                "{savedMeasurements.comment}"
              </p>
            </div>

            {onOpenMeasure && (
              <button
                onClick={onOpenMeasure}
                className="w-full py-3 bg-brand-orange-dark/10 hover:bg-brand-orange-dark/15 border border-brand-orange-dark/20 text-brand-orange-dark rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Camera className="w-4 h-4" />
                Mettre à jour mes mesures par IA
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center border border-white/20 shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-white/40 rounded-full flex items-center justify-center mb-3 text-brand-orange-dark border border-white/40 shadow-inner">
              <Ruler className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-xs font-body font-bold text-brand-black/85">
              Aucune mesure enregistrée
            </p>
            <p className="text-[10px] font-body text-brand-black/60 mt-1 max-w-[250px] mb-4 leading-relaxed">
              Prenez une photo pour que notre IA estime gratuitement vos mensurations couturières de haute précision.
            </p>
            {onOpenMeasure && (
              <button
                onClick={onOpenMeasure}
                className="px-6 py-2.5 bg-brand-orange-dark hover:bg-brand-orange-dark/95 active:scale-95 text-white rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest transition-all shadow-md shadow-brand-orange-dark/15 border border-brand-orange-light/25 flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Lancer l'Analyse IA Gratuite
              </button>
            )}
          </div>
        )}
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-brand-black" />
          <h3 className="font-heading font-bold text-lg text-brand-black">Mes commandes</h3>
        </div>
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-heading font-bold text-brand-black text-sm">{order.id}</p>
                <p className="text-[10px] text-brand-black/60 font-body">{order.date}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                  order.status === 'en cours' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                  {order.status}
                </span>
                <p className="font-heading font-bold text-brand-black mt-1">{order.total} FCFA</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-4">
          <Heart className="w-5 h-5 text-brand-black" />
          <h3 className="font-heading font-bold text-lg text-brand-black">Mes favoris</h3>
        </div>
        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {favoriteProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
            <p className="text-xs font-body text-brand-black/60 italic">Vous n'avez pas encore de favoris.</p>
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-brand-black" />
          <h3 className="font-heading font-bold text-lg text-brand-black">Paramètres</h3>
        </div>
        <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden divide-y divide-white/10 shadow-sm">
          {[
            { icon: Bell, label: 'Notifications' },
            { icon: Globe, label: 'Langue (Français)' },
            ...(onOpenAdmin && user?.email?.toLowerCase() === 'prodioumar910@gmail.com' ? [{ 
              icon: ShieldCheck, 
              label: 'Administration Boutique', 
              onClick: onOpenAdmin 
            }] : []),
            { 
              icon: LogOut, 
              label: 'Déconnexion', 
              onClick: signOut 
            },
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.onClick}
              className="w-full px-4 py-4 flex items-center justify-between group hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-brand-black/70" />
                <span className="text-sm font-body font-medium text-brand-black">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-black/40" />
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
};

export default Profile;
