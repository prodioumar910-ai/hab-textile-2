import React, { useState, useEffect, useRef } from 'react';

interface TransparentIconProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon: React.ReactNode;
}

const processedCache = new Map<string, string>();

export const TransparentIcon: React.FC<TransparentIconProps> = ({
  src,
  alt,
  className = "w-10 h-10 object-contain",
  fallbackIcon
}) => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!src) {
      setError(true);
      return;
    }

    if (processedCache.has(src)) {
      setProcessedSrc(processedCache.get(src)!);
      setError(false);
      return;
    }

    // Prevent multiple parallel processing runs for the same src
    if (isProcessing.current) return;
    isProcessing.current = true;

    const img = new Image();
    const isExternal = src.includes('://') && !src.includes(window.location.host);
    if (isExternal) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setError(true);
          isProcessing.current = false;
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // 1. Sampling multi-point border colors to build an exhaustive background baseline
        const samplePoints: [number, number][] = [];
        const w = canvas.width;
        const h = canvas.height;

        // Sample along top and bottom edges
        for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 6))) {
          samplePoints.push([x, 0]);
          samplePoints.push([x, h - 1]);
        }
        // Sample along left and right edges
        for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 6))) {
          samplePoints.push([0, y]);
          samplePoints.push([w - 1, y]);
        }

        // Aggregate unique source baseline colors (avoiding already transparent ones)
        const bgColors: {r: number, g: number, b: number}[] = [];
        samplePoints.forEach(([x, y]) => {
          const idx = (y * w + x) * 4;
          if (idx < data.length && data[idx + 3] > 80) {
            bgColors.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
          }
        });

        // 2. Average baseline calculation
        let avgR = 255, avgG = 255, avgB = 255;
        if (bgColors.length > 0) {
          const sum = bgColors.reduce((acc, curr) => ({ r: acc.r + curr.r, g: acc.g + curr.g, b: acc.b + curr.b }), { r: 0, g: 0, b: 0 });
          avgR = Math.floor(sum.r / bgColors.length);
          avgG = Math.floor(sum.g / bgColors.length);
          avgB = Math.floor(sum.b / bgColors.length);
        }

        // Broad tolerance to cover soft shadows or gradients
        const tolerance = 58;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          if (a === 0) continue; // Skip already transparent pixels

          // Calculate distance to average background
          const distToAvgBg = Math.sqrt(
            Math.pow(r - avgR, 2) + 
            Math.pow(g - avgG, 2) + 
            Math.pow(b - avgB, 2)
          );

          // Find lowest distance to any specific border sample color (great for gradients or lighting shifts)
          let minDistToSample = 999999;
          for (const bgC of bgColors) {
            const dist = Math.sqrt(
              Math.pow(r - bgC.r, 2) + 
              Math.pow(g - bgC.g, 2) + 
              Math.pow(b - bgC.b, 2)
            );
            if (dist < minDistToSample) {
              minDistToSample = dist;
            }
          }

          // Use the tightest match
          const bestBgDist = Math.min(distToAvgBg, minDistToSample);

          // Distance to pure white
          const distToWhite = Math.sqrt(
            Math.pow(r - 255, 2) + 
            Math.pow(g - 255, 2) + 
            Math.pow(b - 255, 2)
          );

          // Luminance and grayness checking (ideal for removing studio backgrounds, soft shadows & grey sheets)
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(b - r));
          const isNeutralBright = maxDiff < 36 && luminance > 158; // Studio sheets/shadows are highly balanced grays
          const isWhiteBackground = r > 198 && g > 198 && b > 198;

          let alphaFactor = 1.0;

          // If close to baseline, sample baseline, pure white, or is gray studio background, fade it out
          if (bestBgDist < tolerance || distToWhite < 75 || isWhiteBackground || isNeutralBright) {
            // High-precision anti-aliased fading
            let factor = 0.0;

            if (bestBgDist < tolerance && bestBgDist >= tolerance * 0.5) {
              // Fade smoothly between 50% and 100% of the threshold distance
              factor = Math.max(factor, (bestBgDist - tolerance * 0.5) / (tolerance * 0.5));
            }
            if (distToWhite < 75 && distToWhite >= 40) {
              factor = Math.max(factor, (distToWhite - 40) / 35);
            }
            if (isNeutralBright && luminance <= 245) {
              // Smooth gradient on off-whites/studio shadows
              factor = Math.max(factor, (luminance - 158) / (245 - 158) * 0.25);
            }

            alphaFactor = Math.min(alphaFactor, factor);
          }

          // 3. Radial Edge Vignette - Smoothly vanish any noise/shadows/edges near the circular bounds of the icon box
          const pixelIndex = i / 4;
          const px = pixelIndex % w;
          const py = Math.floor(pixelIndex / w);
          const cx = w / 2;
          const cy = h / 2;
          const dx = (px - cx) / cx;
          const dy = (py - cy) / cy;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy); // 0 at center, ~1.414 at corners

          if (distFromCenter > 0.72) {
            // Apply extremely aggressive fading for corner and edge pixels to clean up perimeter lines
            const borderFade = Math.max(0, Math.min(1, (1.02 - distFromCenter) / 0.3));
            alphaFactor *= borderFade;
          }

          data[i + 3] = Math.floor(a * alphaFactor);
        }

        // 4. Advanced High-Precision Despeckle Pass
        // Clean up remaining noise/specks (isolated islands of pixels) left over in the background.
        const tempAlpha = new Uint8Array(w * h);
        for (let idx = 0; idx < w * h; idx++) {
          tempAlpha[idx] = data[idx * 4 + 3];
        }

        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const aVal = tempAlpha[idx];
            if (aVal > 20) {
              const dx = (x - w / 2) / (w / 2);
              const dy = (y - h / 2) / (h / 2);
              const rDist = Math.sqrt(dx * dx + dy * dy);

              // Set check windows based on distance from the center
              let rRange = 2;
              let threshold = 5;

              if (rDist > 0.4) {
                rRange = 3; // 7x7 window
                threshold = 10;
              }
              if (rDist > 0.6) {
                rRange = 4; // 9x9 window
                threshold = 18;
              }

              let denseCount = 0;
              for (let dyLocal = -rRange; dyLocal <= rRange; dyLocal++) {
                const ny = y + dyLocal;
                if (ny >= 0 && ny < h) {
                  const rIndex = ny * w;
                  for (let dxLocal = -rRange; dxLocal <= rRange; dxLocal++) {
                    const nx = x + dxLocal;
                    if (nx >= 0 && nx < w) {
                      if (tempAlpha[rIndex + nx] > 20) {
                        denseCount++;
                      }
                    }
                  }
                }
              }

              if (denseCount < threshold) {
                data[idx * 4 + 3] = 0; // Completely eliminate solitary spots/dirt/background artifacts
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        processedCache.set(src, dataUrl);
        setProcessedSrc(dataUrl);
        setError(false);
      } catch (err) {
        console.error("Error processing transparent background:", err);
        setError(true);
      } finally {
        isProcessing.current = false;
      }
    };

    img.onerror = () => {
      setError(true);
      isProcessing.current = false;
    };
  }, [src]);

  if (error || !src) {
    return <div className="flex items-center justify-center">{fallbackIcon}</div>;
  }

  if (!processedSrc) {
    // Show a pulsing skeleton while processing
    return (
      <div className={`${className} bg-stone-800/50 animate-pulse rounded-full flex items-center justify-center`}>
        {fallbackIcon}
      </div>
    );
  }

  return (
    <img
      src={processedSrc}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};
