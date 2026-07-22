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
import { Bodygee3DScanner } from "../components/Bodygee3DScanner";
import { MeasureResult } from "../types";

interface MeasurePageProps {
  onBackToChoice: () => void;
  onGoToBoutique: () => void;
}

export const computeLocalMeasurements = (gender: string, inputHeight: number): MeasureResult => {
  const isHomme = gender === "homme";
  const h = inputHeight || (isHomme ? 175 : 125);
  
  // Deterministic fluctuations based on height to keep things stable when adjusting sliders
  const seed = (h % 10) + 1;
  const fluctuation = (field: string) => {
    const hash = field.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash + seed) % 5) - 2; // -2 to +2 cm
  };

  let fesse = 0;
  let poitrine = 0;
  let ceinture = 0;
  let epaule = 0;
  let cou = 0;
  let manche = 0;
  let tour_manche = 0;
  let longueur_boubou = 0;
  let longueur_pantalon = 0;
  let cuisse = 0;

  if (isHomme) {
    // Fesse: 85cm à 120cm
    fesse = Math.round(h * 0.54 + fluctuation("fesse"));
    fesse = Math.min(120, Math.max(85, fesse));

    // Poitrine: fesse + 5cm
    poitrine = fesse + 5;

    // Ceinture: = fesse
    ceinture = fesse;

    // Épaule: 43cm ou plus
    epaule = Math.round(h * 0.26 + fluctuation("epaule"));
    epaule = Math.max(43, epaule);

    // Cou: 36cm à 44cm
    cou = Math.round(h * 0.22 + fluctuation("cou"));
    cou = Math.min(44, Math.max(36, cou));

    // Manche: e.g. 55 to 75
    manche = Math.round(h * 0.35 + fluctuation("manche"));
    manche = Math.min(75, Math.max(55, manche));

    // Tour de Manche: 30cm à 44cm
    tour_manche = Math.round(h * 0.20 + fluctuation("tour_manche"));
    tour_manche = Math.min(44, Math.max(30, tour_manche));

    // Longueur boubou: 84cm à 100cm
    longueur_boubou = Math.round(h * 0.52 + fluctuation("longueur_boubou"));
    longueur_boubou = Math.min(100, Math.max(84, longueur_boubou));

    // Longueur pantalon: 95cm à 115cm
    longueur_pantalon = Math.round(h * 0.58 + fluctuation("longueur_pantalon"));
    longueur_pantalon = Math.min(115, Math.max(95, longueur_pantalon));

    // Cuisse: 48 à 75 cm
    cuisse = Math.round(h * 0.32 + fluctuation("cuisse"));
    cuisse = Math.min(75, Math.max(48, cuisse));
  } else {
    // Enfant
    fesse = Math.round(h * 0.48 + fluctuation("fesse_enf"));
    poitrine = fesse + 3;
    ceinture = fesse;
    epaule = Math.round(h * 0.24 + fluctuation("epaule_enf"));
    cou = Math.round(h * 0.20 + fluctuation("cou_enf"));
    manche = Math.round(h * 0.32 + fluctuation("manche_enf"));
    tour_manche = Math.round(h * 0.16 + fluctuation("tour_manche_enf"));
    longueur_boubou = Math.round(h * 0.46 + fluctuation("longueur_boubou_enf"));
    longueur_pantalon = Math.round(h * 0.50 + fluctuation("longueur_pantalon_enf"));
    cuisse = Math.round(h * 0.28 + fluctuation("cuisse_enf"));
  }

  let comment = "";
  if (isHomme) {
    comment = `Votre morphologie présente une excellente proportion athlétique pour un homme avec une poitrine de ${poitrine}cm et un tour de fesse/bassin de ${fesse}cm. Votre stature est idéale pour nos grands boubous majestueux Habé (longueur de ${longueur_boubou}cm préconisée) et nos coupes de pantalons ajustées (longueur de ${longueur_pantalon}cm).`;
  } else {
    comment = `Un profil de jeune couturier en pleine croissance, dynamique et très prometteur. Ses proportions sont régulières, ce qui facilite un seyant impeccable pour tous nos ensembles pour enfants et tenues de fête traditionnelles. Optez pour une aisance confortable de 2 cm supplémentaires lors de la coupe de ses vêtements.`;
  }

  return {
    hauteur: h,
    epaule,
    cou,
    manche,
    tour_manche,
    longueur_boubou,
    longueur_pantalon,
    fesse,
    poitrine,
    cuisse,
    ceinture,
    comment
  };
};

