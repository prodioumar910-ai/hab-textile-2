import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  RotateCw, 
  User, 
  Sparkles, 
  ArrowLeft, 
  ShoppingBag, 
  Loader2, 
  Check, 
  ChevronRight, 
  Info,
  Sliders,
  SlidersHorizontal,
  Download,
  Clipboard,
  BookOpen,
  Printer,
  Share2,
  ExternalLink,
  Cpu
} from "lucide-react";
import { useStore } from "../context/StoreContext";
import { getOptimizedImage } from "../utils/image";

interface MeasureResult {
  taille: number;
  hanche: number;
  poitrine: number;
  manche: number;
  coude: number;
  pantalon: number;
  hauteur?: number;
  comment: string;
}

interface MeasurePageProps {
  onBackToChoice: () => void;
  onGoToBoutique: () => void;
}

export const getRecommendations = (gender: string, m: MeasureResult) => {
  // Determine Body shape
  let shape = "";
  let shapeDesc = "";
  
  if (gender === "homme") {
    const diffPT = m.poitrine - m.taille;
    if (diffPT >= 10) {
      shape = "Morphologie Athlétique (V-Shape)";
      shapeDesc = "Vos épaules et votre poitrine sont bien développées par rapport à votre taille. Les coupes ajustées (Slim Fit) pour les chemises et les vestes cintrées mettront particulièrement en valeur votre carrure.";
    } else if (diffPT <= 2 && m.taille >= m.poitrine) {
      shape = "Morphologie Ovale / Solide";
      shapeDesc = "Votre corps est harmonieux avec du volume au niveau du buste. Privilégiez des vêtements structurés mais confortables (Regular Fit), des vestes droites à deux boutons pour allonger votre silhouette.";
    } else {
      shape = "Morphologie Rectangulaire / Classique";
      shapeDesc = "Vos épaules, votre taille et vos hanches sont alignées de façon équilibrée. C'est un profil idéal pour jouer sur les superpositions. Les vestes structurées aux épaules marquées vous iront à merveille.";
    }
  } else {
    // Femme
    const diffHP = m.hanche - m.poitrine;
    const diffPH = m.poitrine - m.hanche;
    const isHourglass = m.taille <= 0.76 * m.poitrine && Math.abs(m.poitrine - m.hanche) <= 6;
    
    if (isHourglass) {
      shape = "Morphologie Sablier (X / Sablier)";
      shapeDesc = "Vos hanches et votre poitrine sont alignées avec une taille très marquée. C'est l'allure classique de la haute couture. Sublimez votre taille avec des ceintures, des coupes ajustées, des robes portefeuilles et des vestes cintrées.";
    } else if (diffHP >= 7) {
      shape = "Morphologie Pyramide (A / Poire)";
      shapeDesc = "Vos hanches sont plus larges que vos épaules et votre poitrine. L'objectif est d'attirer l'attention sur le haut du corps. Misez sur des vestes avec des épaulettes légères, des cols bateau ou généreux, et des coupes droites pour le bas.";
    } else if (diffPH >= 7) {
      shape = "Morphologie Pyramide Inversée (V-Shape)";
      shapeDesc = "Vos épaules et votre poitrine sont plus larges que vos hanches. Équilibrez votre allure en apportant du volume sur le bas avec des pantalons larges (Wide Leg), des jupes évasées, et des hauts fluides à cols en V.";
    } else {
      shape = "Morphologie Rectangulaire (H-Shape)";
      shapeDesc = "Votre corps est fin et élancé, avec peu de différence entre la taille, le buste et les hanches. Créez des illusions de courbes en choisissant des coupes légèrement amples, des détails plissés, et des manteaux ceinturés.";
    }
  }

  // Calculate Sizing
  // Shirt
  let shirtSize = "";
  if (gender === "homme") {
    if (m.poitrine < 90) shirtSize = "37/38 (S)";
    else if (m.poitrine < 98) shirtSize = "39/40 (M)";
    else if (m.poitrine < 106) shirtSize = "41/42 (L)";
    else if (m.poitrine < 114) shirtSize = "43/44 (XL)";
    else shirtSize = "45/46 (XXL)";
  } else {
    if (m.poitrine < 82) shirtSize = "34 (XS)";
    else if (m.poitrine < 88) shirtSize = "36 (S)";
    else if (m.poitrine < 94) shirtSize = "38 (M)";
    else if (m.poitrine < 100) shirtSize = "40 (L)";
    else if (m.poitrine < 106) shirtSize = "42 (XL)";
    else shirtSize = "44 (XXL)";
  }

  // Blazer / Veste (FR size)
  let blazerSize = 0;
  if (gender === "homme") {
    blazerSize = Math.round(m.poitrine / 2);
  } else {
    blazerSize = Math.round(m.poitrine / 2) - 6;
  }
  blazerSize = Math.max(34, Math.min(62, blazerSize - (blazerSize % 2)));

  // Trouser (FR size)
  let trouserSize = 0;
  if (gender === "homme") {
    trouserSize = Math.round(m.taille / 2);
  } else {
    trouserSize = Math.round(m.taille / 2) - 4;
  }
  trouserSize = Math.max(34, Math.min(58, trouserSize - (trouserSize % 2)));

  return {
    shape,
    shapeDesc,
    shirtSize,
    blazerSize,
    trouserSize
  };
};

