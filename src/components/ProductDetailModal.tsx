import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingCart, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Plus, 
  Minus, 
  MapPin, 
  User, 
  Phone, 
  Palette, 
  Ruler, 
  CreditCard, 
  Truck, 
  Search, 
  ShoppingBag,
  PlusCircle,
  Trash2,
  Star,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getOptimizedImage } from '../utils/image';
import { Product, Order, OrderItem } from '../types';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, products, addOrder } = useStore();
  const [selectedImg, setSelectedImg] = useState('');
  
  // Checkout flow state
  // 0 = Detail view, 1 = Personal Info, 2 = Product Specs, 3 = Payment/Delivery & Add-ons, 4 = Success Onboarding Card
  const [checkoutStep, setCheckoutStep] = useState(0);

  // Form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientQuarter, setClientQuarter] = useState('');
  
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState('Bleu Royal');
  const [size, setSize] = useState('L');
  const [customColor, setCustomColor] = useState('');
  const [customSize, setCustomSize] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [deliveryMethod, setDeliveryMethod] = useState('Livraison à Domicile');
  
  // Additional addon products added to order
  const [addons, setAddons] = useState<OrderItem[]>([]);
  const [addonSearch, setAddonSearch] = useState('');

  // Reviews systems
  interface Review {
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
  }
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewError, setNewReviewError] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Update selected thumbnail image when product changes
  useEffect(() => {
    if (selectedProduct) {
      setSelectedImg(selectedProduct.image || '');
      // Reset checkout states on changing product
      setCheckoutStep(0);
      setClientName('');
      setClientPhone('');
      setClientQuarter('');
      setQuantity(1);
      
      const defaultColor = selectedProduct.colors && selectedProduct.colors.length > 0
        ? selectedProduct.colors[0]
        : 'Bleu Royal';
      setColor(defaultColor);
      
      setSize('L');
      setCustomColor('');
      setCustomSize('');
      setPaymentMethod('Wave');
      setDeliveryMethod('Livraison à Domicile');
      setAddons([]);
      setAddonSearch('');

      // Load or initialize reviews
      const storedReviewsKey = `habe_reviews_${selectedProduct.id}`;
      const stored = localStorage.getItem(storedReviewsKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Filter out any older mock reviews (by ID prefix or mock names) to keep everything absolutely clean
          const filtered = Array.isArray(parsed)
            ? parsed.filter((r: any) => 
                r && 
                r.id && 
                !r.id.startsWith('rev-1') && 
                !r.id.startsWith('rev-2') && 
                !r.id.startsWith('rev-3') &&
                r.author !== 'Abdoulaye Touré' &&
                r.author !== 'Fatoumata Diarra' &&
                r.author !== 'Moussa Traoré'
              )
            : [];
          
          if (filtered.length !== parsed.length) {
            localStorage.setItem(storedReviewsKey, JSON.stringify(filtered));
          }
          setReviews(filtered);
        } catch (e) {
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
      setNewReviewAuthor('');
      setNewReviewRating(5);
      setNewReviewComment('');
      setNewReviewError('');
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  // Additional products from catalog to pick as addons
  const availableAddons = products.filter(p => p.id !== selectedProduct.id && !addons.some(a => a.productId === p.id));
  const filteredAddons = availableAddons.filter(p => 
    p.name.toLowerCase().includes(addonSearch.toLowerCase()) || 
    p.category.toLowerCase().includes(addonSearch.toLowerCase())
  );

  const finalColor = color === 'Autre' ? (customColor || 'Couleur personnalisée') : color;
  const finalSize = size === 'Sur Mesure' ? (customSize || 'Sur Mesure') : size;

  // Calculate order total
  const primaryItemTotal = selectedProduct.price * quantity;
  const addonsTotal = addons.reduce((acc, ad) => acc + (ad.price * ad.quantity), 0);
  const totalAmount = primaryItemTotal + addonsTotal;

  // Handle addition of an addon
  const handleAddAddon = (product: Product) => {
    const newAddon: OrderItem = {
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      size: 'L',
      color: 'Noir',
      image: product.image
    };
    setAddons(prev => [...prev, newAddon]);
  };

  const handleRemoveAddon = (id: string) => {
    setAddons(prev => prev.filter(ad => ad.productId !== id));
  };

  const handleUpdateAddonQty = (id: string, dir: 'inc' | 'dec') => {
    setAddons(prev => prev.map(ad => {
      if (ad.productId === id) {
        const newQty = dir === 'inc' ? ad.quantity + 1 : Math.max(1, ad.quantity - 1);
        return { ...ad, quantity: newQty };
      }
      return ad;
    }));
  };

  // Submit order action
  const handleOrderSubmit = () => {
    if (!clientName.trim() || !clientPhone.trim() || !clientQuarter.trim()) {
      setCheckoutStep(1); // Go back to step 1 for correct form values
      return;
    }

    // 1. Compose items list
    const itemsList: OrderItem[] = [
      {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        size: finalSize,
        color: finalColor,
        image: selectedProduct.image
      },
      ...addons
    ];

    // 2. Generate Order details
    const newOrder: Order = {
      id: `CMD-${Date.now()}`,
      date: new Date().toISOString(),
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientQuarter: clientQuarter.trim(),
      items: itemsList,
      paymentMethod,
      deliveryMethod,
      total: totalAmount,
      status: 'en cours'
    };

    // Save order physically inside App DB/LocalStorage context
    addOrder(newOrder);

    // 3. Compose elegant WhatsApp message format
    let itemsText = `1. *${selectedProduct.name}*\n   • Quantité: ${quantity}\n   • Taille: ${finalSize}\n   • Couleur: ${finalColor}\n   • Prix: ${selectedProduct.price.toLocaleString('fr-FR')} FCFA`;
    
    addons.forEach((ad, index) => {
      itemsText += `\n\n${index + 2}. *${ad.productName}*\n   • Quantité: ${ad.quantity}\n   • Taille: ${ad.size}\n   • Couleur: ${ad.color}\n   • Prix: ${ad.price.toLocaleString('fr-FR')} FCFA (Add-on)`;
    });

    const waMessage = `🔴 *NOUVELLE COMMANDE - HABÉ TEXTILE* 🔴

👤 *COORDONNÉES CLIENT :*
• *Nom:* ${clientName.trim()}
• *Téléphone:* ${clientPhone.trim()}
• *Quartier:* ${clientQuarter.trim()}

📦 *DÉTAILS DES ARTICLES :*
${itemsText}

💳 *LIVRAISON & PAIEMENT :*
• *Mode de livraison:* ${deliveryMethod}
• *Mode de paiement:* ${paymentMethod}

💰 *MONTANT TOTAL DÛ :*
• *${totalAmount.toLocaleString('fr-FR')} FCFA*

_Merci de confirmer ma commande ainsi que les délais de confection. À bientôt !_`;

    // 4. Redirect to WhatsApp API
    const targetWhatsApp = "22394077011";
    const waUrl = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(waMessage)}`;
    
    window.open(waUrl, '_blank');

    // 5. Shift state to step 4 (Success Panel)
    setCheckoutStep(4);
  };

  const sizesOptions = ['S', 'M', 'L', 'XL', 'XXL', 'Sur Mesure'];
  const colorsOptions = selectedProduct.colors && selectedProduct.colors.length > 0
    ? [...selectedProduct.colors, 'Autre']
    : ['Bleu Royal', 'Blanc Pur', 'Doré Traditionnel', 'Noir Intense', 'Vert Émeraude', 'Autre'];

  const paymentOptions = [
    { name: 'Wave', desc: 'Paiement mobile instantané rapide', color: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10' },
    { name: 'Orange Money', desc: 'Frais réduits par transfert direct', color: 'border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10' },
    { name: 'Espèces', desc: 'Payez en espèces lors du retrait ou livraison', color: 'border-stone-500/20 bg-stone-500/5 hover:bg-stone-500/10' }
  ];

  const deliveryOptions = [
    { name: 'Livraison à Domicile', desc: 'Coursier express dans Bamako' },
    { name: 'Retrait en Boutique', desc: 'Récupérez vos vêtements à notre atelier' },
    { name: 'Point de Livraison / Relais', desc: 'Retrait dans un comptoir agréé' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] bg-brand-black/98 overflow-y-auto text-white select-none">
        
        {/* Absolute Close Button */}
        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="fixed top-6 right-6 z-[100002] p-3 rounded-full bg-white text-brand-black hover:bg-brand-orange-light hover:text-white transition-all shadow-2xl active:scale-95 flex items-center justify-center cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="min-h-screen flex items-center justify-center p-4 py-16 md:py-24">
          
          {checkoutStep === 0 ? (
            /* =======================================================
               PRODUCT DETAIL SCREEN (STEP 0)
               ======================================================= */
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="w-full max-w-4xl bg-stone-900/95 backdrop-blur-md rounded-3xl border border-white/10 p-6 md:p-8 flex flex-col gap-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left side: Images */}
                <div className="flex flex-col gap-4">
                  <div className="aspect-[3/4] rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-white/5 relative">
                    {selectedImg ? (
                      <img
                        src={getOptimizedImage(selectedImg, 600)}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center font-mono text-xs text-stone-500">
                        Aucun visuel disponible
                      </div>
                    )}
                  </div>
                  
                  {/* Thumbnail gallery if image2 or image3 is set */}
                  {(selectedProduct.image2 || selectedProduct.image3) && (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setSelectedImg(selectedProduct.image)}
                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImg === selectedProduct.image ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={getOptimizedImage(selectedProduct.image, 150)} alt="image 1" className="w-full h-full object-cover pointer-events-none" />
                      </button>
                      {selectedProduct.image2 && (
                        <button
                          onClick={() => setSelectedImg(selectedProduct.image2!)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImg === selectedProduct.image2 ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={getOptimizedImage(selectedProduct.image2, 150)} alt="image 2" className="w-full h-full object-cover pointer-events-none" />
                        </button>
                      )}
                      {selectedProduct.image3 && (
                        <button
                          onClick={() => setSelectedImg(selectedProduct.image3!)}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                            selectedImg === selectedProduct.image3 ? 'border-brand-orange-light animate-pulse' : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={getOptimizedImage(selectedProduct.image3, 150)} alt="image 3" className="w-full h-full object-cover pointer-events-none" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: Information */}
                <div className="flex flex-col justify-between text-left h-full">
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-orange-light tracking-[0.25em] block mb-2">
                        {selectedProduct.category} • {selectedProduct.target}
                      </span>
                      <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-white uppercase">
                        {selectedProduct.name}
                      </h2>
                      <div className="w-12 h-[2px] bg-brand-orange-light mt-3" />
                    </div>

                    {/* Price Block */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Prix unitaire</span>
                      <span className="font-heading font-black text-2xl text-white">
                        {selectedProduct.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    {/* Badges / Specifications */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block tracking-widest mb-1">Tissu</span>
                        <span className="text-xs font-semibold uppercase font-heading text-stone-200">
                          {selectedProduct.fabricType || 'Coton'}
                        </span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase font-bold text-stone-500 block tracking-widest mb-1">Type</span>
                        <span className="text-xs font-semibold uppercase font-heading text-stone-200">
                          {selectedProduct.garmentType || 'Vêtement'}
                        </span>
                      </div>
                    </div>

                    {/* Premium Description */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest block">Description du modèle</span>
                      <p className="text-xs font-body font-normal text-stone-300 leading-relaxed">
                        {selectedProduct.description ? selectedProduct.description : (
                          <>
                            Cette superbe pièce de haute couture signée par la maison <strong className="text-brand-orange-light font-bold">Habé Textile</strong> est le symbole suprême de raffinement et d'authenticité. Conçue avec des finitions d'excellence à la main, elle assure une silhouette majestueuse et un confort haut de gamme pour toutes vos grandes occasions.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-white/10">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="w-full py-4 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white font-heading font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-orange-dark/20 hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Commander</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        // Custom Toast trigger indicator
                        const toast = document.createElement('div');
                        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[200000] bg-emerald-600 text-white font-heading font-bold px-6 py-3 rounded-full shadow-2xl tracking-wide text-xs uppercase transition-all duration-300';
                        toast.innerText = 'Ajouté au panier !';
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2500);
                      }}
                      className="w-full py-3.5 rounded-xl border border-white/20 text-white hover:bg-white/5 font-body font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Ajouter au Panier</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION RETOURS ET AVIS CLIENTS */}
              <div className="border-t border-white/10 pt-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-extrabold text-base md:text-lg text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-brand-orange-light" />
                      Avis des Clients ({reviews.length})
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">Ce que pensent nos acquéreurs de cette pièce</p>
                  </div>
                  
                  {/* Global rating overview card */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 rounded-xl self-start sm:self-center">
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-semibold text-stone-400 block tracking-wider leading-none mb-0.5">Note globale</span>
                        <div className="flex items-center gap-1">
                          <span className="text-lg font-heading font-black text-white">
                            {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                          </span>
                          <span className="text-stone-500 font-mono text-[10px]">/ 5</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => {
                            const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
                            return (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-[9px] font-mono text-stone-500">{reviews.length} retours</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left column: Feed of reviews */}
                  <div className="lg:col-span-7 space-y-3.5 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 space-y-1.5">
                        <Star className="w-6 h-6 text-stone-600 mx-auto opacity-50" />
                        <p className="text-xs font-semibold text-stone-400">Aucun avis pour le moment</p>
                        <p className="text-[10px] text-stone-500">Soyez le premier à partager votre expérience !</p>
                      </div>
                    ) : (
                      reviews.map((rev) => {
                        const initials = rev.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                        return (
                          <div key={rev.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-brand-orange-dark/20 border border-brand-orange-light/20 flex items-center justify-center text-[10px] font-bold text-brand-orange-light font-heading tracking-wider">
                                  {initials || 'U'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-white">{rev.author}</span>
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[8px] font-semibold tracking-wide">
                                      Achat vérifié
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-stone-500 font-mono">{rev.date}</span>
                                </div>
                              </div>

                              {/* Review Stars */}
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed font-body">
                              {rev.comment}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right column: Form to submit your review */}
                  <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-3.5">
                    <div className="text-left">
                      <h4 className="font-heading font-bold text-xs text-stone-200 uppercase tracking-widest">Partagez votre avis</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5">Votre expérience nous aide à préserver notre excellence.</p>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReviewAuthor.trim()) {
                          setNewReviewError('Veuillez entrer votre nom.');
                          return;
                        }
                        if (!newReviewComment.trim()) {
                          setNewReviewError('Veuillez écrire un commentaire.');
                          return;
                        }
                        
                        const submittedReview: Review = {
                          id: `rev-custom-${Date.now()}`,
                          author: newReviewAuthor.trim(),
                          rating: newReviewRating,
                          comment: newReviewComment.trim(),
                          date: new Date().toLocaleDateString('fr-FR')
                        };

                        const updatedList = [submittedReview, ...reviews];
                        setReviews(updatedList);
                        localStorage.setItem(`habe_reviews_${selectedProduct.id}`, JSON.stringify(updatedList));

                        // Toast confirmation
                        const toast = document.createElement('div');
                        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[200000] bg-emerald-600 text-white font-heading font-bold px-6 py-3 rounded-full shadow-2xl tracking-wide text-xs uppercase transition-all duration-300';
                        toast.innerText = 'Merci pour votre avis !';
                        document.body.appendChild(toast);
                        setTimeout(() => toast.remove(), 2500);

                        // Clear form
                        setNewReviewAuthor('');
                        setNewReviewComment('');
                        setNewReviewRating(5);
                        setNewReviewError('');
                      }}
                      className="space-y-3 text-left"
                    >
                      {/* Name field */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">Nom Complet</label>
                        <input
                          type="text"
                          placeholder="Ex: Oumar Diallo"
                          value={newReviewAuthor}
                          onChange={(e) => setNewReviewAuthor(e.target.value)}
                          className="w-full bg-stone-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:ring-1 focus:ring-brand-orange-light focus:border-brand-orange-light outline-none transition-all placeholder-stone-700 font-body"
                        />
                      </div>

                      {/* Stars system selector */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-stone-400 block">Note du modèle</label>
                        <div className="flex items-center gap-1.5 py-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setNewReviewRating(s)}
                              onMouseEnter={() => setHoveredStar(s)}
                              onMouseLeave={() => setHoveredStar(null)}
                              className="focus:outline-none cursor-pointer p-0.5 active:scale-90 transition-transform"
                            >
                              <Star
                                className={`w-4.5 h-4.5 transition-all duration-150 ${
                                  s <= (hoveredStar ?? newReviewRating)
                                    ? 'text-amber-400 fill-amber-400 scale-105'
                                    : 'text-stone-700 hover:text-stone-500'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment text area */}
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider font-semibold text-stone-400">Votre Commentaire</label>
                        <textarea
                          rows={3}
                          placeholder="Ex: Coupe parfaite, détails soignés, le bazin de qualité supérieure..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full bg-stone-950 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:ring-1 focus:ring-brand-orange-light focus:border-brand-orange-light outline-none transition-all placeholder-stone-700 font-body resize-none"
                        />
                      </div>

                      {newReviewError && (
                        <p className="text-[10px] text-red-400 font-semibold">{newReviewError}</p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-brand-orange-dark hover:bg-brand-orange-dark/90 text-white font-heading font-black text-[10px] uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        Soumettre mon avis
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* =======================================================
               MULTI-STEP WIZARD CHECKOUT PROCESS
               ======================================================= */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl bg-stone-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative text-left select-none overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Stepper progress bar */}
              {checkoutStep <= 3 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() => setCheckoutStep(0)}
                      className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-all font-heading font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Infos Modèle
                    </button>
                    <span className="text-xs font-mono text-brand-orange-light font-bold">
                      Étape {checkoutStep} de 3
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-orange-light"
                      initial={{ width: '0%' }}
                      animate={{ width: `${(checkoutStep / 3) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Step status nodes indicators */}
                  <div className="grid grid-cols-3 mt-4 text-center">
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${checkoutStep >= 1 ? 'text-brand-orange-light' : 'text-stone-500'}`}>
                      1. Coordonnées
                    </div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${checkoutStep >= 2 ? 'text-brand-orange-light' : 'text-stone-500'}`}>
                      2. Options Mesures
                    </div>
                    <div className={`text-[10px] uppercase font-bold tracking-wider ${checkoutStep >= 3 ? 'text-brand-orange-light' : 'text-stone-500'}`}>
                      3. Paiement & Extras
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Personal Coordinates */}
              {checkoutStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">Identité & Coordonnées</h3>
                    <p className="text-xs text-stone-400 mt-1">Renseignez vos coordonnées de livraison personnelles.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Input Nom */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-orange-light" />
                        Nom Complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Ex: Oumar Diarra"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange-light focus:ring-1 focus:ring-brand-orange-light transition-all"
                      />
                    </div>

                    {/* Input Téléphone */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-brand-orange-light" />
                        Numéro de téléphone WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Ex: 223 94 07 70 11"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange-light focus:ring-1 focus:ring-brand-orange-light transition-all"
                      />
                    </div>

                    {/* Input Quartier */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange-light" />
                        Quartier & Ville <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={clientQuarter}
                        onChange={(e) => setClientQuarter(e.target.value)}
                        placeholder="Ex: Badalabougou, Bamako"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-orange-light focus:ring-1 focus:ring-brand-orange-light transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-between gap-4">
                    <button
                      onClick={() => setCheckoutStep(0)}
                      className="px-6 py-3.5 rounded-xl border border-white/10 text-xs font-heading font-extrabold uppercase tracking-wider text-stone-300 hover:bg-white/5 transition-all text-center"
                    >
                      Retour
                    </button>
                    <button
                      disabled={!clientName.trim() || !clientPhone.trim() || !clientQuarter.trim()}
                      onClick={() => setCheckoutStep(2)}
                      className="flex-1 bg-brand-orange-dark hover:bg-brand-orange-dark/95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Product Specifications (Qty, Color, Size) */}
              {checkoutStep === 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">Quantité, Couleur & Taille</h3>
                    <p className="text-xs text-stone-400 mt-1">Configurez les caractéristiques de fabrication pour {selectedProduct.name}.</p>
                  </div>

                  <div className="space-y-5">
                    {/* Quantity Choice */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white uppercase">Quantité souhaitée</span>
                        <p className="text-[10px] text-stone-400">Combien d'exemplaires souhaitez-vous ?</p>
                      </div>
                      <div className="flex items-center gap-4 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                        <button
                          onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-white hover:bg-brand-orange-light active:scale-95 transition-all cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-heading font-bold text-base w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-stone-800 flex items-center justify-center text-white hover:bg-brand-orange-light active:scale-95 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <Ruler className="w-3.5 h-3.5 text-brand-orange-light" />
                        Taille / Mensuration <span className="text-red-500">*</span>
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {sizesOptions.map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSize(sz)}
                            className={`py-3 rounded-xl border text-xs font-heading font-bold transition-all uppercase cursor-pointer ${
                              size === sz 
                                ? 'border-brand-orange-light bg-brand-orange-light/10 text-brand-orange-light shadow'
                                : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>

                      {/* Custom Size Field */}
                      {size === 'Sur Mesure' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2"
                        >
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-brand-orange-light">
                            Vos mensurations spécifiques
                          </span>
                          <input
                            type="text"
                            required
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            placeholder="Ex: Épaules: 45cm, Poitrine: 98cm, Hauteur: 140cm"
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-orange-light transition-all"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Color Selector */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-brand-orange-light" />
                        Couleur demandée <span className="text-red-500">*</span>
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {colorsOptions.map((col) => (
                          <button
                            key={col}
                            onClick={() => setColor(col)}
                            className={`py-3 px-2.5 rounded-xl border text-xs font-heading font-bold text-center transition-all cursor-pointer ${
                              color === col 
                                ? 'border-brand-orange-light bg-brand-orange-light/10 text-brand-orange-light shadow'
                                : 'border-white/10 bg-white/5 text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            {col}
                          </button>
                        ))}
                      </div>

                      {/* Custom Color Field */}
                      {color === 'Autre' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2"
                        >
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-brand-orange-light">
                            Décrivez la couleur souhaitée
                          </span>
                          <input
                            type="text"
                            required
                            value={customColor}
                            onChange={(e) => setCustomColor(e.target.value)}
                            placeholder="Ex: Blanc cassé brillant, Bazin teinté indigo foncé, etc."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-orange-light transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                    <button
                      onClick={() => setCheckoutStep(1)}
                      className="px-6 py-3.5 rounded-xl border border-white/10 text-xs font-heading font-extrabold uppercase tracking-wider text-stone-300 hover:bg-white/5 transition-all text-center cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      disabled={(size === 'Sur Mesure' && !customSize.trim()) || (color === 'Autre' && !customColor.trim())}
                      onClick={() => setCheckoutStep(3)}
                      className="flex-1 bg-brand-orange-dark hover:bg-brand-orange-dark/95 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Payment, Delivery & Dynamic Addons */}
              {checkoutStep === 3 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 max-h-[80vh] overflow-y-auto pr-1"
                >
                  <div>
                    <h3 className="font-heading font-extrabold text-lg text-white uppercase tracking-wider">Paiement, Livraison & Extras</h3>
                    <p className="text-xs text-stone-400 mt-1">Finalisez votre commande et découvrez des articles de notre collection.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Payment methods list */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-brand-orange-light" />
                        Mode de paiement préféré <span className="text-red-500">*</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {paymentOptions.map((opt) => (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setPaymentMethod(opt.name)}
                            className={`p-3.5 rounded-xl border text-left transition-all ${
                              paymentMethod === opt.name
                                ? `${opt.color} border-brand-orange-light text-white ring-1 ring-brand-orange-light`
                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-heading font-extrabold">{opt.name}</span>
                              {paymentMethod === opt.name && <Check className="w-3.5 h-3.5 text-brand-orange-light" />}
                            </div>
                            <p className="text-[9px] text-stone-400 mt-1 line-clamp-2 leading-snug">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Options */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-orange-light" />
                        Option de Livraison <span className="text-red-500">*</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {deliveryOptions.map((opt) => (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setDeliveryMethod(opt.name)}
                            className={`p-3.5 rounded-xl border text-left transition-all ${
                              deliveryMethod === opt.name
                                ? 'border-brand-orange-light bg-brand-orange-light/10 text-white shadow'
                                : 'border-white/10 bg-white/5 hover:bg-white/10 text-stone-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-heading font-extrabold">{opt.name}</span>
                              {deliveryMethod === opt.name && <Check className="w-3.5 h-3.5 text-brand-orange-light" />}
                            </div>
                            <p className="text-[9px] text-stone-400 mt-1 line-clamp-2 leading-snug">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ADD MORE PRODUCTS (CROSS-SELL SECTION) */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-heading font-extrabold uppercase text-white tracking-widest flex items-center gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5 text-brand-orange-light" />
                          Ajouter d'autres produits à la commande ?
                        </span>
                        <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                          {availableAddons.length} disponibles
                        </span>
                      </div>

                      {/* Addons Search */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                        <input
                          type="text"
                          value={addonSearch}
                          onChange={(e) => setAddonSearch(e.target.value)}
                          placeholder="Rechercher des chapeaux, chaussures, accessoires..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-brand-orange-light"
                        />
                      </div>

                      {/* Horizontal add products list */}
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800">
                        {filteredAddons.slice(0, 8).map((p) => (
                          <div 
                            key={p.id}
                            className="w-36 bg-black/40 border border-white/5 rounded-xl p-2.5 flex-shrink-0 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="aspect-square bg-stone-900 rounded-lg overflow-hidden border border-white/5">
                                <img src={p.image || '/logo.png'} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-[10px] font-heading font-extrabold truncate text-white uppercase">{p.name}</h4>
                                <span className="text-[9px] text-stone-400">{p.price.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddAddon(p)}
                              className="mt-2 w-full py-1 bg-white/10 hover:bg-brand-orange-light hover:text-white rounded-lg text-[9px] font-heading font-black uppercase tracking-wider text-stone-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              Ajouter
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Added Addons list summary with sizing */}
                      {addons.length > 0 && (
                        <div className="space-y-2.5 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 block mb-1">
                            Articles additionnels inclus ({addons.length})
                          </span>
                          <div className="divide-y divide-white/5 space-y-2">
                            {addons.map((ad) => (
                              <div key={ad.productId} className="flex gap-3 items-center pt-2 first:pt-0 justify-between">
                                <div className="flex gap-2 items-center">
                                  <div className="w-8 h-8 rounded-md overflow-hidden bg-stone-900 border border-white/10">
                                    <img src={ad.image} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                    <h5 className="text-[10px] font-bold text-white uppercase line-clamp-1">{ad.productName}</h5>
                                    <p className="text-[9px] text-brand-orange-light font-bold">
                                      {ad.price.toLocaleString('fr-FR')} FCFA
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Custom spec options directly for added items */}
                                <div className="flex items-center gap-3">
                                  {/* Size selection */}
                                  <select 
                                    className="bg-stone-800 border border-white/10 rounded px-1.5 py-0.5 text-[9px] focus:outline-none"
                                    value={ad.size}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setAddons(prev => prev.map(item => item.productId === ad.productId ? { ...item, size: val } : item));
                                    }}
                                  >
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                  </select>

                                  {/* Qty count */}
                                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                                    <button
                                      onClick={() => handleUpdateAddonQty(ad.productId, 'dec')}
                                      className="text-stone-400 hover:text-white"
                                    >
                                      -
                                    </button>
                                    <span className="text-[9px] font-bold w-3 text-center">{ad.quantity}</span>
                                    <button
                                      onClick={() => handleUpdateAddonQty(ad.productId, 'inc')}
                                      className="text-stone-400 hover:text-white"
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* Trash delete button */}
                                  <button
                                    onClick={() => handleRemoveAddon(ad.productId)}
                                    className="p-1 rounded bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Final Receipts Card / Facture Récapitulative */}
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                      <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold text-stone-500">Facturation Récapitulative</span>
                      <div className="space-y-1.5 mt-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-400">{selectedProduct.name} (x{quantity})</span>
                          <span>{primaryItemTotal.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        {addons.map((ad) => (
                          <div key={ad.productId} className="flex justify-between text-stone-400 text-[11px]">
                            <span>+ {ad.productName} (x{ad.quantity})</span>
                            <span>{(ad.price * ad.quantity).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        ))}
                        <div className="w-full h-px bg-white/10 my-1" />
                        <div className="flex justify-between font-heading font-black text-sm text-brand-orange-light">
                          <span>MONTANT TOTAL DÛ</span>
                          <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                    <button
                      onClick={() => setCheckoutStep(2)}
                      className="px-6 py-3.5 rounded-xl border border-white/10 text-xs font-heading font-extrabold uppercase tracking-wider text-stone-300 hover:bg-white/5 transition-all text-center cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      onClick={handleOrderSubmit}
                      className="flex-1 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white py-3.5 rounded-xl font-heading font-black text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-bounce" />
                      <span>Confirmer la commande</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* SUCCESS OVERLAY (STEP 4) */}
              {checkoutStep === 4 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-6"
                >
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 text-emerald-400 mb-2">
                    <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading font-black text-2xl uppercase tracking-wider text-white">Commande Enregistrée !</h3>
                    <p className="text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                      Félicitations, votre commande a été finalisée avec succès sur <strong className="text-brand-orange-light">Habé Textile</strong> ! Une fenêtre WhatsApp s'est ouverte pour finaliser la transmission directe.
                    </p>
                    <p className="text-[11px] text-stone-500 italic">
                      Les détails de la commande ont également été envoyés à l'interface d'administration de la boutique.
                    </p>
                  </div>

                  {/* Summary order receipt detail list */}
                  <div className="bg-white/5 rounded-2xl border border-white/5 p-4 max-w-sm mx-auto text-left space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Client:</span>
                      <span className="font-bold">{clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Téléphone:</span>
                      <span className="font-bold">{clientPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Quartier:</span>
                      <span className="font-bold">{clientQuarter}</span>
                    </div>
                    <div className="border-t border-white/10 my-1 w-full" />
                    <div className="flex justify-between text-brand-orange-light font-bold uppercase tracking-wider">
                      <span>Total facturé:</span>
                      <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setCheckoutStep(0);
                      }}
                      className="px-8 py-3 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white font-heading font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Retourner à la boutique
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </AnimatePresence>
  );
};