export const getRecommendations = (gender: string, m: MeasureResult) => {
  // Determine Body shape
  let shape = "";
  let shapeDesc = "";
  
  if (gender === "homme") {
    const diffPT = m.poitrine - m.ceinture;
    if (diffPT >= 10) {
      shape = "Morphologie Athlétique (V-Shape)";
      shapeDesc = "Vos épaules et votre poitrine sont bien développées par rapport à votre ceinture. Les coupes ajustées (Slim Fit) pour les chemises et les vestes cintrées mettront particulièrement en valeur votre carrure.";
    } else if (diffPT <= 2 && m.ceinture >= m.poitrine) {
      shape = "Morphologie Ovale / Solide";
      shapeDesc = "Votre corps est harmonieux avec du volume au niveau du buste. Privilégiez des vêtements structurés mais confortables (Regular Fit), des vestes droites à deux boutons pour allonger votre silhouette.";
    } else {
      shape = "Morphologie Rectangulaire / Classique";
      shapeDesc = "Vos épaules, votre taille/ceinture et vos hanches/fesses sont alignées de façon équilibrée. C'est un profil idéal pour jouer sur les superpositions. Les vestes structurées aux épaules marquées vous iront à merveille.";
    }
  } else {
    // Enfant
    const diffPH = m.poitrine - m.fesse;
    if (diffPH >= 4) {
      shape = "Morphologie Conique / Grandissant";
      shapeDesc = "Un profil élancé en pleine croissance. Parfait pour les ensembles boubou avec épaules dégagées.";
    } else {
      shape = "Morphologie Régulière";
      shapeDesc = "Proportions standards idéales pour toutes nos collections d'enfants.";
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
    if (m.poitrine < 62) shirtSize = "6/8 ans";
    else if (m.poitrine < 72) shirtSize = "8/10 ans";
    else if (m.poitrine < 82) shirtSize = "10/12 ans";
    else shirtSize = "12/14 ans";
  }

  // Blazer / Veste (FR size)
  let blazerSize = 0;
  if (gender === "homme") {
    blazerSize = Math.round(m.poitrine / 2);
  } else {
    blazerSize = Math.round(m.poitrine / 2) - 6;
  }
  blazerSize = Math.max(24, Math.min(62, blazerSize - (blazerSize % 2)));

  // Trouser (FR size)
  let trouserSize = 0;
  if (gender === "homme") {
    trouserSize = Math.round(m.ceinture / 2);
  } else {
    trouserSize = Math.round(m.ceinture / 2) - 4;
  }
  trouserSize = Math.max(22, Math.min(58, trouserSize - (trouserSize % 2)));

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
  const [isLocalFallback, setIsLocalFallback] = useState<boolean>(false);
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
        stopCamera();
        
        // Compress and resize image for faster transmission
        resizeImage(dataUrl).then((resized) => {
          setImageSrc(resized);
          calculateMeasurements(resized);
        }).catch(() => {
          setImageSrc(dataUrl);
          calculateMeasurements(dataUrl);
        });
      }
    }
  };

  // Helper to downscale and compress images for ultra-fast uploads and AI processing
  const resizeImage = (dataUrl: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      // If the image is already small (under 80KB), keep it untouched
      if (dataUrl.length < 80000) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 800;

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
          resolve(canvas.toDataURL("image/jpeg", 0.75)); // Optimized JPEG compression for lightning-fast AI analysis
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
            const resized = await resizeImage(base64, 800, 800);
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
    let rawActiveImage = overrideImage || imageSrc;
    if (!rawActiveImage) return;
    setLoading(true);
    setLoadingStep(0);
    setError(null);

    // Fast image downscaling before network transfer
    const activeImage = await resizeImage(rawActiveImage, 800, 800);

    // Absolute fallback URLs for dev and prod
    const devUrl = "https://ais-dev-upzhp3kqwztocsgkzoovce-115539072125.europe-west2.run.app/api/measure";
    const sharedUrl = "https://ais-pre-upzhp3kqwztocsgkzoovce-115539072125.europe-west2.run.app/api/measure";

    const endpoints: string[] = [];

    // 0. User-defined custom backend URL (for self-hosting and advanced deployments)
    const customBackendUrl = (import.meta as any).env?.VITE_BACKEND_URL;
    if (customBackendUrl) {
      // Normalize url to avoid double slashes or missing api suffix
      const normalizedUrl = customBackendUrl.endsWith("/api/measure")
        ? customBackendUrl
        : customBackendUrl.endsWith("/")
        ? `${customBackendUrl}api/measure`
        : `${customBackendUrl}/api/measure`;
      endpoints.push(normalizedUrl);
    }

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
    let primaryEndpointError: string | null = null;
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
          const msg = `404 non trouvé à ${url}`;
          lastFetchError = new Error(msg);
          if (url === "/api/measure" || url === customBackendUrl) {
            primaryEndpointError = "Le serveur a retourné une erreur 404 (La route /api/measure n'existe pas ou le backend n'est pas lancé).";
          }
          continue;
        }

        // If we got redirected (such as AI Studio Google SSO login page) or received HTML instead of JSON
        const contentType = res.headers.get("content-type") || "";
        if (res.redirected || contentType.includes("text/html")) {
          console.warn(`Endpoint ${url} a redirigé ou retourné du HTML. Essai du point d'accès suivant...`);
          const msg = `Redirection ou réponse HTML reçue de ${url}`;
          lastFetchError = new Error(msg);
          if (url === "/api/measure" || url === customBackendUrl) {
            primaryEndpointError = "La requête a été interceptée par une redirection. Les navigateurs bloquent souvent cela (CORS / Cookies tiers).";
          }
          continue;
        }

        response = res;
        successfulUrl = url;
        break; // Found a working endpoint!
      } catch (err: any) {
        console.warn(`Échec de connexion au point d'accès ${url}:`, err.message || err);
        lastFetchError = err;
        if (url === "/api/measure" || url === customBackendUrl) {
          primaryEndpointError = `Erreur réseau : ${err.message || "Connexion refusée"}`;
        }
      }
    }

    try {
      if (!response) {
        console.warn("Aucune réponse du serveur. Utilisation du processeur de couture local de Maison Habé...");
        setIsLocalFallback(true);
        const localData = computeLocalMeasurements(gender, parseInt(height));
        setResult(localData);
        setAdjustedResult(localData);
        
        localStorage.setItem("habe_ai_measurements", JSON.stringify({
          ...localData,
          gender,
          height: localData.hauteur ? localData.hauteur.toString() : height,
          date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          isLocal: true
        }));
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
          console.warn("Photo rejetée par l'analyseur IA :", errMsg);
          setError(errMsg);
          setLoading(false);
          setResult(null);
          setAdjustedResult(null);
          return;
        }

        console.warn("Erreur de réponse du serveur. Utilisation de l'Atelier local Maison Habé...");
        setIsLocalFallback(true);
        const localData = computeLocalMeasurements(gender, parseInt(height));
        setResult(localData);
        setAdjustedResult(localData);
        
        localStorage.setItem("habe_ai_measurements", JSON.stringify({
          ...localData,
          gender,
          height: localData.hauteur ? localData.hauteur.toString() : height,
          date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
          isLocal: true
        }));
        setLoading(false);
        return;
      }

      // Safe text-first reading to prevent Safari's native response.json() exception triggers
      const rawText = await response.text();
      let data: MeasureResult;
      try {
        data = JSON.parse(rawText.trim());
        setIsLocalFallback(data.isLocal === true);
      } catch (parseErr: any) {
        console.warn("Échec d'analyse de la réponse IA. Utilisation de l'Atelier de couture local...");
        setIsLocalFallback(true);
        data = computeLocalMeasurements(gender, parseInt(height));
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
      console.warn("Exception durant le traitement IA. Utilisation du processeur de couture local...", err);
      setIsLocalFallback(true);
      const localData = computeLocalMeasurements(gender, parseInt(height));
      setResult(localData);
      setAdjustedResult(localData);
      
      localStorage.setItem("habe_ai_measurements", JSON.stringify({
        ...localData,
        gender,
        height: localData.hauteur ? localData.hauteur.toString() : height,
        date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        isLocal: true
      }));
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
            {/* 3D Bodygee Animated Scanner Column */}
            <div className="md:col-span-5 bg-[#FFEAD8]/95 backdrop-blur-xl border border-white/40 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center min-h-[360px] sm:min-h-[450px] shadow-2xl relative overflow-hidden w-full max-w-sm md:max-w-none mx-auto">
              <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="w-full flex items-center justify-between mb-3 border-b border-white/30 pb-2">
                <h3 className="text-xs font-heading font-bold uppercase tracking-widest text-brand-orange-dark flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Avatar 3D Bodygee
                </h3>
                <span className="text-[9px] font-mono text-stone-500 bg-white/50 px-2 py-0.5 rounded-full border border-stone-200">
                  360° Scan
                </span>
              </div>

              <Bodygee3DScanner
                adjustedResult={adjustedResult}
                imageSrc={imageSrc}
                gender={gender}
                height={height}
                hoveredMeasure={hoveredMeasure}
                setHoveredMeasure={setHoveredMeasure}
              />

              <div className="mt-4 flex gap-3 text-stone-600 text-[10px] font-extrabold font-heading">
                <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-full border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-orange-dark" />
                  Maison Habé 3D
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
                  {isLocalFallback ? (
                    <div className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] rounded-full flex items-center gap-1 font-heading font-extrabold shrink-0">
                      <Cpu className="w-3 h-3 animate-pulse text-amber-600" /> ATELIER LOCAL
                    </div>
                  ) : (
                    <div className="px-2.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] rounded-full flex items-center gap-1 font-heading font-extrabold shrink-0">
                      <Check className="w-3 h-3" /> PRÉCISION IA
                    </div>
                  )}
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
                          { key: "epaule", label: "Épaule", value: adjustedResult.epaule, color: "border-amber-500/30" },
                          { key: "cou", label: "Tour de Cou", value: adjustedResult.cou, color: "border-amber-500/30" },
                          { key: "manche", label: "Longueur Manche", value: adjustedResult.manche, color: "border-amber-400/30" },
                          { key: "tour_manche", label: "Tour de Manche", value: adjustedResult.tour_manche, color: "border-amber-400/30" },
                          { key: "longueur_boubou", label: "Longueur Boubou", value: adjustedResult.longueur_boubou, color: "border-orange-500/30" },
                          { key: "longueur_pantalon", label: "Longueur Pantalon", value: adjustedResult.longueur_pantalon, color: "border-orange-500/30" },
                          { key: "fesse", label: "Tour de Fesse", value: adjustedResult.fesse, color: "border-brand-orange-light/30" },
                          { key: "poitrine", label: "Tour de Poitrine", value: adjustedResult.poitrine, color: "border-orange-400/30" },
                          { key: "cuisse", label: "Tour de Cuisse", value: adjustedResult.cuisse, color: "border-orange-400/30" },
                          { key: "ceinture", label: "Ceinture (Fesse)", value: adjustedResult.ceinture, color: "border-brand-orange-light/30" }
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
                          { key: "epaule", label: "Épaule", min: 35, max: 65 },
                          { key: "cou", label: "Tour de Cou", min: 25, max: 55 },
                          { key: "manche", label: "Longueur de Manche", min: 40, max: 85 },
                          { key: "tour_manche", label: "Tour de Manche", min: 20, max: 55 },
                          { key: "longueur_boubou", label: "Longueur Boubou", min: 70, max: 120 },
                          { key: "longueur_pantalon", label: "Longueur Pantalon", min: 80, max: 130 },
                          { key: "fesse", label: "Tour de Fesse", min: 70, max: 130 },
                          { key: "poitrine", label: "Tour de Poitrine", min: 70, max: 130 },
                          { key: "cuisse", label: "Tour de Cuisse", min: 35, max: 85 },
                          { key: "ceinture", label: "Ceinture (Fesse)", min: 70, max: 130 }
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
                                  let updated = { ...adjustedResult, [slider.key]: newVal };
                                  if (slider.key === "hauteur") {
                                    setHeight(newVal.toString());
                                  } else if (slider.key === "fesse") {
                                    updated.ceinture = newVal;
                                    updated.poitrine = newVal + 5;
                                  } else if (slider.key === "ceinture") {
                                    updated.fesse = newVal;
                                    updated.poitrine = newVal + 5;
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
                          onClick={() => {
                            setGender(g.id);
                            setHeight(g.id === "homme" ? "175" : "125");
                          }}
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
                         { label: "Épaule", value: adjustedResult.epaule },
                         { label: "Tour de Cou", value: adjustedResult.cou },
                         { label: "Tour de Poitrine", value: adjustedResult.poitrine },
                         { label: "Ceinture (Fesse)", value: adjustedResult.ceinture },
                         { label: "Tour de Fesse", value: adjustedResult.fesse },
                         { label: "Longueur Manche", value: adjustedResult.manche }
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
                         `- Épaule : ${adjustedResult.epaule} cm\n` +
                         `- Tour de Cou : ${adjustedResult.cou} cm\n` +
                         `- Longueur de Manche : ${adjustedResult.manche} cm\n` +
                         `- Tour de Manche : ${adjustedResult.tour_manche} cm\n` +
                         `- Longueur de Boubou : ${adjustedResult.longueur_boubou} cm\n` +
                         `- Longueur de Pantalon : ${adjustedResult.longueur_pantalon} cm\n` +
                         `- Tour de Fesse : ${adjustedResult.fesse} cm\n` +
                         `- Tour de Poitrine : ${adjustedResult.poitrine} cm\n` +
                         `- Tour de Cuisse : ${adjustedResult.cuisse} cm\n` +
                         `- Ceinture (Fesse) : ${adjustedResult.ceinture} cm\n\n` +
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