export const MeasurePage: React.FC<MeasurePageProps> = ({ onBackToChoice, onGoToBoutique }) => {
  const { user, products, setSelectedProduct } = useStore();
  const [gender, setGender] = useState<string>("homme");
  const [height, setHeight] = useState<string>("175");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeasureResult | null>(null);
  const [adjustedResult, setAdjustedResult] = useState<MeasureResult | null>(null);
  const [hoveredMeasure, setHoveredMeasure] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"synthese" | "ajustement" | "tuto">("synthese");
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto loading step messages simulation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Initialisation de notre cabine de mesure virtuelle...",
    "Analyse de votre corps et alignement des proportions...",
    "Calcul précis des mensurations par notre couturier IA...",
    "Finalisation de votre fiche de style personnalisée..."
  ];

  // Initialize camera stream
  const startCamera = async () => {
    setError(null);
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera getUserMedia blocked or unsupported, falling back to file selection:", err);
      setIsCameraActive(false);
      // Trigger file selector fallback
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture frame from video
  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Optional horizontal flip if front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImageSrc(dataUrl);
        stopCamera();
        calculateMeasurements(dataUrl);
      }
    }
  };

  // Helper to downscale and compress images for faster uploads and safety in mobile webviews without losing quality
  const resizeImage = (dataUrl: string, maxWidth = 2560, maxHeight = 2560): Promise<string> => {
    return new Promise((resolve) => {
      // If the image is already small enough (under 2M characters, approx 1.5MB), keep it untouched to preserve 100% original quality
      if (dataUrl.length < 2000000) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.naturalWidth || img.width || 1024;
        let height = img.naturalHeight || img.height || 1024;

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
          resolve(canvas.toDataURL("image/jpeg", 0.95)); // Very high quality factor for visual accuracy
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        resolve(dataUrl);
      };
    });
  };

  // Process manual/mobile file upload
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
            // High-fidelity processing preserving maximum detail for precise tailorship
            const resized = await resizeImage(base64);
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

  // Submit image to Gemini measurement backend
  const calculateMeasurements = async (overrideImage?: string) => {
    const activeImage = overrideImage || imageSrc;
    if (!activeImage) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    // Absolute fallback URLs for dev and prod
    const devUrl = "https://ais-dev-upzhp3kqwztocsgkzoovce-115539072125.europe-west2.run.app/api/measure";
    const sharedUrl = "https://ais-pre-upzhp3kqwztocsgkzoovce-115539072125.europe-west2.run.app/api/measure";

    const endpoints: string[] = [];

    // 1. Current origin relative endpoint (works on standard web browsers and inside dev previews)
    if (window.location.protocol !== "capacitor:" && window.location.protocol !== "file:") {
      endpoints.push("/api/measure");
    }

    // 2. Local network IP / Localhost port 3000 mapping (if accessed via frontend port like 5173 on computer or phone)
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.startsWith("192.168.") ||
      window.location.hostname.startsWith("10.") ||
      window.location.hostname.startsWith("172.")
    ) {
      if (window.location.port !== "3000") {
        endpoints.push(`http://${window.location.hostname}:3000/api/measure`);
      }
    }

    // 3. Absolute Dev URL (works from anywhere, but may trigger redirect if not authenticated)
    endpoints.push(devUrl);

    // 4. Absolute Shared URL (publicly accessible, guaranteed server-side handling)
    endpoints.push(sharedUrl);

    let response: Response | null = null;
    let lastFetchError: any = null;
    let successfulUrl = "";

    for (const url of endpoints) {
      try {
        console.log("Tentative de connexion à l'API de mesure:", url);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: activeImage,
            gender
          })
        });

        if (!res) continue;

        // If returned 404, the route does not exist on this endpoint, we continue to next
        if (res.status === 404) {
          console.warn(`Endpoint ${url} a retourné une erreur 404. Essai du point d'accès suivant...`);
          lastFetchError = new Error(`404 non trouvé à ${url}`);
          continue;
        }

        // If we got redirected (such as AI Studio Google SSO login page) or received HTML instead of JSON
        const contentType = res.headers.get("content-type") || "";
        if (res.redirected || contentType.includes("text/html")) {
          console.warn(`Endpoint ${url} a redirigé ou retourné du HTML. Essai du point d'accès suivant...`);
          lastFetchError = new Error(`Redirection ou réponse HTML reçue de ${url}`);
          continue;
        }

        response = res;
        successfulUrl = url;
        break; // Found a working endpoint!
      } catch (err: any) {
        console.warn(`Échec de connexion au point d'accès ${url}:`, err.message || err);
        lastFetchError = err;
      }
    }

    try {
      if (!response) {
        throw new Error(
          `Impossible de contacter le serveur de mesure IA sur aucun point d'accès (${
            lastFetchError?.message || "Erreur réseau"
          }).`
        );
      }

      if (!response.ok) {
        let errorMsg = "Une erreur est survenue lors du traitement.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          try {
            const txt = await response.text();
            errorMsg = `Erreur serveur (${response.status}): ${txt.substring(0, 100)}`;
          } catch (e2) {
            errorMsg = `Erreur serveur (${response.status})`;
          }
        }
        throw new Error(errorMsg);
      }

      // Safe text-first reading to prevent Safari's native response.json() exception triggers
      const rawText = await response.text();
      let data: MeasureResult;
      try {
        data = JSON.parse(rawText.trim());
      } catch (parseErr: any) {
        console.error(`Impossible d'analyser la réponse JSON depuis ${successfulUrl}:`, rawText);
        throw new Error(`Erreur de formatage des données de mesure (${parseErr.message || "JSON non valide"}).`);
      }

      setResult(data);
      setAdjustedResult(data);
      
      if (data.hauteur) {
        setHeight(data.hauteur.toString());
      }
      
      // Save results locally for persistent reference in the Profile tab
      localStorage.setItem("habe_ai_measurements", JSON.stringify({
        ...data,
        gender,
        height: data.hauteur ? data.hauteur.toString() : height,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      }));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Le serveur de couture IA est temporairement indisponible. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // Reset workflow
  const handleReset = () => {
    setImageSrc(null);
    setResult(null);
    setAdjustedResult(null);
    setError(null);
    stopCamera();
    setActiveTab("synthese");
  };

  // Save manual adjustments
  const saveAdjustedResult = (newResult: MeasureResult) => {
    setAdjustedResult(newResult);
    localStorage.setItem("habe_ai_measurements", JSON.stringify({
      ...newResult,
      gender,
      height: newResult.hauteur ? newResult.hauteur.toString() : height,
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      isAdjusted: true
    }));
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen text-white font-body py-8 px-4 sm:px-6 relative overflow-hidden" style={{ background: "radial-gradient(circle, #FFAA5E 0%, #C1541A 100%)" }}>
      {/* Background Ambience */}
      <div className="absolute top-[10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-orange-600/5 blur-[100px] pointer-events-none" />

      {/* Header Controls */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 z-10 relative">
        <button
          onClick={() => {
            stopCamera();
            onBackToChoice();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-50 active:scale-95 text-xs font-heading font-extrabold uppercase tracking-widest rounded-full transition-all border border-stone-200 shadow-sm text-stone-700 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4 text-brand-orange-dark" />
          Retour
        </button>

        <div className="flex items-center gap-2">
          <img 
            src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma" 
            alt="Maison Habé" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="font-heading font-extrabold text-sm tracking-widest uppercase text-white">
            MESURES IA
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* State 1: Loading Screen */}
        {loading && (
          <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#FFEAD8]/95 backdrop-blur-md rounded-3xl border border-stone-200/50 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-orange-600/5 pointer-events-none" />
            <div className="relative flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-2 border-brand-orange-light/10 border-t-brand-orange-dark animate-spin" />
                <Sparkles className="w-8 h-8 text-brand-orange-dark absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>

              <h3 className="font-heading font-bold text-xl tracking-wide text-stone-950 uppercase mb-2">
                Analyse Couture IA en Cours
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

        {/* State 2: Results Display */}
        {!loading && result && adjustedResult && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            {/* Mannequin / Silhouette Visual Column */}
            <div className="md:col-span-5 bg-[#FFEAD8]/95 backdrop-blur-xl border border-white/40 rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[450px] shadow-2xl relative overflow-hidden w-full max-w-sm md:max-w-none mx-auto">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange-dark mb-6">
                Visualisation Anatomique
              </h3>

              <div className="relative w-full max-w-[190px] sm:max-w-[240px] aspect-[1/2] flex items-center justify-center">
                {/* SVG Silhouette template representing points of interest */}
                <svg viewBox="0 0 100 200" className="w-full h-full text-stone-300 stroke-current fill-none">
                  {/* Chic Abstract Mannequin Silhouette */}
                  <path d="M 50 15 C 47 15, 45 17, 45 20 C 45 23, 47 25, 50 25 C 53 25, 55 23, 55 20 C 55 17, 53 15, 50 15 Z" strokeWidth="1.2" className="stroke-stone-400" /> {/* Head */}
                  <path d="M 45 25 L 55 25 L 53 32 L 47 32 Z" strokeWidth="1.2" className="stroke-stone-400" /> {/* Neck */}
                  <path d="M 33 36 C 35 34, 42 32, 50 32 C 58 32, 65 34, 67 36 L 72 52 L 72 75 C 72 80, 68 85, 63 85 L 37 85 C 32 85, 28 80, 28 75 L 28 52 Z" strokeWidth="1.2" className="stroke-stone-400" /> {/* Torso */}
                  <path d="M 37 85 L 40 145 L 43 190 L 46 190 L 44 145 L 50 110 L 56 145 L 54 190 L 57 190 L 60 145 L 63 85" strokeWidth="1.2" className="stroke-stone-400" /> {/* Legs */}
                  <path d="M 30 36 L 24 55 L 20 75 L 18 90" strokeWidth="1.2" className="stroke-stone-400" /> {/* Left Arm */}
                  <path d="M 70 36 L 76 55 L 80 75 L 82 90" strokeWidth="1.2" className="stroke-stone-400" /> {/* Right Arm */}

                  {/* Horizontal measurement indicators */}
                  {/* Head / Tête Trait (Visual indicator) */}
                  <line 
                    x1="35" y1="20" x2="65" y2="20" 
                    className="stroke-stone-400/80"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />

                  {/* Chest / Poitrine */}
                  <motion.line 
                    x1="31" y1="46" x2="69" y2="46" 
                    className="cursor-pointer"
                    stroke={hoveredMeasure === "poitrine" ? "#C1541A" : "#D97706"}
                    strokeWidth={hoveredMeasure === "poitrine" ? "4" : "2"}
                    strokeDasharray={hoveredMeasure === "poitrine" ? "none" : "3 2"}
                    onMouseEnter={() => setHoveredMeasure("poitrine")}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    animate={hoveredMeasure === "poitrine" ? { strokeWidth: [3, 5, 3] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Waist / Taille (Moved to the former place of Pantalon on the leg) */}
                  <motion.path 
                    d="M 58 85 L 55 145 L 52 190" 
                    className="cursor-pointer"
                    stroke={hoveredMeasure === "taille" ? "#C1541A" : "#EA580C"}
                    strokeWidth={hoveredMeasure === "taille" ? "4" : "2"}
                    fill="none"
                    onMouseEnter={() => setHoveredMeasure("taille")}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    animate={hoveredMeasure === "taille" ? { strokeWidth: [3, 5, 3] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Hip / Hanche */}
                  <motion.line 
                    x1="35" y1="80" x2="65" y2="80" 
                    className="cursor-pointer"
                    stroke={hoveredMeasure === "hanche" ? "#C1541A" : "#C1541A"}
                    strokeWidth={hoveredMeasure === "hanche" ? "4" : "2"}
                    strokeDasharray={hoveredMeasure === "hanche" ? "none" : "3 2"}
                    onMouseEnter={() => setHoveredMeasure("hanche")}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    animate={hoveredMeasure === "hanche" ? { strokeWidth: [3, 5, 3] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Sleeve / Manche */}
                  <motion.path 
                    d="M 70 36 L 76 55 L 80 75" 
                    className="cursor-pointer"
                    stroke={hoveredMeasure === "manche" ? "#C1541A" : "#F59E0B"}
                    strokeWidth={hoveredMeasure === "manche" ? "4" : "2"}
                    fill="none"
                    onMouseEnter={() => setHoveredMeasure("manche")}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    animate={hoveredMeasure === "manche" ? { strokeWidth: [3, 5, 3] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Elbow / Coude (highlights left arm upper half) */}
                  <motion.path 
                    d="M 30 36 L 24 55" 
                    className="cursor-pointer"
                    stroke={hoveredMeasure === "coude" ? "#C1541A" : "#EA580C"}
                    strokeWidth={hoveredMeasure === "coude" ? "4" : "2"}
                    fill="none"
                    onMouseEnter={() => setHoveredMeasure("coude")}
                    onMouseLeave={() => setHoveredMeasure(null)}
                    animate={hoveredMeasure === "coude" ? { strokeWidth: [3, 5, 3] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  {/* Interactive Nodes */}
                  <circle cx="50" cy="46" r={hoveredMeasure === "poitrine" ? "5" : "3"} className="fill-amber-500 cursor-pointer transition-all" onMouseEnter={() => setHoveredMeasure("poitrine")} onMouseLeave={() => setHoveredMeasure(null)} />
                  <circle cx="55" cy="145" r={hoveredMeasure === "taille" ? "5" : "3"} className="fill-orange-500 cursor-pointer transition-all" onMouseEnter={() => setHoveredMeasure("taille")} onMouseLeave={() => setHoveredMeasure(null)} />
                  <circle cx="50" cy="80" r={hoveredMeasure === "hanche" ? "5" : "3"} className="fill-brand-orange-dark cursor-pointer transition-all" onMouseEnter={() => setHoveredMeasure("hanche")} onMouseLeave={() => setHoveredMeasure(null)} />
                  <circle cx="76" cy="55" r={hoveredMeasure === "manche" ? "5" : "3"} className="fill-amber-400 cursor-pointer transition-all" onMouseEnter={() => setHoveredMeasure("manche")} onMouseLeave={() => setHoveredMeasure(null)} />
                  <circle cx="24" cy="55" r={hoveredMeasure === "coude" ? "5" : "3"} className="fill-orange-400 cursor-pointer transition-all" onMouseEnter={() => setHoveredMeasure("coude")} onMouseLeave={() => setHoveredMeasure(null)} />
                </svg>

                {/* Badges pointing to measurements dynamically on svg */}
                <div 
                  onMouseEnter={() => setHoveredMeasure("poitrine")}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  className={`absolute top-[23%] left-[-15px] sm:left-[-20px] bg-amber-500 text-black text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow cursor-pointer transition-all duration-200 ${hoveredMeasure === "poitrine" ? "scale-110 ring-2 ring-amber-600" : ""}`}
                >
                  Poitrine: {adjustedResult.poitrine}cm
                </div>
                <div 
                  onMouseEnter={() => setHoveredMeasure("taille")}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  className={`absolute top-[72.5%] left-[-15px] sm:left-[-20px] bg-orange-500 text-white text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow cursor-pointer transition-all duration-200 ${hoveredMeasure === "taille" ? "scale-110 ring-2 ring-orange-600" : ""}`}
                >
                  Taille: {adjustedResult.taille}cm
                </div>
                <div 
                  onMouseEnter={() => setHoveredMeasure("hanche")}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  className={`absolute top-[40%] right-[-10px] sm:right-[-15px] bg-brand-orange-light text-black text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow cursor-pointer transition-all duration-200 ${hoveredMeasure === "hanche" ? "scale-110 ring-2 ring-orange-400" : ""}`}
                >
                  Hanches: {adjustedResult.hanche}cm
                </div>
                <div 
                  onMouseEnter={() => setHoveredMeasure("coude")}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  className={`absolute top-[12%] left-[-15px] sm:left-[-20px] bg-orange-400 text-black text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow cursor-pointer transition-all duration-200 ${hoveredMeasure === "coude" ? "scale-110 ring-2 ring-orange-500" : ""}`}
                >
                  Coude: {adjustedResult.coude}cm
                </div>
                <div 
                  onMouseEnter={() => setHoveredMeasure("manche")}
                  onMouseLeave={() => setHoveredMeasure(null)}
                  className={`absolute top-[31%] right-[-10px] sm:right-[-15px] bg-amber-400 text-black text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded shadow cursor-pointer transition-all duration-200 ${hoveredMeasure === "manche" ? "scale-110 ring-2 ring-amber-500" : ""}`}
                >
                  Manche: {adjustedResult.manche}cm
                </div>
              </div>

              <div className="mt-6 flex gap-3 text-stone-600 text-[10px] font-extrabold font-heading">
                <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-full border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-dark" />
                  Maison Habé IA
                </span>
                <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-full border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Hauteur : {height} cm
                </span>
              </div>
            </div>

            {/* Measurements & Tailor Advice Box with Tabs */}
            <div className="md:col-span-7 flex flex-col justify-between">
              <div className="bg-[#FFEAD8]/95 backdrop-blur-xl border border-white/40 rounded-3xl p-5 sm:p-6 mb-6 shadow-2xl text-stone-900">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b border-white/30 pb-3">
                  <div>
                    <span className="text-[9px] uppercase font-heading tracking-widest text-brand-orange-dark font-bold flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 animate-pulse" /> Atelier Numérique Maison Habé
                    </span>
                    <h2 className="font-heading font-bold text-xl text-stone-950 tracking-tight uppercase">
                      Vos Mensurations de Couture
                    </h2>
                  </div>
                  <div className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] rounded-full flex items-center gap-1 font-heading font-extrabold shrink-0">
                    <Check className="w-3 h-3" /> PRÉCISION IA
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-stone-200/40 mb-4 overflow-x-auto scrollbar-none gap-1 py-1">
                  {[
                    { id: "synthese", label: "Synthèse", icon: Sparkles },
                    { id: "ajustement", label: "Ajustement Pro", icon: SlidersHorizontal },
                    { id: "tuto", label: "Tuto Mesures", icon: Info }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-heading font-extrabold uppercase tracking-wider rounded-lg transition-all border shrink-0 ${
                        activeTab === tab.id
                          ? "bg-brand-orange-dark text-white border-brand-orange-dark shadow-md shadow-brand-orange-dark/15"
                          : "bg-white/60 text-stone-600 border-stone-200/50 hover:bg-white hover:text-stone-900"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <AnimatePresence mode="wait">
                  {activeTab === "synthese" && (
                    <motion.div
                      key="synthese"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Measurements Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: "poitrine", label: "Tour de Poitrine", value: adjustedResult.poitrine, color: "border-amber-500/30" },
                          { key: "taille", label: "Tour de Taille", value: adjustedResult.taille, color: "border-orange-500/30" },
                          { key: "hanche", label: "Tour de Hanche", value: adjustedResult.hanche, color: "border-brand-orange-light/30" },
                          { key: "coude", label: "Tour de Coude", value: adjustedResult.coude, color: "border-orange-400/30" },
                          { key: "manche", label: "Longueur Manche", value: adjustedResult.manche, color: "border-amber-400/30" }
                        ].map((m, i) => (
                          <div 
                            key={i} 
                            onMouseEnter={() => setHoveredMeasure(m.key)}
                            onMouseLeave={() => setHoveredMeasure(null)}
                            className={`bg-white/80 border ${m.color} rounded-2xl p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-300 cursor-pointer ${
                              hoveredMeasure === m.key ? "bg-white ring-2 ring-brand-orange-dark/50 shadow-md scale-[1.02]" : "hover:bg-white/95"
                            }`}
                          >
                            <span className="text-stone-500 text-[9px] font-body font-bold uppercase tracking-wider block">
                              {m.label}
                            </span>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xl font-heading font-extrabold text-stone-900">
                                {m.value}
                              </span>
                              <span className="text-[10px] text-brand-orange-dark font-heading font-bold">cm</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Virtual Tailor Advice */}
                      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                        <h4 className="text-[10px] font-heading font-extrabold uppercase text-amber-700 tracking-widest flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Avis de notre Maître Tailleur
                        </h4>
                        <p className="text-xs text-stone-700 leading-relaxed font-body italic">
                           "{adjustedResult.comment}"
                        </p>
                      </div>

                      {/* Premium Action to Generate Passport */}
                      <button
                        onClick={() => setShowPassportModal(true)}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-brand-orange-dark hover:from-amber-600 hover:to-brand-orange-dark text-white rounded-xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange-dark/15 border border-brand-orange-light/20 active:scale-[0.99] cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                        Générer mon Passeport de Couture
                      </button>
                    </motion.div>
                  )}

                  {activeTab === "ajustement" && (
                    <motion.div
                      key="ajustement"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="bg-white/60 border border-stone-200/40 p-3 rounded-xl flex items-start gap-2 mb-1">
                        <Sliders className="w-4 h-4 text-brand-orange-dark shrink-0 mt-0.5" />
                        <p className="text-[10px] text-stone-600 leading-relaxed font-body">
                          <strong>Ajustement Expert :</strong> L'estimation de l'IA est un excellent point de départ. Utilisez les curseurs ci-dessous pour affiner vos mensurations si vous connaissez vos valeurs réelles exactes. Vos ajustements se synchronisent en direct.
                        </p>
                      </div>

                      {/* Sliders loop */}
                      <div className="space-y-2 bg-white/80 border border-stone-200/30 p-3 rounded-2xl shadow-sm max-h-[220px] overflow-y-auto">
                        {[
                          { key: "hauteur", label: "Hauteur de votre Corps", min: 100, max: 220 },
                          { key: "poitrine", label: "Tour de Poitrine", min: 70, max: 130 },
                          { key: "taille", label: "Tour de Taille", min: 60, max: 120 },
                          { key: "hanche", label: "Tour de Hanche", min: 70, max: 130 },
                          { key: "coude", label: "Tour de Coude", min: 15, max: 50 },
                          { key: "manche", label: "Longueur de Manche", min: 40, max: 85 }
                        ].map((slider) => {
                          const val = (adjustedResult[slider.key as keyof MeasureResult] as number) || (slider.key === "hauteur" ? parseInt(height) : 0);
                          return (
                            <div 
                              key={slider.key} 
                              className={`space-y-1 p-1.5 rounded-xl transition-all duration-300 border ${
                                hoveredMeasure === slider.key ? "bg-amber-50/40 border-amber-200/40" : "border-transparent"
                              }`}
                              onMouseEnter={() => setHoveredMeasure(slider.key)}
                              onMouseLeave={() => setHoveredMeasure(null)}
                            >
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-heading font-extrabold text-stone-800 uppercase tracking-wider text-[10px]">{slider.label}</span>
                                <div className="flex items-center gap-1 font-heading font-extrabold text-[11px]">
                                  <span className="text-brand-orange-dark">{val}</span>
                                  <span className="text-stone-400 text-[9px]">cm</span>
                                </div>
                              </div>
                              <input
                                type="range"
                                min={slider.min}
                                max={slider.max}
                                value={val}
                                onChange={(e) => {
                                  const newVal = parseInt(e.target.value);
                                  const updated = { ...adjustedResult, [slider.key]: newVal };
                                  if (slider.key === "hauteur") {
                                    setHeight(newVal.toString());
                                  }
                                  saveAdjustedResult(updated);
                                }}
                                className="w-full accent-brand-orange-dark cursor-pointer h-1 bg-stone-200 rounded-lg appearance-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "tuto" && (
                    <motion.div
                      key="tuto"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 max-h-[250px] overflow-y-auto pr-1"
                    >
                      <h4 className="text-xs font-heading font-extrabold uppercase text-stone-800 tracking-wider">Comment vérifier vos mesures chez vous ?</h4>
                      {[
                        { title: "Tour de Poitrine", text: "Passez le ruban horizontalement sous les aisselles, par-dessus la pointe des seins sans serrer." },
                        { title: "Tour de Taille", text: "Mesurez au creux de votre taille naturelle, généralement au-dessus du nombril à l'endroit le plus mince." },
                        { title: "Tour de Hanche", text: "Passez le ruban à l'endroit le plus fort des hanches et fessiers, pieds bien joints." },
                        { title: "Longueur de Manche", text: "Partez de la couture de l'épaule jusqu'à l'os du poignet, le bras légèrement fléchi." },
                        { title: "Tour de Coude", text: "Pliez légèrement votre coude et entourez le ruban horizontalement à la pliure." }
                      ].map((t, idx) => (
                        <div key={idx} className="bg-white/80 border border-stone-200/30 p-2.5 rounded-2xl">
                          <span className="text-[9px] font-heading font-extrabold text-brand-orange-dark uppercase tracking-wide block">{t.title}</span>
                          <p className="text-[11px] text-stone-600 font-body leading-relaxed mt-0.5">{t.text}</p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 bg-white hover:bg-stone-50 active:scale-95 text-stone-700 border border-stone-300/80 rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-brand-orange-dark" />
                  Reprendre la photo
                </button>

                <button
                  onClick={onGoToBoutique}
                  className="flex-1 py-4 bg-brand-orange-dark hover:bg-brand-orange-dark/90 active:scale-[0.98] text-white rounded-2xl font-heading font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-orange-dark/20 border border-brand-orange-light/35 cursor-pointer"
                >
                  Découvrir nos Collections
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recommendations of 3 clothing models that match the analyzed profile */}
          {(() => {
            const recommendedProducts = products
              .filter(p => p.target.toLowerCase() === gender.toLowerCase() && p.garmentType !== 'accessoire' && p.image)
              .slice(0, 3);

            if (recommendedProducts.length === 0) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-[#FFEAD8]/95 backdrop-blur-xl border border-white/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-stone-900 mt-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/30 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-heading tracking-widest text-brand-orange-dark font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Recommandations Personnalisées
                    </span>
                    <h3 className="font-heading font-bold text-xl text-stone-950 mt-1 uppercase">
                      Modèles suggérés pour votre corps
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 font-body font-medium">
                      Sélection exclusive de créations Maison Habé adaptées à votre morphologie et idéales pour vos mensurations.
                    </p>
                  </div>
                  <button
                    onClick={onGoToBoutique}
                    className="px-4 py-2 bg-white/60 hover:bg-white text-stone-800 rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider transition-all border border-stone-200 shadow-sm flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
                  >
                    Boutique complète
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-row overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-stone-200/50 md:grid md:grid-cols-3 md:overflow-visible md:max-w-xl md:mx-auto">
                  {recommendedProducts.map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedProduct(p)}
                      className="bg-white/85 border border-white/50 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between cursor-pointer group hover:bg-white transition-colors duration-300 min-w-[125px] sm:min-w-[150px] md:min-w-0 flex-shrink-0 md:flex-shrink snap-start"
                    >
                      <div className="relative aspect-square bg-stone-950/5 overflow-hidden flex items-center justify-center border-b border-stone-100">
                        {p.image ? (
                          <img
                            src={getOptimizedImage(p.image, 200)}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="font-heading font-bold text-[10px] text-stone-400">Image indisponible</div>
                        )}
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-brand-orange-dark/90 backdrop-blur-md text-white text-[6.5px] sm:text-[7.5px] font-heading font-bold rounded-full uppercase tracking-wider">
                          {p.category}
                        </span>
                      </div>
                      
                      <div className="p-2 sm:p-3 flex flex-col justify-between flex-grow">
                        <div>
                          <h4 className="font-body font-bold text-[10.5px] sm:text-xs text-stone-900 group-hover:text-brand-orange-dark transition-colors line-clamp-1 text-left">
                            {p.name}
                          </h4>
                          <p className="text-[9px] sm:text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed text-left">
                            {p.description || "Un modèle de couture d'exception."}
                          </p>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="font-heading font-extrabold text-[9.5px] sm:text-[11px] text-brand-orange-dark">
                            {p.price.toLocaleString("fr-FR")} FCFA
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-heading font-bold uppercase tracking-wider text-stone-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                            Voir <ChevronRight className="w-2.5 h-2.5 text-brand-orange-dark animate-pulse" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
          </>
        )}

        {/* State 3: Workflow Inputs & Snapper */}
        {!loading && !result && (
          <div className="bg-[#FFEAD8]/95 backdrop-blur-xl border border-stone-200/50 rounded-3xl p-6 sm:p-8 relative shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[10px] font-heading font-bold uppercase tracking-[0.25em] text-brand-orange-dark bg-brand-orange-dark/5 border border-brand-orange-dark/15 px-3 py-1 rounded-full">
                Exclusivité Maison Habé
              </span>
              <h2 className="font-heading font-bold text-3xl text-stone-950 tracking-tight uppercase mt-4">
                Mesure IA
              </h2>
              <p className="text-xs font-body text-stone-600 mt-2 leading-relaxed">
                Prenez une photo de vous de face et en entier pour obtenir instantanément vos mesures exactes de couture grâce à notre intelligence artificielle. C'est 100% gratuit.
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
                    <Sliders className="w-4 h-4 text-stone-750" /> 1. CHOIX DU PROFIL COUTURE
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
                          onClick={() => setGender(g.id)}
                          className={`py-2.5 rounded-xl text-xs font-heading font-bold tracking-wide uppercase transition-all ${
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
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-[10px] text-stone-850 leading-relaxed space-y-2 font-medium">
                  <div className="flex items-center gap-1.5 text-amber-700 font-extrabold uppercase tracking-wider">
                    <motion.div
                      animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </motion.div>
                    <span>Recommandations de l'Atelier :</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600">
                    <li>Tenez-vous bien droit(e), face à l'appareil de préférence.</li>
                    <li>Portez des vêtements ajustés pour des mesures plus précises.</li>
                    <li>L'IA déterminera automatiquement votre hauteur et toutes vos mensurations clés à partir du cliché.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Direct Photo Frame */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-extrabold uppercase tracking-widest text-stone-900 mb-3 flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-stone-750" /> 2. Photo complète du corps
                </h3>

                {/* Frame Stage */}
                <div 
                  onClick={!imageSrc ? triggerFileSelector : undefined}
                  className={`w-full max-w-sm mx-auto aspect-[3/4] bg-stone-50 border border-stone-200/80 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner cursor-pointer hover:border-brand-orange-dark/25 transition-all ${!imageSrc ? 'hover:bg-stone-100/50' : ''}`}
                >
                  {/* Silhouette Dashed Guide when image exists */}
                  {imageSrc && (
                    <div className="absolute inset-4 border border-dashed border-stone-300 rounded-xl pointer-events-none z-10 flex items-center justify-center">
                      <svg viewBox="0 0 100 130" className="w-[70%] h-[75%] opacity-30 text-stone-400 stroke-current fill-none">
                        <ellipse cx="50" cy="20" rx="12" ry="15" strokeDasharray="3 3" />
                        <path d="M 30 40 L 70 40 L 65 95 L 35 95 Z" strokeDasharray="3 3" />
                        <line x1="50" y1="40" x2="50" y2="120" strokeDasharray="3 3" />
                      </svg>
                    </div>
                  )}

                  {/* Mode A: Preview Captured Photo */}
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Aperçu de la photo complète du corps"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Mode B: Idle Empty State */}
                  {!imageSrc && (
                    <div className="p-6 text-center max-w-[260px] flex flex-col items-center">
                      <motion.div 
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-14 h-14 bg-brand-orange-dark/5 rounded-full flex items-center justify-center border border-brand-orange-dark/20 mb-4 text-brand-orange-dark shadow-sm"
                      >
                        <Camera className="w-7 h-7" />
                      </motion.div>
                      <p className="text-xs font-heading font-extrabold text-stone-900 uppercase tracking-wider mb-2">
                        Prendre ou Importer une Photo
                      </p>
                      <p className="text-[10px] text-stone-500 leading-relaxed">
                        Cliquez pour ouvrir l'appareil photo de votre téléphone ou sélectionner une image existante. L'IA lancera l'analyse automatiquement.
                      </p>
                    </div>
                  )}

                  {/* Top-Right action button to reset and choose another one */}
                  {imageSrc && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-stone-900/90 hover:bg-stone-900 text-brand-orange-light flex items-center justify-center border border-stone-800 transition-colors"
                      title="Effacer et reprendre"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Controls below Frame */}
                <div className="flex gap-3">
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
                    className="w-full py-3.5 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white rounded-xl text-xs font-heading font-extrabold uppercase tracking-widest border border-brand-orange-light/20 shadow-lg shadow-brand-orange-dark/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Prendre une photo / Galerie
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passport Modal */}
        <AnimatePresence>
          {showPassportModal && adjustedResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPassportModal(false)}
                className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs"
              />

              {/* Passport Ticket */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-[#FCFBF9] text-stone-900 w-full max-w-lg rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
              >
                {/* Vintage Boarding Pass Notch Header */}
                <div className="bg-[#C1541A] text-white p-5 text-center relative shrink-0">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-stone-950/60 rounded-r-full" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-stone-950/60 rounded-l-full" />
                  <img 
                    src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma" 
                    alt="Maison Habé Logo" 
                    className="h-10 w-auto mx-auto brightness-0 invert"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="font-heading font-bold text-xs uppercase tracking-[0.3em] mt-2 text-amber-200">
                    Passeport de Couture Numérique
                  </h3>
                </div>

                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* User Profile Info */}
                  <div className="flex justify-between border-b border-dashed border-stone-200 pb-4 text-xs font-body">
                    <div>
                      <span className="text-stone-400 font-bold uppercase tracking-wider block text-[9px]">Titulaire</span>
                      <span className="font-heading font-extrabold text-stone-800 text-sm mt-0.5 block">
                        {user?.user_metadata?.full_name || user?.email || "Couturier Invité"}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold uppercase tracking-wider block text-[9px]">Couture Profil</span>
                      <span className="font-heading font-extrabold text-stone-800 text-sm mt-0.5 block">
                        {gender === "homme" ? "Homme" : "Enfant"} • {height} cm
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-bold uppercase tracking-wider block text-[9px]">Délivré le</span>
                      <span className="font-heading font-extrabold text-stone-800 text-sm mt-0.5 block">
                        {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  {/* Big Measurements List */}
                  <div className="space-y-2">
                    <span className="text-stone-400 font-bold uppercase tracking-wider block text-[9px]">Mensurations Officielles</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: "Tour de Poitrine", value: adjustedResult.poitrine },
                        { label: "Tour de Taille", value: adjustedResult.taille },
                        { label: "Tour de Hanche", value: adjustedResult.hanche },
                        { label: "Tour de Coude", value: adjustedResult.coude },
                        { label: "Longueur de Manche", value: adjustedResult.manche }
                      ].map((m, i) => (
                        <div key={i} className="flex justify-between items-center bg-stone-50 border border-stone-100 p-2.5 rounded-xl font-body">
                          <span className="text-stone-500 font-medium">{m.label}</span>
                          <span className="font-heading font-extrabold text-stone-900">{m.value} cm</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-stone-400 font-bold uppercase tracking-wider block text-[9px]">Recommandations de Tailles</span>
                    {(() => {
                      const recs = getRecommendations(gender, adjustedResult);
                      return (
                        <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-2xl flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <span className="text-brand-orange-dark font-extrabold text-[10px] uppercase tracking-wider">Morphologie</span>
                            <span className="font-heading font-extrabold text-stone-800 block text-xs">{recs.shape}</span>
                          </div>
                          <div className="flex gap-3 text-right">
                            <div>
                              <span className="text-stone-400 text-[9px] uppercase font-bold block">Chemise</span>
                              <span className="font-heading font-extrabold text-stone-800">{recs.shirtSize}</span>
                            </div>
                            <div>
                              <span className="text-stone-400 text-[9px] uppercase font-bold block">Veste</span>
                              <span className="font-heading font-extrabold text-stone-800">T{recs.blazerSize}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Barcode / QR Section */}
                  <div className="border-t border-stone-200 pt-5 flex flex-col items-center justify-center shrink-0">
                    <div className="font-mono text-[10px] text-stone-400 tracking-[0.25em] uppercase mb-1.5">
                      MAISON HABE Bespoke ID
                    </div>
                    <div className="h-10 w-full max-w-[280px] flex items-center justify-between opacity-80 gap-[2px]">
                      {/* Generates a nice retro abstract barcode using SVG bars */}
                      {Array.from({ length: 42 }).map((_, idx) => {
                        const heights = ["h-6", "h-8", "h-10", "h-7"];
                        const widths = ["w-[1px]", "w-[2px]", "w-[3px]"];
                        const randomHeight = heights[(idx * 3 + 1) % heights.length];
                        const randomWidth = widths[(idx * 7 + 2) % widths.length];
                        return (
                          <div key={idx} className={`${randomWidth} ${randomHeight} bg-stone-900 rounded-xs`} />
                        );
                      })}
                    </div>
                    <div className="font-mono text-[9px] text-stone-500 mt-1">
                      *MH-B-{height}-{gender.toUpperCase()}-{adjustedResult.poitrine}*
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-stone-50 p-4 border-t border-stone-200/80 flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      if (!adjustedResult) return;
                      const text = `PASSEPORT DE COUTURE NUMÉRIQUE - MAISON HABÉ\n\n` +
                        `Titulaire : ${user?.user_metadata?.full_name || user?.email || "Couturier Invité"}\n` +
                        `Genre : ${gender === "homme" ? "Homme" : "Enfant"}\n` +
                        `Hauteur : ${height} cm\n\n` +
                        `MESURATIONS :\n` +
                        `- Tour de Poitrine : ${adjustedResult.poitrine} cm\n` +
                        `- Tour de Taille : ${adjustedResult.taille} cm\n` +
                        `- Tour de Hanche : ${adjustedResult.hanche} cm\n` +
                        `- Tour de Coude : ${adjustedResult.coude} cm\n` +
                        `- Longueur de Manche : ${adjustedResult.manche} cm\n\n` +
                        `Recommandations de tailles d'Atelier : Veste T${getRecommendations(gender, adjustedResult).blazerSize}, Chemise ${getRecommendations(gender, adjustedResult).shirtSize}\n` +
                        `Délivré numériquement sur Maison Habé IA`;

                      navigator.clipboard.writeText(text);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2500);
                    }}
                    className="flex-1 py-3 bg-white hover:bg-stone-100 active:scale-95 text-stone-700 border border-stone-300 rounded-xl font-heading font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5 text-brand-orange-dark" />
                    {copySuccess ? "Copié !" : "Copier les mesures"}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-brand-orange-dark hover:bg-brand-orange-dark/95 active:scale-95 text-white rounded-xl font-heading font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-orange-dark/15 border border-brand-orange-light/20 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimer / PDF
                  </button>

                  <button
                    onClick={() => setShowPassportModal(false)}
                    className="py-3 px-4 bg-stone-200 hover:bg-stone-300 active:scale-95 text-stone-600 rounded-xl font-heading font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
