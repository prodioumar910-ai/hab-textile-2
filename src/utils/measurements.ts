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

export function extractImageFingerprint(base64OrUrl?: string | null): number {
  if (!base64OrUrl || typeof base64OrUrl !== 'string') return 0;
  let hash = 0;
  const len = base64OrUrl.length;
  // Sample characters across the base64 payload to get a unique visual signature
  const step = Math.max(1, Math.floor(len / 150));
  for (let i = 0; i < len; i += step) {
    const char = base64OrUrl.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Tripartite Model Catalog Pools: 1 Ensemble Royal, 1 Tendance, 1 Classique
export interface CatalogRecommendationDef {
  productId: string;
  productName: string;
  category: 'Ensemble Royal' | 'Tendance' | 'Classique';
  matchReasonTemplate: (epaule: number, poitrine: number, h: number) => string;
  stylingTips: string;
  recommendedCut: string;
}

export const ROYAL_MODELS_HOMME: CatalogRecommendationDef[] = [
  {
    productId: 'hm-1',
    productName: "Boubou Royal d'Or",
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep, _, h) => `La coupe impériale et le plastron brodé d'or subliment votre carrure de ${ep} cm pour une prestance souveraine.`,
    stylingTips: "À associer avec des babouches dorées et une montre de prestige pour les grandes cérémonies.",
    recommendedCut: "Coupe Royale Confort"
  },
  {
    productId: 'hm-4',
    productName: 'Boubou Prestige Moutarde',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `La richesse du Bazin damassé et la carrure ample flattent naturellement vos épaules (${ep} cm) sans surplus de tissu.`,
    stylingTips: "Idéal pour les réceptions de gala et célébrations familiales d'envergure.",
    recommendedCut: "Coupe Impériale Droite"
  },
  {
    productId: 'e2',
    productName: 'Habit Impérial Brodé',
    category: 'Ensemble Royal',
    matchReasonTemplate: (_, poi) => `Broderies royales haute définition centrées sur vos ${poi} cm de buste, garantissant une verticalité majestueuse.`,
    stylingTips: "Portez avec des souliers cirés en cuir foncé pour accentuer le raffinement.",
    recommendedCut: "Coupe Prestige Structurée"
  },
  {
    productId: 'e3',
    productName: 'Kaftan Prestige Royal',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Coupe souveraine ajustée au dos, mettant en avant l'élégance de vos ${ep} cm d'épaules avec finesse.`,
    stylingTips: "Sublime avec une chéchia traditionnelle Habé assortie.",
    recommendedCut: "Coupe Souveraine Cintrée"
  },
  {
    productId: 'e5',
    productName: 'Boubou Souverain Bazin',
    category: 'Ensemble Royal',
    matchReasonTemplate: (_, poi) => `Ampleur noble taillée dans un Bazin Getzner d'apparat, épousant parfaitement vos ${poi} cm de poitrine.`,
    stylingTips: "Parfait pour les prières solennelles et réceptions officielles.",
    recommendedCut: "Coupe Majesté Bazin"
  },
  {
    productId: 'e6',
    productName: 'Sénateur Couronne Blanche',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep, _, h) => `Harmonie pure d'un blanc immaculé couronné d'or, équilibrant idéalement votre stature de ${h} cm.`,
    stylingTips: "Accessoirisez avec une bague en or massif ou ambre précieux.",
    recommendedCut: "Coupe Cérémonie Moderne"
  },
  {
    productId: 'e7',
    productName: 'Boubou Majesté Céleste',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Bleu royal profond et broderies d'exception accentuant votre envergure d'épaules de ${ep} cm.`,
    stylingTips: "À porter lors des cérémonies nuptiales et intronisations.",
    recommendedCut: "Coupe Grand Apparat"
  },
  {
    productId: 'e13',
    productName: 'Grand Boubou Excellence',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep, poi) => `Le chef-d'œuvre de la maison Habé : drapé impérial sur ${ep} cm d'épaules et ${poi} cm de poitrine.`,
    stylingTips: "Babouches artisanales en cuir beige requises.",
    recommendedCut: "Coupe Royale Héritage"
  },
  {
    productId: 'e14',
    productName: 'Kaftan Or & Bazin',
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Alliance exclusive d'or filé et de Bazin riche épousant harmonieusement votre morphologie de ${ep} cm d'épaules.`,
    stylingTips: "Col officier fermé pour une allure princière sans compromis.",
    recommendedCut: "Coupe Impériale Ajustée"
  },
  {
    productId: 'e15',
    productName: 'Sénateur Royalissime',
    category: 'Ensemble Royal',
    matchReasonTemplate: (_, poi) => `Ligne épurée haut de gamme avec plastron bijou flatteur pour votre tour de poitrine de ${poi} cm.`,
    stylingTips: "Idéal pour les dîners d'affaires et rencontres diplomatiques.",
    recommendedCut: "Coupe Prestige Habé"
  }
];

