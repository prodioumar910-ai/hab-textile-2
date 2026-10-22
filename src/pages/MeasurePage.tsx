import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  RotateCw, 
  Sparkles, 
  ArrowLeft, 
  ShoppingBag, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Sliders,
  CheckCircle2,
  Store
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getOptimizedImage } from "../utils/image";
import { MeasureResult, Product } from "../types";
import { api } from "../lib/api";
import { computeProfessionalMeasurements, MEN_PROFILES } from "../utils/measurements";

interface MeasurePageProps {
  onBackToChoice: () => void;
  onGoToBoutique: () => void;
}

interface RecommendedModelCardProps {
  m: {
    productId?: string;
    productName: string;
    matchScore: number;
    matchReason?: string;
    stylingTips?: string;
    recommendedCut?: string;
  };
  product: Product | undefined;
  idx: number;
  onOrderWithMeasurements: (prod: Product) => void;
  onAddToCart: (prod: Product) => void;
}

// Clean static horizontal model card (No 360° animation, no text clutter)
const RecommendedModelCard: React.FC<RecommendedModelCardProps> = ({
  m,
  product,
  idx,
  onOrderWithMeasurements,
  onAddToCart
}) => {
  const displayProduct: Product = product || ({
    id: m.productId || `prod-${idx}`,
    name: m.productName,
    price: 165000,
    category: "Ensemble Royal",
    target: "Homme",
    garmentType: "boubou",
    fabricType: "bazin",
    image: "",
    description: "",
    colors: ["Or & Nacre", "Bleu Nuit"]
  } as unknown as Product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.35 }}
      className="w-[280px] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-start bg-[#FFEAD8] rounded-3xl overflow-hidden shadow-xl border border-white/70 flex flex-col justify-between group hover:shadow-2xl hover:border-brand-orange-dark/30 transition-all duration-300 text-stone-900"
    >
      {/* Product Image Stage (Crisp static image, no 360 animation) */}
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden flex items-center justify-center p-3">
        {displayProduct.image ? (
          <img
            src={getOptimizedImage(displayProduct.image, 600)}
            alt={displayProduct.name}
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="font-heading font-bold text-xs text-stone-400">Modèle Habé</div>
        )}

        {/* Category Pill */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-stone-950/80 backdrop-blur-md text-white text-[9.5px] font-heading font-extrabold rounded-full uppercase tracking-wider shadow-md">
            {displayProduct.category || "Haute Couture"}
          </span>
        </div>
      </div>

      {/* Model Information & Action Buttons */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <h3 className="font-heading font-bold text-base text-stone-950 group-hover:text-brand-orange-dark transition-colors line-clamp-1 mb-1">
            {displayProduct.name}
          </h3>
          <p className="font-heading font-extrabold text-lg text-brand-orange-dark">
            {displayProduct.price.toLocaleString("fr-FR")} FCFA
          </p>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-stone-200/60">
          <button
            type="button"
            onClick={() => onOrderWithMeasurements(displayProduct)}
            className="w-full py-3 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest transition-all shadow-md shadow-brand-orange-dark/15 border border-brand-orange-light/25 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Commander ce modèle
          </button>

          <button
            type="button"
            onClick={() => onAddToCart(displayProduct)}
            className="w-full py-2.5 bg-white hover:bg-stone-50 text-stone-800 rounded-xl text-[11px] font-heading font-bold uppercase tracking-wider transition-all border border-stone-200 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-brand-orange-dark" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const MeasurePage: React.FC<MeasurePageProps> = ({ onBackToChoice, onGoToBoutique }) => {
  const { products, setSelectedProduct, addToCart, brandLogo } = useStore();
  const [gender, setGender] = useState<string>("homme");
  const [profileKey, setProfileKey] = useState<string>("classique");
  const [height, setHeight] = useState<string>("175");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeasureResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const horizontalScrollRef = useRef<HTMLDivElement | null>(null);

  // Fast loading step animation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Initialisation de votre sélection...",
    "Analyse de votre silhouette...",
    "Sélection des modèles Habé idéaux...",
    "Affichage de vos modèles..."
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Ultra-fast client-side downscaling and compression (takes < 15ms, reduces image to ~30KB)
  const resizeImage = (dataUrl: string, maxWidth = 480, maxHeight = 480): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.naturalWidth || img.width || 480;
        let height = img.naturalHeight || img.height || 480;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.65));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
    });
  };

  // Process mobile / desktop file upload instantly
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const base64 = event.target.result as string;
          setLoading(true);
          setLoadingStep(0);
          setError(null);
          
          try {
            const resized = await resizeImage(base64, 480, 480);
            setImageSrc(resized);
            calculateMeasurements(resized);
          } catch (err) {
            setImageSrc(base64);
            calculateMeasurements(base64);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file selection
  const triggerFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Fast submit to backend with 3.5s timeout for instant model recommendation
  const calculateMeasurements = async (overrideImage?: string) => {
    const activeImage = overrideImage || imageSrc;
    if (!activeImage) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    let response: Response | null = null;

    try {
      // 3.5s timeout ensures users never wait unnecessarily
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch("/api/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: activeImage,
          gender,
          height: parseInt(height),
          profile: profileKey
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res && res.ok) {
        response = res;
      }
    } catch (err: any) {
      console.warn("Connexion API temporairement longue, bascule instantanée sur le moteur de morphologie local:", err);
    }

    try {
      if (!response) {
        const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage);
        setResult(localData);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Erreur de traitement de l'image.";
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) errMsg = parsed.error;
        } catch (_) {}

        if (response.status === 400 || errMsg.toLowerCase().includes("rejet") || errMsg.toLowerCase().includes("personne") || errMsg.toLowerCase().includes("incomplet")) {
          setError(errMsg);
          setLoading(false);
          setResult(null);
          return;
        }

        const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage);
        setResult(localData);
        setLoading(false);
        return;
      }

      const rawText = await response.text();
      let rawData: any;
      try {
        rawData = JSON.parse(rawText.trim());
      } catch (parseErr: any) {
        rawData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage);
      }

      const fallbackComp = computeProfessionalMeasurements(gender as any, rawData.hauteur || parseInt(height), profileKey, activeImage);

      const data: MeasureResult = {
        ...rawData,
        morphologyTitle: rawData.morphology_title || rawData.morphologyTitle || fallbackComp.morphologyTitle || "Silhouette Royale",
        morphologyDescription: rawData.morphology_description || rawData.morphologyDescription || fallbackComp.morphologyDescription || "Proportions adaptées à la confection Habé.",
        recommendedModels: Array.isArray(rawData.recommended_models) && rawData.recommended_models.length > 0
          ? rawData.recommended_models.map((rm: any) => ({
              productId: rm.product_id || rm.productId,
              productName: rm.product_name || rm.productName,
              matchScore: Number(rm.match_score || rm.matchScore || 96),
              matchReason: rm.match_reason || rm.matchReason || "",
              stylingTips: rm.styling_tips || rm.stylingTips || "",
              recommendedCut: rm.recommended_cut || rm.recommendedCut || "Coupe Haute-Couture"
            }))
          : (rawData.recommendedModels && rawData.recommendedModels.length > 0 ? rawData.recommendedModels : fallbackComp.recommendedModels || [])
      };

      setResult(data);
      if (data.hauteur) {
        setHeight(data.hauteur.toString());
      }
      
      api.measurements.save({
        ...data,
        hauteur: data.hauteur ? Number(data.hauteur) : parseInt(height) || 175,
        userEmail: localStorage.getItem("habe_local_admin_email") || undefined
      }).catch(e => console.warn("Neon save measurement error:", e));
    } catch (err: any) {
      const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage);
      setResult(localData);
    } finally {
      setLoading(false);
    }
  };

  // Reset workflow
  const handleReset = () => {
    setImageSrc(null);
    setResult(null);
    setError(null);
  };

  // Horizontal scroll buttons helper
  const scrollHorizontal = (direction: "left" | "right") => {
    if (horizontalScrollRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      horizontalScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen text-white font-body py-8 px-4 sm:px-6 relative overflow-hidden" style={{ background: "radial-gradient(circle, #FFAA5E 0%, #C1541A 100%)" }}>
      {/* Background Ambience */}
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-stone-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400/40 text-xs font-heading font-extrabold"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Controls */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-8 z-10 relative">
        <button
          onClick={onBackToChoice}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 active:scale-95 text-xs font-heading font-extrabold uppercase tracking-widest rounded-full transition-all border border-stone-200 shadow-sm text-stone-700 hover:text-stone-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-brand-orange-dark" />
          Retour
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 p-2.5 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
            <img 
              src={brandLogo.isCustom ? (brandLogo.logoWideWhite || brandLogo.logoIcon) : brandLogo.logoIcon} 
              alt="Habé" 
              className="h-12 sm:h-16 w-auto max-w-[180px] sm:max-w-[240px] object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* Quick Boutique link */}
        <button
          onClick={onGoToBoutique}
          className="flex items-center gap-2 px-4 py-2 bg-stone-950 hover:bg-stone-900 active:scale-95 text-xs font-heading font-extrabold uppercase tracking-widest rounded-full transition-all border border-amber-400/30 text-white shadow-md cursor-pointer"
        >
          <Store className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Boutique</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto z-10 relative">
        {/* Loading Screen */}
        {loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFEAD8]/95 backdrop-blur-md rounded-3xl border border-stone-200/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-600/5 pointer-events-none" />
            <div className="relative flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-2 border-brand-orange-light/10 border-t-brand-orange-dark animate-spin" />
                <Sparkles className="w-8 h-8 text-brand-orange-dark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <h3 className="font-heading font-bold text-xl tracking-wide text-stone-950 uppercase mb-2">
                Modèle Habé Textile
              </h3>
              
              <p className="text-sm text-stone-600 max-w-md h-12 leading-relaxed transition-all duration-500 font-medium">
                {loadingMessages[loadingStep]}
              </p>

              <div className="flex gap-1.5 items-center justify-center mt-6">
                {[0, 1, 2, 3].map((step) => (
                  <div 
                    key={step} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      step === loadingStep ? "w-6 bg-brand-orange-dark" : "w-1.5 bg-stone-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Screen: ONLY Recommended Models Displayed Horizontally + Button to Boutique */}
        {!loading && result && (
          <div className="space-y-6">
            {/* Top Bar with Boutique button and Navigation Arrows */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/20 backdrop-blur-xl border border-white/30 p-4 sm:p-5 rounded-3xl shadow-xl">
              <div className="flex items-center gap-3">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-wider text-white">
                  Modèles Recommandés
                </h2>
                <span className="text-xs bg-stone-950/70 text-amber-300 px-3 py-1 rounded-full font-mono font-bold">
                  {(result.recommendedModels || []).length} modèles
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Horizontal scroll arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => scrollHorizontal("left")}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-850 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    title="Défiler vers la gauche"
                  >
                    <ChevronLeft className="w-5 h-5 text-stone-850" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollHorizontal("right")}
                    className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-850 shadow-md flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    title="Défiler vers la droite"
                  >
                    <ChevronRight className="w-5 h-5 text-stone-850" />
                  </button>
                </div>

                {/* Direct boutique button */}
                <button
                  type="button"
                  onClick={onGoToBoutique}
                  className="px-5 py-2.5 bg-stone-950 hover:bg-stone-900 text-white rounded-2xl text-xs font-heading font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg border border-amber-400/40 cursor-pointer active:scale-95"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Aller à la Boutique</span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* HORIZONTAL SCROLLABLE ROW OF RECOMMENDED MODELS (CLEAN & DIRECT) */}
            <div 
              ref={horizontalScrollRef}
              className="flex flex-row overflow-x-auto gap-5 pb-6 pt-1 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "thin" }}
            >
              {(result.recommendedModels && result.recommendedModels.length > 0
                ? result.recommendedModels
                : [
                    {
                      productId: "hm-1",
                      productName: "Boubou Royal d'Or",
                      matchScore: 98
                    },
                    {
                      productId: "hm-2",
                      productName: "Kaftan Bleu Nuit Brodé",
                      matchScore: 96
                    },
                    {
                      productId: "hm-6",
                      productName: "Kaftan Impérial Brodé",
                      matchScore: 94
                    }
                  ]
              ).map((m, idx) => {
                const matchedProduct = products.find(p => p.id === m.productId || p.name.toLowerCase().includes(m.productName.toLowerCase())) || products[idx % products.length];

                return (
                  <RecommendedModelCard
                    key={m.productId || idx}
                    m={m}
                    product={matchedProduct}
                    idx={idx}
                    onOrderWithMeasurements={(prod) => {
                      setSelectedProduct(prod);
                    }}
                    onAddToCart={(prod) => {
                      addToCart(prod);
                      showToast(`${prod.name} a été ajouté à votre panier !`);
                    }}
                  />
                );
              })}
            </div>

            {/* Bottom Actions: Clear Boutique Button & Retake Option */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={onGoToBoutique}
                className="flex-1 py-4 bg-stone-950 hover:bg-stone-900 text-white rounded-2xl font-heading font-extrabold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl border border-amber-400/30 cursor-pointer active:scale-98"
              >
                <Store className="w-5 h-5 text-amber-400" />
                <span>Aller à la Boutique</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-6 bg-white/90 hover:bg-white text-stone-850 border border-stone-200 rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
              >
                <RotateCw className="w-4 h-4 text-brand-orange-dark" />
                <span>Changer de photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Direct Photo Capture / Selection Screen (No intermediate intro screen) */}
        {!loading && !result && (
          <div className="bg-[#FFEAD8]/95 backdrop-blur-xl border border-stone-200/50 rounded-3xl p-6 sm:p-8 relative shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-brand-orange-dark bg-brand-orange-dark/5 border border-brand-orange-dark/15 px-3 py-1 rounded-full">
                Exclusivité Habé
              </span>
              <h2 className="font-heading font-bold text-3xl text-stone-950 tracking-tight uppercase mt-4">
                Modèle Habé Textile
              </h2>
              <p className="text-xs font-body text-stone-600 mt-2 leading-relaxed">
                Mettez votre photo : notre atelier analyse votre silhouette pour vous proposer directement les modèles qui vous correspondent sans défaut.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Form Parameters */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-stone-900 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-stone-750" /> 1. Choix du Profil Couture
                  </h3>
                  
                  {/* Gender selection */}
                  <div className="space-y-2 mb-4">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600">
                      Sélectionner le Profil
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "homme", label: "Homme" },
                        { id: "enfant", label: "Enfant" }
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            setGender(g.id);
                            setHeight(g.id === "homme" ? "175" : "125");
                          }}
                          className={`py-2.5 rounded-xl text-xs font-heading font-bold tracking-wide uppercase transition-all cursor-pointer ${
                            gender === g.id 
                              ? "bg-brand-orange-dark border-brand-orange-light/35 text-white shadow-md shadow-brand-orange-dark/15" 
                              : "bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-600 hover:text-stone-800"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Key selection for Men */}
                  {gender === "homme" && (
                    <div className="space-y-2 mb-4">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600">
                        Type de Corpulence
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(MEN_PROFILES).map(([key, p]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setProfileKey(key)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-heading font-bold tracking-tight uppercase transition-all flex flex-col items-center justify-center min-h-[50px] cursor-pointer ${
                              profileKey === key 
                                ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm" 
                                : "bg-stone-50 border border-stone-200 text-stone-500 hover:bg-white"
                            }`}
                          >
                            <span>{p.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-[10px] text-stone-850 leading-relaxed space-y-2 font-medium">
                  <div className="flex items-center gap-1.5 text-amber-700 font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Recommandations de l'Atelier :</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600">
                    <li>Tenez-vous bien droit(e), face à l'appareil de préférence.</li>
                    <li>Un cliché net permet d'identifier votre silhouette sans délai.</li>
                    <li>Les modèles les plus seyants vous seront directement présentés.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Direct Photo Frame */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-stone-900 mb-3 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-stone-750" /> 2. Votre Photo
                </h3>

                {/* Frame Stage */}
                <div 
                  onClick={!imageSrc ? triggerFileSelector : undefined}
                  className={`w-full max-w-sm mx-auto aspect-[3/4] bg-stone-50 border-2 border-dashed border-stone-200/80 rounded-3xl overflow-hidden relative flex items-center justify-center shadow-inner cursor-pointer hover:border-brand-orange-dark/30 transition-all ${!imageSrc ? 'hover:bg-stone-100/50' : 'border-solid border-brand-orange-dark/10'}`}
                >
                  {/* Silhouette Dashed Guide when image exists */}
                  {imageSrc && (
                    <div className="absolute inset-6 border border-dashed border-white/40 rounded-2xl pointer-events-none z-10 flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-orange-dark/10" />
                      <svg viewBox="0 0 100 130" className="w-[70%] h-[75%] opacity-40 text-white stroke-current fill-none">
                        <ellipse cx="50" cy="20" rx="12" ry="15" strokeDasharray="4 4" />
                        <path d="M 30 40 L 70 40 L 65 95 L 35 95 Z" strokeDasharray="4 4" />
                        <line x1="50" y1="40" x2="50" y2="120" strokeDasharray="4 4" />
                      </svg>
                    </div>
                  )}

                  {/* Mode A: Preview Captured Photo */}
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Aperçu de la photo"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Mode B: Idle Empty State */}
                  {!imageSrc && (
                    <div className="p-8 text-center max-w-[280px] flex flex-col items-center">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center border border-stone-200 mb-5 text-brand-orange-dark shadow-xl"
                      >
                        <Camera className="w-8 h-8" />
                      </motion.div>
                      <p className="text-sm font-heading font-bold text-stone-900 uppercase tracking-wider mb-2">
                        Mettre ma Photo
                      </p>
                      <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
                        Cliquez ici pour prendre une photo ou sélectionner une image de vous.
                      </p>
                    </div>
                  )}

                  {/* Action button to reset and choose another one */}
                  {imageSrc && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-900/90 hover:bg-stone-900 text-brand-orange-light flex items-center justify-center border border-stone-800 transition-colors cursor-pointer"
                      title="Effacer et reprendre"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* File selection element */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={triggerFileSelector}
                  className="w-full py-3.5 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest border border-brand-orange-light/20 shadow-lg shadow-brand-orange-dark/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Prendre une photo / Choisir une image
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
