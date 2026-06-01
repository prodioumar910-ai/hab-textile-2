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
}

export interface User {
  name: string;
  avatar: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'en cours' | 'livré' | 'annulé';
  total: number;
}

export interface PretProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  description: string;
}