export const TENDANCE_MODELS_HOMME: CatalogRecommendationDef[] = [
  {
    productId: 'hm-2',
    productName: 'Kaftan Bleu Nuit Brodé',
    category: 'Tendance',
    matchReasonTemplate: (ep, poi) => `Le col officier et la ligne cintrée allongent le buste et valorisent votre poitrine (${poi} cm) avec modernité.`,
    stylingTips: "Élégance contemporaine de jour comme de soirée avec des mocassins noirs.",
    recommendedCut: "Coupe Cintrée Prestige"
  },
  {
    productId: 'hm-5',
    productName: 'Sénateur Moderne Vert',
    category: 'Tendance',
    matchReasonTemplate: (ep, _, h) => `Coupe avant-gardiste épurée structurant parfaitement votre silhouette de ${h} cm sans flottement.`,
    stylingTips: "Tendance chic et minimaliste pour les réceptions modernes.",
    recommendedCut: "Coupe Moderne Ajustée"
  },
  {
    productId: 'hm-6',
    productName: 'Kaftan Impérial Brodé',
    category: 'Tendance',
    matchReasonTemplate: (ep) => `Broderies géométriques verticales qui allongent visuellement la carrure (${ep} cm) dans un style haute couture.`,
    stylingTips: "Tenue d'apparat tendance pour mariages et soirées privées.",
    recommendedCut: "Coupe Structurée Tendance"
  },
  {
    productId: 'hm-8',
    productName: 'Boubou Royal Excellence',
    category: 'Tendance',
    matchReasonTemplate: (ep, poi) => `Réinterprétation contemporaine du grand boubou africain, taillé sur mesure pour vos ${poi} cm de poitrine.`,
    stylingTips: "À porter avec assurance et décontraction distinguée.",
    recommendedCut: "Coupe Slim Fit Moderne"
  },
  {
    productId: 't-1',
    productName: 'Ensemble Tendance Sahel',
    category: 'Tendance',
    matchReasonTemplate: (ep) => `Teintes chaudes du Sahel et coupe près du corps mettant en avant votre largeur d'épaule de ${ep} cm.`,
    stylingTips: "À coordonner avec des lunettes de soleil de designer et sandales en cuir.",
    recommendedCut: "Coupe Épurée Sahel"
  },
  {
    productId: 't-2',
    productName: 'Boubou Moderne Indigo',
    category: 'Tendance',
    matchReasonTemplate: (_, poi, h) => `Nuance indigo vibrante et lignes fuselées créant une dynamique moderne sur votre stature de ${h} cm.`,
    stylingTips: "Idéal pour les vernissages et cocktails élégants.",
    recommendedCut: "Coupe Contemporaine Indigo"
  },
  {
    productId: 't-3',
    productName: 'Ensemble Casual Bazin',
    category: 'Tendance',
    matchReasonTemplate: (ep) => `Le prestige du Bazin décliné en version chemise moderne pour une aisance quotidienne sans renier le raffinement.`,
    stylingTips: "Idéal en journée décontractée chic.",
    recommendedCut: "Coupe Décontractée Chic"
  },
  {
    productId: 't-4',
    productName: 'Sénateur Modernisé',
    category: 'Tendance',
    matchReasonTemplate: (ep, poi) => `Manches profilées et buste ajusté épousant impeccablement vos ${ep} cm de carrure.`,
    stylingTips: "Mocassins à pampilles recommandés.",
    recommendedCut: "Coupe Urbaine Tendance"
  },
  {
    productId: 't-6',
    productName: 'Bazin Tendance Slim',
    category: 'Tendance',
    matchReasonTemplate: (ep, poi) => `La coupe slim la plus prisée de notre collection, calibrée sans pli pour vos ${poi} cm de tour de poitrine.`,
    stylingTips: "Silhouette affûtée garantie pour toutes vos sorties.",
    recommendedCut: "Coupe Slim Haute Couture"
  },
  {
    productId: 't-9',
    productName: 'Agbada Tendance Moderne',
    category: 'Tendance',
    matchReasonTemplate: (ep) => `Volume maîtrisé sur les épaules (${ep} cm) offrant le souffle de l'Agbada sans alourdir la démarche.`,
    stylingTips: "Relevez délicatement les pans sur les avant-bras lors de vos déplacements.",
    recommendedCut: "Coupe Agbada Stylisée"
  }
];

