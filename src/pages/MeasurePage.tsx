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
import { INITIAL_PRODUCTS } from "../data/initialProducts";

interface MeasurePageProps {
  onBackToChoice: () => void;
  onGoToBoutique: () => void;
}

interface RecommendedModelCardProps {
  m: {
    productId?: string;
    productName: string;
    category?: string;
    matchScore: number;
    matchReason?: string;
    stylingTips?: string;
    recommendedCut?: string;
  };
  product: Product | undefined;
  idx: number;
  targetGender: 'Homme' | 'Enfant';
  onOrderWithMeasurements: (prod: Product) => void;
  onAddToCart: (prod: Product) => void;
}

// Clean static horizontal model card with Tripartite Badges (1 Ensemble Royal, 1 Tendance, 1 Classique)
const RecommendedModelCard: React.FC<RecommendedModelCardProps> = ({
  m,
  product,
  idx,
  targetGender,
  onOrderWithMeasurements,
  onAddToCart
}) => {
  // Determine distinct category style
  const categoryName = 
    (m.category as string) || 
    (idx === 0 ? "Ensemble Royal" : idx === 1 ? "Tendance" : "Classique");

  const categoryBadgeConfig: Record<string, { label: string; badgeClass: string; icon: string; borderHover: string }> = {
    "Ensemble Royal": {
      label: "Ensemble Royal",
      badgeClass: "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-amber-50 border-amber-300/50 shadow-amber-900/30",
      icon: "👑",
      borderHover: "hover:border-amber-500/50"
    },
    "Tendance": {
      label: "Tendance",
      badgeClass: "bg-gradient-to-r from-orange-600 via-rose-500 to-orange-700 text-white border-orange-200/50 shadow-orange-950/30",
      icon: "✨",
      borderHover: "hover:border-orange-500/50"
    },
    "Classique": {
      label: "Classique",
      badgeClass: "bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-amber-200 border-amber-400/40 shadow-black/40",
      icon: "⚜️",
      borderHover: "hover:border-stone-700/50"
    }
  };

  const badgeInfo = categoryBadgeConfig[categoryName] || categoryBadgeConfig[idx === 0 ? "Ensemble Royal" : idx === 1 ? "Tendance" : "Classique"];

  const displayProduct: Product = 
    product || 
    INITIAL_PRODUCTS.find(p => p.target === targetGender && (p.id === m.productId || p.name.toLowerCase() === m.productName.toLowerCase())) || 
    ({
      id: m.productId || `prod-${idx}`,
      name: m.productName,
      price: targetGender === "Enfant" ? (idx === 0 ? 85000 : idx === 1 ? 65000 : 55000) : (idx === 0 ? 185000 : idx === 1 ? 165000 : 155000),
      category: categoryName,
      target: targetGender,
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
      className={`w-[280px] sm:w-[320px] md:w-[340px] flex-shrink-0 snap-start bg-[#FFEAD8] rounded-3xl overflow-hidden shadow-xl border border-white/70 flex flex-col justify-between group hover:shadow-2xl ${badgeInfo.borderHover} transition-all duration-300 text-stone-900`}
    >
      {/* Product Image Stage */}
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

        {/* Distinct Tripartite Category Pill (👑 Ensemble Royal / ✨ Tendance / ⚜️ Classique) */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-heading font-extrabold rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 border ${badgeInfo.badgeClass}`}>
            <span>{badgeInfo.icon}</span>
            <span>{badgeInfo.label}</span>
          </span>
        </div>

        {/* Match Score Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-2.5 py-1 bg-stone-950/85 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[10px] font-mono font-black rounded-full shadow-md">
            {m.matchScore}% Match
          </span>
        </div>
      </div>

      {/* Model Information & Action Buttons */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-stone-500 line-clamp-1">
              {m.recommendedCut || displayProduct.category || "Coupe Couture Habé"}
            </span>
          </div>
          <h3 className="font-heading font-bold text-base text-stone-950 group-hover:text-brand-orange-dark transition-colors line-clamp-1 mb-1">
            {displayProduct.name}
          </h3>
          <p className="font-heading font-extrabold text-lg text-brand-orange-dark">
            {displayProduct.price.toLocaleString("fr-FR")} FCFA
          </p>

          {m.matchReason && (
            <p className="text-[11px] text-stone-600 line-clamp-2 mt-2 leading-relaxed italic bg-white/60 p-2 rounded-xl border border-stone-200/60">
              « {m.matchReason.replace(/^\[.*?\]\s*/, "")} »
            </p>
          )}
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
  const [rotationCount, setRotationCount] = useState<number>(0);

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
    "Sélection des 3 modèles Habé (Royal, Tendance, Classique)...",
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

  // Process mobile / desktop file upload instantly with guaranteed fresh model rotation
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
          
          const nextRotation = rotationCount + 1;
          setRotationCount(nextRotation);

          try {
            const resized = await resizeImage(base64, 480, 480);
            setImageSrc(resized);
            calculateMeasurements(resized, nextRotation * 31);
          } catch (err) {
            setImageSrc(base64);
            calculateMeasurements(base64, nextRotation * 31);
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

  // Fast submit to backend with 3.5s timeout for instant tripartite model recommendation
  const calculateMeasurements = async (overrideImage?: string, overrideSalt?: number) => {
    const activeImage = overrideImage || imageSrc;
    if (!activeImage) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    const activeSalt = overrideSalt !== undefined ? overrideSalt : (rotationCount + 1);

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
          profile: profileKey,
          rotationSalt: activeSalt
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
        const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage, activeSalt);
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

        const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage, activeSalt);
        setResult(localData);
        setLoading(false);
        return;
      }

      const rawText = await response.text();
      let rawData: any;
      try {
        rawData = JSON.parse(rawText.trim());
      } catch (parseErr: any) {
        rawData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage, activeSalt);
      }

      const fallbackComp = computeProfessionalMeasurements(gender as any, rawData.hauteur || parseInt(height), profileKey, activeImage, activeSalt);

      const data: MeasureResult = {
        ...rawData,
        morphologyTitle: rawData.morphology_title || rawData.morphologyTitle || fallbackComp.morphologyTitle || "Silhouette Royale",
        morphologyDescription: rawData.morphology_description || rawData.morphologyDescription || fallbackComp.morphologyDescription || "Proportions adaptées à la confection Habé.",
        recommendedModels: Array.isArray(rawData.recommended_models) && rawData.recommended_models.length > 0
          ? rawData.recommended_models.map((rm: any, idx: number) => ({
              productId: rm.product_id || rm.productId,
              productName: rm.product_name || rm.productName,
              category: rm.category || (idx === 0 ? "Ensemble Royal" : idx === 1 ? "Tendance" : "Classique"),
              matchScore: Number(rm.match_score || rm.matchScore || (98 - idx * 2)),
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
      const localData = computeProfessionalMeasurements(gender as any, parseInt(height), profileKey, activeImage, activeSalt);
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

        <div className="flex items-center">
          <img 
            src={brandLogo.logoWhite || "/logo-white.png"} 
            alt="Habé Textile" 
            className="h-9 sm:h-11 w-auto max-w-[140px] sm:max-w-[180px] object-contain drop-shadow-md"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (!img.src.includes('logo-white.png')) {
                img.src = "/logo-white.png";
              }
            }}
          />
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
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-wider text-white">
                    Modèles Recommandés
                  </h2>
                  <span className="text-xs bg-stone-950/70 text-amber-300 px-3 py-1 rounded-full font-mono font-bold">
                    3 sélections exclusives
                  </span>
                </div>
                {/* Tripartite indicators */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] bg-amber-500/25 text-amber-100 border border-amber-300/40 px-2.5 py-0.5 rounded-full font-heading font-bold flex items-center gap-1 shadow-sm">
                    <span>👑</span> Ensemble Royal
                  </span>
                  <span className="text-[10px] bg-orange-500/25 text-orange-100 border border-orange-300/40 px-2.5 py-0.5 rounded-full font-heading font-bold flex items-center gap-1 shadow-sm">
                    <span>✨</span> Tendance
                  </span>
                  <span className="text-[10px] bg-stone-900/60 text-stone-200 border border-stone-500/30 px-2.5 py-0.5 rounded-full font-heading font-bold flex items-center gap-1 shadow-sm">
                    <span>⚜️</span> Classique
                  </span>
                </div>
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
              {((result.recommendedModels && result.recommendedModels.length > 0)
                ? result.recommendedModels
                : (gender === "enfant"
                    ? [
                        {
                          productId: "kd-1",
                          productName: "Ensemble Royal Junior Or",
                          category: "Ensemble Royal",
                          matchScore: 98
                        },
                        {
                          productId: "kd-4",
                          productName: "Sénateur Kid Tissu Vert",
                          category: "Tendance",
                          matchScore: 96
                        },
                        {
                          productId: "kd-6",
                          productName: "Boubou Kid Classique Blanc",
                          category: "Classique",
                          matchScore: 94
                        }
                      ]
                    : [
                        {
                          productId: "hm-1",
                          productName: "Boubou Royal d'Or",
                          category: "Ensemble Royal",
                          matchScore: 98
                        },
                        {
                          productId: "hm-2",
                          productName: "Kaftan Bleu Nuit Brodé",
                          category: "Tendance",
                          matchScore: 96
                        },
                        {
                          productId: "hm-3",
                          productName: "Kaftan Blanc Éclat",
                          category: "Classique",
                          matchScore: 94
                        }
                      ]
                  )
              ).map((m, idx) => {
                const targetGender: 'Homme' | 'Enfant' = gender === "enfant" ? "Enfant" : "Homme";
                const targetPool = products.filter(p => p.target === targetGender);
                const targetInitialPool = INITIAL_PRODUCTS.filter(p => p.target === targetGender);

                const matchedProduct = 
                  targetPool.find(p => p.id === m.productId || p.name.toLowerCase().includes(m.productName.toLowerCase())) ||
                  targetInitialPool.find(p => p.id === m.productId || p.name.toLowerCase().includes(m.productName.toLowerCase())) ||
                  targetPool[idx % (targetPool.length || 1)] ||
                  targetInitialPool[idx % (targetInitialPool.length || 1)];

                return (
                  <RecommendedModelCard
                    key={m.productId || idx}
                    m={m}
                    product={matchedProduct}
                    idx={idx}
                    targetGender={targetGender}
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

            {/* Bottom Actions: Fresh 3 Models, Boutique Button & Retake Option */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
              <button
                type="button"
                onClick={() => {
                  const nextRotation = rotationCount + 1;
                  setRotationCount(nextRotation);
                  calculateMeasurements(imageSrc || undefined, nextRotation * 7919 + Date.now());
                  showToast("3 nouveaux modèles exclusifs sélectionnés !");
                }}
                className="py-4 px-5 bg-gradient-to-r from-brand-orange-dark via-amber-600 to-brand-orange-dark text-white rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-orange-dark/20 border border-amber-300/30 cursor-pointer active:scale-98 hover:brightness-110"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>3 Autres Modèles</span>
              </button>

              <button
                type="button"
                onClick={onGoToBoutique}
                className="py-4 px-5 bg-stone-950 hover:bg-stone-900 text-white rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl border border-amber-400/30 cursor-pointer active:scale-98"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>Aller à la Boutique</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-5 bg-white/95 hover:bg-white text-stone-900 border border-stone-200 rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-98"
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

            <div className="max-w-md mx-auto space-y-6">
              {/* Gender selection */}
              <div className="space-y-2">
                <label className="block text-center text-[11px] font-heading font-extrabold uppercase tracking-widest text-stone-700">
                  Sélectionner le Profil
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  {[
                    { id: "homme", label: "👔 Homme" },
                    { id: "enfant", label: "🧒 Enfant" }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setGender(g.id);
                        setHeight(g.id === "homme" ? "175" : "125");
                      }}
                      className={`py-3 rounded-2xl text-xs font-heading font-extrabold tracking-wide uppercase transition-all cursor-pointer border ${
                        gender === g.id 
                          ? "bg-brand-orange-dark border-brand-orange-light/35 text-white shadow-lg shadow-brand-orange-dark/25 scale-[1.02]" 
                          : "bg-white/90 hover:bg-white border-stone-200 text-stone-700 hover:text-stone-900 shadow-sm"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Photo Frame */}
              <div className="space-y-3">

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
