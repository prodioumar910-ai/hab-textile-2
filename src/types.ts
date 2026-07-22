export type Category = 'Accessoires' | 'Chaussures' | 'Ensemble Royal' | 'Tendance' | 'Classique' | 'Chapeau' | 'Parfum';
export type Target = 'Homme' | 'Enfant';
export type GarmentType = 'chemise' | 'pantalon' | 'boubou' | 'accessoire' | 'autre';
export type FabricType = 'wax' | 'bazin' | 'coton' | 'soie';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  image2?: string;
  image3?: string;
  category: Category;
  target: Target;
  garmentType: GarmentType;
  fabricType: FabricType;
  description?: string;
  isEdited?: boolean;
  colors?: string[];
}

export interface User {
  name: string;
  avatar: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

export interface Order {
  id: string;
  date: string;
  clientName: string;
  clientPhone: string;
  clientQuarter: string;
  items: OrderItem[];
  paymentMethod: string;
  deliveryMethod: string;
  total: number;
  status: 'en cours' | 'livré' | 'annulé';
}

export interface PretProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
}

export interface MeasureResult {
  hauteur?: number;
  epaule: number;
  cou: number;
  manche: number;
  tour_manche: number;
  longueur_boubou: number;
  longueur_pantalon: number;
  fesse: number;
  poitrine: number;
  cuisse: number;
  ceinture: number;
  comment: string;
  isLocal?: boolean;
}