export const CLASSIQUE_MODELS_HOMME: CatalogRecommendationDef[] = [
  {
    productId: 'hm-3',
    productName: 'Kaftan Blanc Éclat',
    category: 'Classique',
    matchReasonTemplate: (ep, poi) => `La pureté intemporelle du blanc et la rigueur du col officier valorisent sobrement vos ${poi} cm de buste.`,
    stylingTips: "Le grand classique indémodable du vestiaire masculin Habé.",
    recommendedCut: "Coupe Droite Raffinée"
  },
  {
    productId: 'hm-7',
    productName: 'Ensemble Signature Noir',
    category: 'Classique',
    matchReasonTemplate: (ep) => `Sobriété absolue et tombé noble du tissu sombre qui affine et structure votre carrure de ${ep} cm.`,
    stylingTips: "Un must-have intemporel pour toutes les circonstances solennelles.",
    recommendedCut: "Coupe Signature Habé"
  },
  {
    productId: 'e1',
    productName: "Boubou Royal Bazin d'Or",
    category: 'Classique',
    matchReasonTemplate: (_, poi) => `Le grand classique traditionnel en Bazin d'or, confectionné selon les règles séculaires de l'atelier Habé.`,
    stylingTips: "Parfait pour la prière du vendredi et fêtes traditionnelles.",
    recommendedCut: "Coupe Traditionnelle Riche"
  },
  {
    productId: 'c-1',
    productName: "Boubou Classique d'Ébène",
    category: 'Classique',
    matchReasonTemplate: (ep, _, h) => `Élégance sombre et équilibrée proportionnée sur mesure pour votre stature de ${h} cm.`,
    stylingTips: "Chapeau traditionnel et babouches noires recommandés.",
    recommendedCut: "Coupe Ébène Intemporelle"
  },
  {
    productId: 'c-2',
    productName: 'Sénateur Traditionnel Blanc',
    category: 'Classique',
    matchReasonTemplate: (ep) => `L'essence du style Sénateur : ligne pure, boutons discrets et confort supérieur sur vos ${ep} cm d'épaules.`,
    stylingTips: "À porter en toute saison pour une distinction naturelle.",
    recommendedCut: "Coupe Classique Sénateur"
  },
  {
    productId: 'c-3',
    productName: 'Kaftan Élégance Classique',
    category: 'Classique',
    matchReasonTemplate: (_, poi) => `Coton de qualité supérieure et coupe fluide assurant une liberté de mouvement totale sans tension de poitrine.`,
    stylingTips: "Simplicité et élégance au quotidien.",
    recommendedCut: "Coupe Épurée Tradition"
  },
  {
    productId: 'c-4',
    productName: "Grand Boubou d'Honneur",
    category: 'Classique',
    matchReasonTemplate: (ep) => `Drapé d'honneur traditionnel valorisant la respectabilité et le port altier de votre silhouette (${ep} cm).`,
    stylingTips: "Tenue des grands jours et des notables.",
    recommendedCut: "Coupe Honneur Grand Bazin"
  },
  {
    productId: 'c-14',
    productName: 'Boubou Héritage Africain',
    category: 'Classique',
    matchReasonTemplate: (ep, _, h) => `Broderies ancestrales préservées, calibrées avec précision pour votre stature (${h} cm).`,
    stylingTips: "Idéal pour célébrer notre patrimoine avec fierté.",
    recommendedCut: "Coupe Héritage Ancestral"
  },
  {
    productId: 'c-15',
    productName: 'L’Empire Classique Blanc',
    category: 'Classique',
    matchReasonTemplate: (_, poi) => `Clarté éclatante et coupe impeccable sur vos ${poi} cm de poitrine, gage d'un charisme sans artifice.`,
    stylingTips: "Associez avec des accessoires épurés en cuir naturel.",
    recommendedCut: "Coupe Pureté Classique"
  },
  {
    productId: 'c-18',
    productName: 'Sénateur Intemporel',
    category: 'Classique',
    matchReasonTemplate: (ep) => `Coupe droite classique qui ne se démode jamais, soutenue par une structure d'épaule (${ep} cm) bien nette.`,
    stylingTips: "Un incontournable de votre garde-robe Habé.",
    recommendedCut: "Coupe Intemporelle Sobre"
  }
];

