import { MeasureResult, Target } from '../types';

/**
 * Professional Tailoring Measurement Utility for Habé
 * Based on traditional African couture standards (Boubou, Kaftan, Sénateur)
 */

export interface MeasurementProfile {
  name: string;
  description: string;
  ratios: {
    poitrine: number;
    fesse: number;
    ceinture: number;
    epaule: number;
    cou: number;
    manche: number;
    tour_manche: number;
    cuisse: number;
  };
}

export const MEN_PROFILES: Record<string, MeasurementProfile> = {
  mince: {
    name: "Mince / Élancé",
    description: "Silhouette fine et longiligne.",
    ratios: {
      poitrine: 0.52,
      fesse: 0.50,
      ceinture: 0.43,
      epaule: 0.24,
      cou: 0.20,
      manche: 0.35,
      tour_manche: 0.18,
      cuisse: 0.28,
    }
  },
  athletique: {
    name: "Athlétique (V-Shape)",
    description: "Épaules larges et taille marquée.",
    ratios: {
      poitrine: 0.58,
      fesse: 0.54,
      ceinture: 0.46,
      epaule: 0.28,
      cou: 0.23,
      manche: 0.36,
      tour_manche: 0.22,
      cuisse: 0.33,
    }
  },
  classique: {
    name: "Classique / Équilibré",
    description: "Proportions standards et harmonieuses.",
    ratios: {
      poitrine: 0.55,
      fesse: 0.54,
      ceinture: 0.48,
      epaule: 0.26,
      cou: 0.22,
      manche: 0.36,
      tour_manche: 0.20,
      cuisse: 0.31,
    }
  },
  corpulent: {
    name: "Corpulent / Large",
    description: "Carrure imposante avec du volume abdominal.",
    ratios: {
      poitrine: 0.65,
      fesse: 0.68,
      ceinture: 0.62,
      epaule: 0.29,
      cou: 0.24,
      manche: 0.34,
      tour_manche: 0.23,
      cuisse: 0.40,
    }
  }
};

/**
 * Children measurements based on standardized growth charts (Interpolated)
 */
const CHILD_DATA = [
  { stature: 86, poitrine: 54, taille: 50, hanches: 56, carrure: 23.5, manche: 30 },
  { stature: 102, poitrine: 56, taille: 52, hanches: 62, carrure: 24, manche: 35 },
  { stature: 114, poitrine: 60, taille: 54, hanches: 66, carrure: 25.6, manche: 40 },
  { stature: 126, poitrine: 64, taille: 56, hanches: 70, carrure: 27.2, manche: 44 },
  { stature: 138, poitrine: 70, taille: 58, hanches: 76, carrure: 29.2, manche: 48.5 },
  { stature: 150, poitrine: 78, taille: 60, hanches: 84, carrure: 31.6, manche: 53 },
];

export function computeProfessionalMeasurements(
  gender: 'homme' | 'enfant', 
  height: number, 
  profileKey: string = 'classique'
): MeasureResult {
  const isHomme = gender === 'homme';
  const h = height || (isHomme ? 175 : 125);
  
  if (isHomme) {
    const profile = MEN_PROFILES[profileKey] || MEN_PROFILES.classique;
    const r = profile.ratios;

    const poitrine = Math.round(h * r.poitrine);
    const fesse = Math.round(h * r.fesse);
    const ceinture = Math.round(h * r.ceinture);
    const epaule = Math.round(h * r.epaule);
    const cou = Math.round(h * r.cou);
    const manche = Math.round(h * r.manche);
    const tour_manche = Math.round(h * r.tour_manche);
    const cuisse = Math.round(h * r.cuisse);

    // Boubou length depends on height (ankle length approx h * 0.8, but garment length LB is often shorter for tops)
    // LB in original code was 84-100.
    const longueur_boubou = Math.round(h * 0.52); 
    const longueur_pantalon = Math.round(h * 0.58);

    return {
      hauteur: h,
      poitrine,
      fesse,
      ceinture,
      epaule,
      cou,
      manche,
      tour_manche,
      cuisse,
      longueur_boubou,
      longueur_pantalon,
      comment: `Profil ${profile.name} détecté. ${profile.description} Vos mesures de haute-couture Habé sont calibrées pour un tombé impérial.`
    };
  } else {
    // Interpolate child data
    let lower = CHILD_DATA[0];
    let upper = CHILD_DATA[CHILD_DATA.length - 1];

    for (let i = 0; i < CHILD_DATA.length - 1; i++) {
      if (h >= CHILD_DATA[i].stature && h <= CHILD_DATA[i+1].stature) {
        lower = CHILD_DATA[i];
        upper = CHILD_DATA[i+1];
        break;
      }
    }

    const t = (h - lower.stature) / (upper.stature - lower.stature || 1);
    const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);

    const poitrine = lerp(lower.poitrine, upper.poitrine);
    const ceinture = lerp(lower.taille, upper.taille);
    const fesse = lerp(lower.hanches, upper.hanches);
    const epaule = lerp(lower.carrure, upper.carrure) + 5; // Adjustment for ease
    const manche = lerp(lower.manche, upper.manche);
    const cou = Math.round(poitrine * 0.45); // Ratio based
    const tour_manche = Math.round(poitrine * 0.35);
    const cuisse = Math.round(fesse * 0.55);
    
    const longueur_boubou = Math.round(h * 0.48);
    const longueur_pantalon = Math.round(h * 0.52);

    return {
      hauteur: h,
      poitrine,
      ceinture,
      fesse,
      epaule,
      manche,
      cou,
      tour_manche,
      cuisse,
      longueur_boubou,
      longueur_pantalon,
      comment: "Profil enfant en pleine croissance. Coupe Habé Junior avec aisance de mouvement optimale."
    };
  }
}
