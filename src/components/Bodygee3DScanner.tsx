import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { MeasureResult } from '../types';

interface Bodygee3DScannerProps {
  adjustedResult: MeasureResult;
  imageSrc: string | null;
  gender: string;
  height: string;
  hoveredMeasure: string | null;
  setHoveredMeasure: (key: string | null) => void;
}

export const Bodygee3DScanner: React.FC<Bodygee3DScannerProps> = ({
  adjustedResult,
  imageSrc,
  gender,
  height,
  hoveredMeasure,
  setHoveredMeasure
}) => {
  const [rotationAngle, setRotationAngle] = useState<number>(0);

  // Auto 360 rotation loop (unaffected)
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 1.5) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Dynamic light & depth calculation based on 360 rotation angle
  const rad = (rotationAngle * Math.PI) / 180;
  const cosRad = Math.cos(rad);
  const sinRad = Math.sin(rad);

  const brightness = 0.92 + 0.18 * cosRad;
  const backShading = cosRad < 0 ? Math.abs(cosRad) * 0.25 : 0;
  const shadowOffset = sinRad * 20;

  // Key measurements callout list
  const callouts = [
    { key: 'epaule', label: 'Épaule', value: `${adjustedResult.epaule} cm`, top: '16%', side: 'left' },
    { key: 'cou', label: 'Tour de Cou', value: `${adjustedResult.cou} cm`, top: '10%', side: 'right' },
    { key: 'poitrine', label: 'Poitrine', value: `${adjustedResult.poitrine} cm`, top: '27%', side: 'left' },
    { key: 'manche', label: 'Manche', value: `${adjustedResult.manche} cm`, top: '35%', side: 'right' },
    { key: 'ceinture', label: 'Ceinture', value: `${adjustedResult.ceinture} cm`, top: '48%', side: 'left' },
    { key: 'fesse', label: 'Fesses', value: `${adjustedResult.fesse} cm`, top: '56%', side: 'right' },
    { key: 'longueur_boubou', label: 'Longueur Boubou', value: `${adjustedResult.longueur_boubou} cm`, top: '68%', side: 'left' },
    { key: 'longueur_pantalon', label: 'Longueur Pantalon', value: `${adjustedResult.longueur_pantalon} cm`, top: '78%', side: 'right' },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Control Status Bar - White Buttons & Black Text */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-[#E2B793]/80 shadow-md">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 text-[10px] font-heading font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-brand-orange-dark animate-pulse" />
            Scanner Photo 3D IA
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-stone-900 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-sm font-bold">
            <ImageIcon className="w-3 h-3 text-brand-orange-dark" />
            Photo d'origine
          </div>
        </div>

        {/* Face Reset Button */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => setRotationAngle(0)}
            className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-900 hover:bg-stone-50 transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-heading font-extrabold shadow-sm active:scale-95"
            title="Recentrer de face (0°)"
          >
            <RotateCw className="w-3.5 h-3.5 text-brand-orange-dark" />
            <span>Face (0°)</span>
          </button>
        </div>
      </div>

      {/* Main 3D Scanner Stage Container adapted to warm card background */}
      <div className="relative w-full aspect-[4/5] max-h-[530px] bg-[#F7DAC1] rounded-3xl border border-[#E2B793] shadow-xl overflow-hidden flex items-center justify-center">
        {/* Studio Lighting Background in warm tones matching #FFEAD8 background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/90 via-[#F7DAC1] to-[#E3B995] pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-[#D2A078]/60 via-[#F7DAC1]/50 to-transparent pointer-events-none" />

        {/* Height Ruler Grid */}
        <div className="absolute left-3 top-8 bottom-16 flex flex-col justify-between text-[8px] font-mono text-stone-800 select-none pointer-events-none z-10 border-l border-[#C89870]/60 pl-1.5">
          {Array.from({ length: 9 }).map((_, idx) => {
            const val = Math.round(parseInt(height || '175') * (1 - idx / 8));
            return (
              <div key={idx} className="flex items-center gap-1">
                <span className="w-2 h-[1px] bg-[#B07E56]" />
                <span className="font-bold">{val} cm</span>
              </div>
            );
          })}
        </div>

        {/* 3D Stage Arena */}
        <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
          
          {/* HUD Header Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 border border-stone-200 backdrop-blur-md px-3.5 py-1.5 rounded-full z-20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-brand-orange-dark animate-pulse" />
            <span className="text-[9.5px] font-heading font-extrabold uppercase tracking-widest text-stone-900">
              CABINE 3D IA • {height} CM • {gender.toUpperCase()}
            </span>
          </div>

          {/* REALISTIC 3D VOLUMETRIC AVATAR CONTAINER */}
          <div className="relative w-full h-full flex items-center justify-center">
            
            <div className="relative h-[84%] aspect-[1/2] flex flex-col items-center justify-end">
              
              {/* 3D Multi-Layer Volumetric Rotating Structure */}
              <div 
                className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `perspective(1000px) rotateY(${rotationAngle}deg)`,
                  transformStyle: 'preserve-3d',
                  filter: `brightness(${brightness}) contrast(1.04)`
                }}
              >
                {/* 1. FRONT LAYER (Original Photo or SVG fallback) */}
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: 'translateZ(14px)', transformStyle: 'preserve-3d' }}
                >
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="3D Avatar Front"
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(100,60,30,0.35)] rounded-2xl"
                    />
                  ) : (
                    <svg viewBox="0 0 100 200" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]">
                      <path d="M 50 14 C 45 14, 43 17, 43 21 C 43 25, 45 27, 50 27 C 55 27, 57 25, 57 21 C 57 17, 55 14, 50 14 Z" fill="#f59e0b" stroke="#fef3c7" strokeWidth="0.8" />
                      <path d="M 32 37 C 36 34, 42 34, 50 34 C 58 34, 64 34, 68 37 C 73 45, 71 60, 65 72 C 60 82, 58 88, 58 92 L 42 92 C 42 88, 40 82, 35 72 C 29 60, 27 45, 32 37 Z" fill="#d97706" stroke="#fef3c7" strokeWidth="0.8" />
                      <path d="M 42 92 L 40 140 L 43 188 L 47 188 L 48 140 L 50 108 L 52 140 L 53 188 L 57 188 L 60 140 L 58 92 Z" fill="#b45309" stroke="#f59e0b" strokeWidth="0.8" />
                    </svg>
                  )}
                </div>

                {/* 2. MID-FRONT DEPTH LAYER */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none"
                  style={{ transform: 'translateZ(7px)', transformStyle: 'preserve-3d' }}
                >
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="3D Volume Slice 1"
                      className="max-h-full max-w-full object-contain filter brightness-95 blur-[0.4px] contrast-105 rounded-2xl"
                    />
                  ) : null}
                </div>

                {/* 3. CENTER CORE DEPTH LAYER */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-75 pointer-events-none"
                  style={{ transform: 'translateZ(0px)', transformStyle: 'preserve-3d' }}
                >
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="3D Volume Core"
                      className="max-h-full max-w-full object-contain filter brightness-90 blur-[0.8px] rounded-2xl"
                    />
                  ) : null}
                </div>

                {/* 4. MID-BACK DEPTH LAYER */}
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none"
                  style={{ transform: 'translateZ(-7px)', transformStyle: 'preserve-3d' }}
                >
                  {imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="3D Volume Slice 2"
                      className="max-h-full max-w-full object-contain filter brightness-80 blur-[0.4px] rounded-2xl"
                    />
                  ) : null}
                </div>

                {/* 5. BACK LAYER */}
                <div 
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: 'translateZ(-14px) rotateY(180deg)', transformStyle: 'preserve-3d' }}
                >
                  {imageSrc ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={imageSrc} 
                        alt="3D Avatar Back"
                        className="max-h-full max-w-full object-contain filter brightness-75 contrast-110 rounded-2xl"
                      />
                      {/* Back Shading Overlay */}
                      <div 
                        className="absolute inset-0 bg-[#3D2F25]/30 rounded-2xl"
                        style={{ opacity: backShading }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* 6. REALISTIC ANATOMICAL SIDE PROFILE PANELS */}
                {/* RIGHT SIDE PROFILE (90°) */}
                <div 
                  className="absolute inset-y-0 w-[45px] left-1/2 -ml-[22.5px] flex items-center justify-center pointer-events-none z-10 opacity-90"
                  style={{ 
                    transform: 'rotateY(90deg) translateZ(14px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <svg viewBox="0 0 45 200" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(100,60,30,0.3)]">
                    <defs>
                      <linearGradient id="sideProfileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8C5B38" stopOpacity="0.95" />
                        <stop offset="50%" stopColor="#D97706" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6E4427" stopOpacity="0.95" />
                      </linearGradient>
                    </defs>
                    <ellipse cx="22.5" cy="21" rx="10" ry="12" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                    <path d="M 18 33 L 27 33 L 26 38 L 19 38 Z" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                    <path d="M 19 38 C 14 42, 10 50, 8 60 C 7 72, 12 82, 14 92 L 31 92 C 34 82, 38 72, 36 60 C 34 48, 29 42, 26 38 Z" fill="url(#sideProfileGrad)" stroke="#fef3c7" strokeWidth="0.8" />
                    <path d="M 14 92 C 12 110, 15 140, 18 188 L 27 188 C 30 140, 33 110, 31 92 Z" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                  </svg>
                </div>

                {/* LEFT SIDE PROFILE (-90°) */}
                <div 
                  className="absolute inset-y-0 w-[45px] left-1/2 -ml-[22.5px] flex items-center justify-center pointer-events-none z-10 opacity-90"
                  style={{ 
                    transform: 'rotateY(-90deg) translateZ(14px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <svg viewBox="0 0 45 200" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(100,60,30,0.3)]">
                    <ellipse cx="22.5" cy="21" rx="10" ry="12" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                    <path d="M 18 33 L 27 33 L 26 38 L 19 38 Z" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                    <path d="M 19 38 C 14 42, 10 50, 8 60 C 7 72, 12 82, 14 92 L 31 92 C 34 82, 38 72, 36 60 C 34 48, 29 42, 26 38 Z" fill="url(#sideProfileGrad)" stroke="#fef3c7" strokeWidth="0.8" />
                    <path d="M 14 92 C 12 110, 15 140, 18 188 L 27 188 C 30 140, 33 110, 31 92 Z" fill="url(#sideProfileGrad)" stroke="#f59e0b" strokeWidth="0.8" />
                  </svg>
                </div>

              </div>

              {/* Realistic 3D Platform Base in warm bronze/stone tones */}
              <div className="relative w-[190px] h-[40px] -mt-3 z-0 pointer-events-none flex items-center justify-center">
                {/* Base Shadow */}
                <div 
                  className="absolute inset-0 rounded-full bg-[#8C5B38]/40 blur-md"
                  style={{ transform: `translateX(${shadowOffset}px) scaleY(0.4)` }}
                />

                {/* Rotating Metallic Platform Base */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-[#C2956E] bg-gradient-to-r from-[#8C5B38] via-[#B8845C] to-[#784A2A] shadow-[0_4px_16px_rgba(140,85,40,0.4)]"
                  style={{
                    transform: 'perspective(400px) rotateX(72deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div 
                    className="absolute inset-1 rounded-full border border-amber-300/60 bg-gradient-to-tr from-amber-400/20 to-transparent"
                    style={{ transform: `rotate(${rotationAngle}deg)` }}
                  />
                  <div className="absolute inset-3 rounded-full border border-[#D9A378] flex items-center justify-center">
                    <span className="text-[7px] font-mono text-amber-100 font-bold uppercase tracking-widest text-center drop-shadow-sm">
                      BODYGEE 3D
                    </span>
                  </div>
                </div>
              </div>

              {/* Tag Label at Base */}
              <div className="mt-2 px-3 py-1 bg-white/95 border border-stone-200 rounded-full text-[8.5px] font-heading font-extrabold uppercase tracking-widest text-stone-900 shadow-md">
                SCAN 3D VOLUMÉTRIQUE • 360°
              </div>
            </div>

          </div>

          {/* Floating HUD Measurement Badges - White with Black Text */}
          {callouts.map((c, i) => {
            const isHovered = hoveredMeasure === c.key;
            return (
              <motion.div
                key={i}
                onMouseEnter={() => setHoveredMeasure(c.key)}
                onMouseLeave={() => setHoveredMeasure(null)}
                whileHover={{ scale: 1.08 }}
                className={`absolute z-30 cursor-pointer transition-all duration-200 backdrop-blur-md px-2.5 py-1 rounded-xl border shadow-lg flex items-center gap-1.5 ${
                  c.side === 'left' ? 'left-2 sm:left-4' : 'right-2 sm:right-4'
                } ${
                  isHovered
                    ? 'bg-brand-orange-dark text-white border-brand-orange-light ring-2 ring-amber-400 shadow-amber-500/50 scale-105'
                    : 'bg-white/95 text-stone-900 border-stone-200 hover:bg-white'
                }`}
                style={{ top: c.top }}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-white animate-pulse' : 'bg-brand-orange-dark'}`} />
                <div className="flex flex-col text-left">
                  <span className={`text-[7.5px] font-heading font-extrabold uppercase tracking-wider ${isHovered ? 'text-white' : 'text-stone-600'}`}>
                    {c.label}
                  </span>
                  <span className={`text-[10px] font-heading font-extrabold ${isHovered ? 'text-white' : 'text-brand-orange-dark'}`}>
                    {c.value}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