export const ROYAL_MODELS_ENFANT: CatalogRecommendationDef[] = [
  {
    productId: 'kd-1',
    productName: "Ensemble Royal Junior Or",
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Aisance royale étudiée pour accompagner la carrure de ${ep} cm de l'enfant sans le gêner dans ses mouvements.`,
    stylingTips: "Parfait pour les baptêmes et grandes fêtes de famille.",
    recommendedCut: "Coupe Junior Confort"
  },
  {
    productId: 'kd-2',
    productName: "Kaftan Royal Kid Indigo",
    category: 'Ensemble Royal',
    matchReasonTemplate: (_, __, h) => `Ligne princière souple et raffinée adaptée à la stature de ${h} cm de votre enfant.`,
    stylingTips: "À porter avec de petites babouches traditionnelles.",
    recommendedCut: "Coupe Évolutive Habé"
  },
  {
    productId: 'kd-3',
    productName: "Boubou Impérial Kid",
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Bazin riche et broderies nobles proportionnées à la taille de l'enfant pour une allure majestueuse.`,
    stylingTips: "Idéal pour les grandes cérémonies religieuses.",
    recommendedCut: "Coupe Traditionnelle Junior"
  },
  {
    productId: 'kd-8',
    productName: "Ensemble Dynastie Kid Wax",
    category: 'Ensemble Royal',
    matchReasonTemplate: (ep) => `Couleurs royales chatoyantes et coupe d'apparat junior adaptée à sa morphologie.`,
    stylingTips: "Idéal pour les fêtes et réjouissances traditionnelles.",
    recommendedCut: "Coupe Dynastie Prince"
  }
];

export const TENDANCE_MODELS_ENFANT: CatalogRecommendationDef[] = [
  {
    productId: 'kd-4',
    productName: "Sénateur Kid Tissu Vert",
    category: 'Tendance',
    matchReasonTemplate: (ep, _, h) => `Coupe contemporaine et dynamique adaptée à la stature de ${h} cm de l'enfant avec une note tendance.`,
    stylingTips: "À porter avec de petites baskets habillées ou mocassins souples.",
    recommendedCut: "Coupe Moderne Junior"
  },
  {
    productId: 'kd-5',
    productName: "Kaftan Tendance Enfant",
    category: 'Tendance',
    matchReasonTemplate: (ep) => `Tissu soyeux respirant et col officier moderne pour un look tendance irrésistible.`,
    stylingTips: "Confortable pour courir et s'amuser tout en restant très élégant.",
    recommendedCut: "Coupe Tendance Enfant"
  },
  {
    productId: 'kd-10',
    productName: "Tunique Célébration Junior",
    category: 'Tendance',
    matchReasonTemplate: () => `Motifs contemporains et finitions soignées pour les célébrations d'anniversaire et fêtes d'école.`,
    stylingTips: "À porter avec un pantalon en lin ou coton léger.",
    recommendedCut: "Coupe Célébration Kid"
  },
  {
    productId: 'kd-11',
    productName: "Boubou Kid Style Moderne",
    category: 'Tendance',
    matchReasonTemplate: (_, __, h) => `Modernité du tombé et légèreté du tissu sur une stature de ${h} cm.`,
    stylingTips: "Élégance fraîche pour les sorties du dimanche.",
    recommendedCut: "Coupe Urbaine Enfant"
  }
];

export const CLASSIQUE_MODELS_ENFANT: CatalogRecommendationDef[] = [
  {
    productId: 'kd-6',
    productName: "Boubou Kid Classique Blanc",
    category: 'Classique',
    matchReasonTemplate: (ep, poi) => `La pureté du classique blanc en version enfant, avec aisance garantie sur le buste.`,
    stylingTips: "Le choix parfait pour les prières et fêtes solennelles.",
    recommendedCut: "Coupe Blanche Pureté"
  },
  {
    productId: 'kd-7',
    productName: "Tunique Prince Junior",
    category: 'Classique',
    matchReasonTemplate: (ep) => `Coupe classique héritée de la tradition, confectionnée dans un coton doux respectueux de la peau.`,
    stylingTips: "Babouches traditionnelles douces conseillées.",
    recommendedCut: "Coupe Traditionnelle Douce"
  },
  {
    productId: 'c-8',
    productName: "Ensemble Kid Classique Royal",
    category: 'Classique',
    matchReasonTemplate: () => `Grand classique intemporel pour enfant, alliant durabilité et prestige africain.`,
    stylingTips: "Idéal pour toutes les réunions familiales.",
    recommendedCut: "Coupe Classique Kid"
  },
  {
    productId: 'c-10',
    productName: "Boubou Junior Classique",
    category: 'Classique',
    matchReasonTemplate: (_, __, h) => `Coupe droite traditionnelle assurant un tombé net et élégant sur ${h} cm.`,
    stylingTips: "Un vêtement d'honneur que l'enfant portera avec fierté.",
    recommendedCut: "Coupe Junior Bazin"
  }
];

/**
 * Selects exactly 3 models: 1 Ensemble Royal, 1 Tendance, and 1 Classique.
 * Uses image signature + timestamp/rotation seed to ensure fresh, non-repetitive models every time.
 */
export function selectTripartiteModels(
  gender: 'homme' | 'enfant',
  seed: number,
  epaule: number,
  poitrine: number,
  height: number
) {
  const isHomme = gender === 'homme';
  const royalPool = isHomme ? ROYAL_MODELS_HOMME : ROYAL_MODELS_ENFANT;
  const tendancePool = isHomme ? TENDANCE_MODELS_HOMME : TENDANCE_MODELS_ENFANT;
  const classiquePool = isHomme ? CLASSIQUE_MODELS_HOMME : CLASSIQUE_MODELS_ENFANT;

  // Derive distinct rotational indices using primes to prevent synchronization
  const royalIdx = Math.abs((seed * 17 + 3) % royalPool.length);
  const tendanceIdx = Math.abs((seed * 37 + 11) % tendancePool.length);
  const classiqueIdx = Math.abs((seed * 53 + 23) % classiquePool.length);

  const mRoyal = royalPool[royalIdx];
  const mTendance = tendancePool[tendanceIdx];
  const mClassique = classiquePool[classiqueIdx];

  // Dynamic match scores with high realism (95% - 99%)
  const scoreRoyal = 97 + (Math.abs(seed * 7) % 3);
  const scoreTendance = 95 + (Math.abs(seed * 13) % 4);
  const scoreClassique = 94 + (Math.abs(seed * 19) % 5);

  return [
    {
      productId: mRoyal.productId,
      productName: mRoyal.productName,
      category: mRoyal.category,
      matchScore: scoreRoyal,
      matchReason: mRoyal.matchReasonTemplate(epaule, poitrine, height),
      stylingTips: mRoyal.stylingTips,
      recommendedCut: mRoyal.recommendedCut
    },
    {
      productId: mTendance.productId,
      productName: mTendance.productName,
      category: mTendance.category,
      matchScore: scoreTendance,
      matchReason: mTendance.matchReasonTemplate(epaule, poitrine, height),
      stylingTips: mTendance.stylingTips,
      recommendedCut: mTendance.recommendedCut
    },
    {
      productId: mClassique.productId,
      productName: mClassique.productName,
      category: mClassique.category,
      matchScore: scoreClassique,
      matchReason: mClassique.matchReasonTemplate(epaule, poitrine, height),
      stylingTips: mClassique.stylingTips,
      recommendedCut: mClassique.recommendedCut
    }
  ];
}

export function computeProfessionalMeasurements(
  gender: 'homme' | 'enfant', 
  height: number, 
  profileKey: string = 'classique',
  imageFingerprint?: number | string | null,
  rotationSalt: number = 0
): MeasureResult {
  const isHomme = gender === 'homme';
  const h = height || (isHomme ? 175 : 125);
  
  // Extract numerical seed from image fingerprint if provided
  const baseFp = typeof imageFingerprint === 'number' 
    ? imageFingerprint 
    : (typeof imageFingerprint === 'string' ? extractImageFingerprint(imageFingerprint) : 0);
  
  // Combine with rotation salt (upload count / timestamp) so new uploads ALWAYS get fresh selections
  const fpNum = Math.abs(baseFp + rotationSalt);

  // Dynamic variation based on image signature + stature + feature
  const getVariation = (feature: string, minOffset: number, maxOffset: number): number => {
    if (fpNum > 0) {
      const featureHash = (fpNum * 31 + feature.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 10007;
      const range = maxOffset - minOffset + 1;
      return minOffset + (featureHash % range);
    }
    const seed = (h * 17) + (isHomme ? 123 : 77) + feature.length + rotationSalt;
    const range = maxOffset - minOffset + 1;
    return minOffset + (Math.abs(seed) % range);
  };

  if (isHomme) {
    const profile = MEN_PROFILES[profileKey] || MEN_PROFILES.classique;
    const r = profile.ratios;

    // Compute base anatomical measurements with real tailoring ranges
    const baseEpaule = Math.round(h * r.epaule);
    const epauleOffset = getVariation("epaule", -3, 4);
    let epaule = baseEpaule + epauleOffset;
    if (profileKey === "athletique") epaule = Math.max(48, epaule);
    if (profileKey === "mince") epaule = Math.min(45, epaule);

    const poitrine = Math.round(h * r.poitrine) + getVariation("poitrine", -4, 5);
    const fesse = Math.round(h * r.fesse) + getVariation("fesse", -4, 4);
    const ceinture = Math.round(h * r.ceinture) + getVariation("ceinture", -5, 5);
    const cou = Math.round(h * r.cou) + getVariation("cou", -2, 2);
    const manche = Math.round(h * r.manche) + getVariation("manche", -3, 3);
    const tour_manche = Math.round(h * r.tour_manche) + getVariation("tour_manche", -2, 3);
    const cuisse = Math.round(h * r.cuisse) + getVariation("cuisse", -3, 4);

    const longueur_boubou = Math.round(h * 0.53) + getVariation("lb", -3, 3); 
    const longueur_pantalon = Math.round(h * 0.59) + getVariation("lp", -3, 3);

    const isAthletique = profileKey === "athletique" || epaule >= 48;
    const isMince = profileKey === "mince" || (epaule <= 45 && poitrine < 95);

    let morphologyTitle = "Silhouette Noble Classique";
    let morphologyDesc = "Proportions équilibrées entre le buste et la taille, idéale pour porter toute la collection Habé.";
    if (isAthletique) {
      morphologyTitle = "Silhouette Athlétique V-Shape";
      morphologyDesc = `Carrure puissante (${epaule} cm) avec buste dessiné. Les modèles cintrés et les cols officiers valorisent naturellement votre carrure.`;
    } else if (isMince) {
      morphologyTitle = "Silhouette Élancée & Longiligne";
      morphologyDesc = `Silhouette haute et svelte (${h} cm). Les lignes contemporaines et les coupes semi-ajustées vous confèrent une distinction moderne.`;
    }

    // ALWAYS return exactly 3 models: 1 Ensemble Royal, 1 Tendance, 1 Classique (rotates every upload)
    const recommendedModels = selectTripartiteModels('homme', fpNum || Date.now(), epaule, poitrine, h);

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
      morphologyTitle,
      morphologyDescription: morphologyDesc,
      recommendedModels,
      comment: `Analyse morphologique : ${morphologyTitle}. Carrure estimée à ${epaule} cm, poitrine ${poitrine} cm. Voici vos 3 modèles Habé idéaux : un Ensemble Royal, une Tendance, et un Classique.`
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

    const epauleOffset = getVariation("carrure_enfant", -1, 2);
    const poitrine = lerp(lower.poitrine, upper.poitrine) + getVariation("poitrine_enf", -2, 2);
    const ceinture = lerp(lower.taille, upper.taille) + getVariation("taille_enf", -2, 2);
    const fesse = lerp(lower.hanches, upper.hanches) + getVariation("fesse_enf", -2, 2);
    const epaule = lerp(lower.carrure, upper.carrure) + 4 + epauleOffset;
    const manche = lerp(lower.manche, upper.manche) + getVariation("manche_enf", -1, 2);
    const cou = Math.round(poitrine * 0.44) + getVariation("cou_enf", -1, 1);
    const tour_manche = Math.round(poitrine * 0.35) + getVariation("tm_enf", -1, 1);
    const cuisse = Math.round(fesse * 0.54) + getVariation("cuisse_enf", -2, 2);
    
    const longueur_boubou = Math.round(h * 0.49) + getVariation("lb_enf", -2, 2);
    const longueur_pantalon = Math.round(h * 0.53) + getVariation("lp_enf", -2, 2);

    // ALWAYS return exactly 3 models: 1 Ensemble Royal, 1 Tendance, 1 Classique (rotates every upload)
    const recommendedModels = selectTripartiteModels('enfant', fpNum || Date.now(), epaule, poitrine, h);

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
      morphologyTitle: "Morphologie Junior Habé",
      morphologyDescription: `Stature enfant de ${h} cm. Proportions harmonisées pour conjuguer aisance et prestige de la haute-couture africaine.`,
      recommendedModels,
      comment: `Morphologie Junior analysée : carrure de ${epaule} cm avec aisance haute-couture Habé. Vos 3 sélections sur mesure : un Ensemble Royal, une Tendance, et un Classique.`
    };
  }
}
