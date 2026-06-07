import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Target, Category, GarmentType, FabricType, PretProduct } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface StoreContextType {
  cart: Product[];
  favorites: string[];
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (product: Product) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  activeTarget: Target;
  setActiveTarget: (target: Target) => void;
  activeCategory: Category | null;
  setActiveCategory: (category: Category | null) => void;
  filters: {
    garmentType: GarmentType | null;
    fabricType: FabricType | null;
  };
  setFilters: (filters: { garmentType: GarmentType | null, fabricType: FabricType | null }) => void;
  user: User | null;
  signOut: () => Promise<void>;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedPretProduct: PretProduct | null;
  setSelectedPretProduct: (product: PretProduct | null) => void;
  isTrendingOpen: boolean;
  setIsTrendingOpen: (open: boolean) => void;
  isPretAPorterOpen: boolean;
  setIsPretAPorterOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial data
const INITIAL_PRODUCTS: Product[] = [
  // Nouvelles Images Homme Habé (target 'Homme')
  {
    id: 'hm-1',
    name: "Boubou Royal d'Or",
    price: 185000,
    image: 'https://lh3.googleusercontent.com/d/18HxJiKqb9dRx5J_9OHyLwQwbwViDnmws',
    category: 'Ensemble Royal',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'bazin'
  },
  {
    id: 'hm-2',
    name: 'Kaftan Bleu Nuit Brodé',
    price: 165000,
    image: 'https://lh3.googleusercontent.com/d/1G3sC5y1cwyJd3Ml2pX7yXS0NbH_pVtoY',
    category: 'Ensemble Royal',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'coton'
  },
  {
    id: 'hm-3',
    name: 'Kaftan Blanc Éclat',
    price: 155000,
    image: 'https://lh3.googleusercontent.com/d/1UcSo_tVI3CrUuH9LBrL4eQpIA1i-uY3k',
    category: 'Classique',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'coton'
  },
  {
    id: 'hm-4',
    name: 'Boubou Prestige Moutarde',
    price: 175000,
    image: 'https://lh3.googleusercontent.com/d/1w9n95-LCG8z6oSKgrY4pz78VlSMJ7gR2',
    category: 'Tendance',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'bazin'
  },
  {
    id: 'hm-5',
    name: 'Sénateur Moderne Vert',
    price: 135000,
    image: 'https://lh3.googleusercontent.com/d/1q5B8bLIKQaFVvKVnxmuSEz6MTn0M7NCm',
    category: 'Tendance',
    target: 'Homme',
    garmentType: 'chemise',
    fabricType: 'coton'
  },
  {
    id: 'hm-6',
    name: 'Kaftan Impérial Brodé',
    price: 195000,
    image: 'https://lh3.googleusercontent.com/d/1eZ48hX3O_tlrBe1iDSTCIBlmlBsjX6Ma',
    category: 'Ensemble Royal',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'bazin'
  },
  {
    id: 'hm-7',
    name: 'Ensemble Signature Noir',
    price: 145000,
    image: 'https://lh3.googleusercontent.com/d/1iB0le1uZbHdah4xrz6PvAyb8-D1LYfiS',
    category: 'Classique',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'coton'
  },
  {
    id: 'hm-8',
    name: 'Boubou Royal Excellence',
    price: 220000,
    image: 'https://lh3.googleusercontent.com/d/1CSU6vDruqukQpvS5FV8_pWFIZdITPRZj',
    category: 'Ensemble Royal',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'bazin'
  },

  // Boutique Collection: Ensemble Royal
  { id: 'e1', name: "Boubou Royal Bazin d'Or", price: 185000, image: 'https://lh3.googleusercontent.com/d/19EDo6smyP73MPiQhqt9eyqUGgAN5Igic', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e2', name: 'Habit Impérial Brodé', price: 195000, image: 'https://lh3.googleusercontent.com/d/15tR0qCfDHh5TikDGFfXT-V4whDvtL7lp', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'e3', name: 'Kaftan Prestige Royal', price: 160000, image: 'https://lh3.googleusercontent.com/d/1XXH7d1Wu9QSnMZHu4lKpGgDY9DVm8kt8', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'soie' },
  { id: 'e4', name: 'Ensemble Dynastie Wax', price: 155000, image: 'https://lh3.googleusercontent.com/d/1eYC25DoyZgd-gX29cZmRbBa0W0go8JKP', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: 'e5', name: 'Boubou Souverain Bazin', price: 175000, image: 'https://lh3.googleusercontent.com/d/1F6DeuYDLtrVs7R5rV-RYA8GBUAmT0PEc', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e6', name: 'Sénateur Couronne Blanche', price: 165000, image: 'https://lh3.googleusercontent.com/d/1GafK8RmJWGRWIIXQrYbqXU34r84g9tTa', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'e7', name: 'Boubou Majesté Céleste', price: 210000, image: 'https://lh3.googleusercontent.com/d/1V5aCeWTy_BP8rozBXJklIcHI0NcBS7Re', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e8', name: 'Ensemble Prince Héritier', price: 130000, image: 'https://lh3.googleusercontent.com/d/1YFwogT5ogm4gNM-sO9aCLtZ1SiKBQT8E', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: 'e10', name: 'Boubou Petit Sultan', price: 125000, image: 'https://lh3.googleusercontent.com/d/1a5vv9YcCtqrQLhR9POIXHHtCIM0Or0VS', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e11', name: 'Kaftan Monarque pour Enfant', price: 115000, image: 'https://lh3.googleusercontent.com/d/1TnPNKlzumvTONcm2gFJukEQtM9gnhb-1', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'soie' },
  { id: 'e12', name: 'Ensemble Impérial Junior', price: 140000, image: 'https://lh3.googleusercontent.com/d/1DijS_nDBx67QPiDMwmzLgDyhVkU72TzU', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'e13', name: 'Grand Boubou Excellence', price: 220000, image: 'https://lh3.googleusercontent.com/d/1z7_pCMD63nVsmdPY81SFz9AuPG0hVlEz', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e14', name: 'Kaftan Or & Bazin', price: 180000, image: 'https://lh3.googleusercontent.com/d/16aSXB6lVcu_xSyEExgFLMsP55iGJxrie', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'e15', name: 'Sénateur Royalissime', price: 170000, image: 'https://lh3.googleusercontent.com/d/1p48ntEj30xSO2hTDlRbTHdubzjDtqLhw', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'e16', name: 'Ensemble Noblesse Africaine', price: 190000, image: 'https://lh3.googleusercontent.com/d/1O2w0q-l-duwHBaW31JF0Tzq_gN4NB6Op', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'soie' },
  { id: 'e17', name: 'Boubou Prestige de Dynastie', price: 200000, image: 'https://lh3.googleusercontent.com/d/1MAl-Puj6xz5EdwCAIGUXWV5ZebiV3Y7y', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },

  // Boutique Collection: Tendance
  { id: 't-1', name: 'Ensemble Tendance Sahel', price: 125000, image: 'https://lh3.googleusercontent.com/d/1_NzbrKI2c3AwwKp5Ziu-Ebl6fLX-Cmtw', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 't-2', name: 'Boubou Moderne Indigo', price: 145000, image: 'https://lh3.googleusercontent.com/d/1I9bwGoj463BaAAli3ZkbP-U-iiIy-78M', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 't-3', name: 'Ensemble Casual Bazin', price: 95000, image: 'https://lh3.googleusercontent.com/d/1qorqgwu9SChXC_l-jnf9fIzBGLqadHhR', category: 'Tendance', target: 'Homme', garmentType: 'chemise', fabricType: 'bazin' },
  { id: 't-4', name: 'Sénateur Modernisé', price: 110000, image: 'https://lh3.googleusercontent.com/d/1alPYHOG3soIuTPkhMAP9tt_ZQc49_Fcb', category: 'Tendance', target: 'Homme', garmentType: 'chemise', fabricType: 'coton' },
  { id: 't-5', name: 'Boubou Style Urbain', price: 125000, image: 'https://lh3.googleusercontent.com/d/1Fg2-OuOcUgEsHNFItu4UygNxyqtVELPp', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'soie' },
  { id: 't-6', name: 'Bazin Tendance Slim', price: 135000, image: 'https://lh3.googleusercontent.com/d/12p6jfGUD1IrStIlxCa8IYa-kiaFbQ4qS', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 't-7', name: 'Tunique Kid Tendance', price: 55000, image: 'https://lh3.googleusercontent.com/d/11cauj6NsmWbJ60gp6QIuut4tNZHPsjP1', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 't-8', name: 'Ensemble Prince Tendance', price: 65000, image: 'https://lh3.googleusercontent.com/d/12U5IEO15L7JC_viODrKXvsHjB8l-w6OY', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: 't-9', name: 'Agbada Tendance Moderne', price: 165000, image: 'https://lh3.googleusercontent.com/d/10kb70-WencerYbRhmP1cwYA9Lwi4hSuK', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 't-10', name: 'Kaftan Tendance Elite', price: 120000, image: 'https://lh3.googleusercontent.com/d/1zNe6PiCw53GskYu_c6ra6GuWc5pqOEjh', category: 'Tendance', target: 'Homme', garmentType: 'boubou', fabricType: 'soie' },

  // Boutique Collection: Classique
  { id: 'c-1', name: "Boubou Classique d'Ébène", price: 110000, image: 'https://lh3.googleusercontent.com/d/1XNu7SYAfT_zA6yF8-w7fmMEQqA3Htkdl', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-2', name: 'Sénateur Traditionnel Blanc', price: 95000, image: 'https://lh3.googleusercontent.com/d/1gtmksbtCYRCRuzmL71FC9FDKj1dM7PhA', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-3', name: 'Kaftan Élégance Classique', price: 105000, image: 'https://lh3.googleusercontent.com/d/1vkGVgeZ5p7NOXoEhJCse83Gf4YI7FHKS', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-4', name: "Grand Boubou d'Honneur", price: 150000, image: 'https://lh3.googleusercontent.com/d/1WkOYRFvjToTnfn-sCeGl5P9vWJbXLGOo', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-5', name: 'Ensemble Sénateur Prestige', price: 120000, image: 'https://lh3.googleusercontent.com/d/1JJ_7G8cRF2y6ZFDiFvpcveICjYbqeC7C', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-6', name: 'Tunique Classique Pur Bazin', price: 115000, image: 'https://lh3.googleusercontent.com/d/1MOiftFw7j0QRDFLtBUjC7kVaedoN7KEg', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-7', name: 'Boubou Majestueux Coton', price: 110000, image: 'https://lh3.googleusercontent.com/d/1JY1Bt0JzjFvocsMa5cUmpY6hWKWcx1IC', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-8', name: 'Ensemble Kid Classique Royal', price: 75000, image: 'https://lh3.googleusercontent.com/d/1KbvpAvJGYxZBu7B6UTbPVmFsV5lemfRx', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: 'c-9', name: 'Kaftan Enfant Noblesse', price: 65000, image: 'https://lh3.googleusercontent.com/d/1o2QNlClXnoBhT3TUkxQRZtnHQxTi5vz_', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-10', name: 'Boubou Junior Classique', price: 70000, image: 'https://lh3.googleusercontent.com/d/19FkhG3a2qz72lT6QacOEE8vIoKXakRBq', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-11', name: 'Sénateur Junior Coton', price: 60000, image: 'https://lh3.googleusercontent.com/d/1M1BsSv2xDhH-QcODY-LzXBIFI6hn2BcX', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-12', name: 'Ensemble Petit Monarque', price: 80000, image: 'https://lh3.googleusercontent.com/d/11FRlwS_oGSfr8tJRRXAdHnCw-nnrpmG8', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-13', name: 'Chemise Classique Bazin', price: 95000, image: 'https://lh3.googleusercontent.com/d/1CtMl5s-QXzUqND1XTWKZiJScCfoQAr7Z', category: 'Classique', target: 'Homme', garmentType: 'chemise', fabricType: 'bazin' },
  { id: 'c-14', name: 'Boubou Héritage Africain', price: 125000, image: 'https://lh3.googleusercontent.com/d/1GDd2MtovpplpKg7LHRTe9BGQTPxRi0hm', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-15', name: 'L’Empire Classique Blanc', price: 140000, image: 'https://lh3.googleusercontent.com/d/1UCopTDI98XjfiohzyJ_LoCaXnhaYDM5F', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-16', name: 'Kaftan Signature Habé', price: 110000, image: 'https://lh3.googleusercontent.com/d/10mrEDC76-nuFPjBNOXVpgsCXBhhluGpR', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-17', name: 'Boubou Cérémonie Classique', price: 135000, image: 'https://lh3.googleusercontent.com/d/1dXRjpvMr912fE3TXWHxW84PHfDEwyaK9', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-18', name: 'Sénateur Intemporel', price: 100000, image: 'https://lh3.googleusercontent.com/d/1vqlNGnCH9ujgv6OPlt7NTsA6r6EMYRsN', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-19', name: 'Boubou Tradition Orné', price: 120000, image: 'https://lh3.googleusercontent.com/d/1bjqSn7jvZmZfYyDDsRsoOujxfMBzrPQI', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'c-20', name: 'Kaftan Sagesse Classique', price: 115000, image: 'https://lh3.googleusercontent.com/d/1VGCuvp449LC1lE9lJ8oqQu0JGm2UqDWz', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'c-21', name: 'Ensemble Authentique Bazin', price: 130000, image: 'https://lh3.googleusercontent.com/d/1dNev1tJUmOzrKa9rOrBlfGu39YaLlzLy', category: 'Classique', target: 'Homme', garmentType: 'boubou', fabricType: 'bazin' },

  // Nouvelles Images pour Enfants du Google Drive
  { id: 'kd-1', name: "Ensemble Royal Junior Or", price: 125000, image: 'https://lh3.googleusercontent.com/d/1WhYofpnj4MpoDAIY2wvWX-qYwfl9Nqve', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'kd-2', name: "Kaftan Royal Kid Indigo", price: 115000, image: 'https://lh3.googleusercontent.com/d/13urnzRLr1NkJfn8Q4Y5vO3GAieBEAxrY', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'kd-3', name: "Boubou Impérial Kid", price: 135000, image: 'https://lh3.googleusercontent.com/d/1T0OQcSvsgR6GbMuR128mIjIr46scc5Px', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'kd-4', name: "Sénateur Kid Tissu Vert", price: 85000, image: 'https://lh3.googleusercontent.com/d/1Zkg3F_-ua_y6YEFtMu2TZEji1kSWjsT-', category: 'Tendance', target: 'Enfant', garmentType: 'chemise', fabricType: 'coton' },
  { id: 'kd-5', name: "Kaftan Tendance Enfant", price: 95000, image: 'https://lh3.googleusercontent.com/d/1jr5_YsrKKIpeI2gWwaqiE0vWpBLR1Id6', category: 'Tendance', target: 'Enfant', garmentType: 'boubou', fabricType: 'soie' },
  { id: 'kd-6', name: "Boubou Kid Classique Blanc", price: 105000, image: 'https://lh3.googleusercontent.com/d/1IF-BiRIF_HHwqWIH9umqoHrA9nF4N16A', category: 'Classique', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'kd-7', name: "Tunique Prince Junior", price: 110000, image: 'https://lh3.googleusercontent.com/d/1pGFOVA28xr-Z1M8yiaWsqDEnjn8SEM2B', category: 'Classique', target: 'Enfant', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'kd-8', name: "Ensemble Dynastie Kid Wax", price: 125000, image: 'https://lh3.googleusercontent.com/d/1MgkG5BWdubX74GSs1QSOihYxPNOI4HLL', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'wax' },
  { id: 'kd-9', name: "Boubou d'Or Enfant", price: 140000, image: 'https://lh3.googleusercontent.com/d/11H8t34yu0Xe4lQUgEkTWHk8BWP3UdKmX', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: 'kd-10', name: "Tunique Célébration Junior", price: 85000, image: 'https://lh3.googleusercontent.com/d/1Ncw0Uj5NgciVeWhftZatsKIURJYrHaAG', category: 'Tendance', target: 'Enfant', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'kd-11', name: "Boubou Kid Style Moderne", price: 95000, image: 'https://lh3.googleusercontent.com/d/1qF_4ZnrtzPQoAtmlubpDhej8Nt8YA3w8', category: 'Tendance', target: 'Enfant', garmentType: 'boubou', fabricType: 'soie' },
  { id: 'kd-12', name: "Sénateur Junior Coton Blanc", price: 75000, image: 'https://lh3.googleusercontent.com/d/1EZUWME88o6eMKY2vMjBnhzkJkHVwzuFb', category: 'Classique', target: 'Enfant', garmentType: 'chemise', fabricType: 'coton' },
  { id: 'kd-13', name: "Kaftan Sagesse Junior", price: 90000, image: 'https://lh3.googleusercontent.com/d/1sOwoJa1uzpc4rZwpcOuBI-Ih5KzUlsIO', category: 'Classique', target: 'Enfant', garmentType: 'boubou', fabricType: 'coton' },
  { id: 'e9', name: 'Tunique Royale Junior', price: 110000, image: 'https://lh3.googleusercontent.com/d/1yeajzyrvgzNNdkslAaL1yVLctlwC8gc3', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'coton' },

  // Chaussures Homme
  { id: 'sh-1', name: 'Babouche Royale en Cuir', price: 120000, image: 'https://lh3.googleusercontent.com/d/1USF9ImJ4hCkhPyYFEfI4xjKo0TUkt7cc', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-2', name: 'Babouche Prestige Habé', price: 110000, image: 'https://lh3.googleusercontent.com/d/1Fq27Cr76otnudicas8oYwq_LAlAxFNvA', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-3', name: 'Mocassin Traditionnel', price: 130000, image: 'https://lh3.googleusercontent.com/d/12o-IBS9vBX5ElUT2ytuykiXFDCe4J62V', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-4', name: 'Sandales Noblesse Brodé', price: 95000, image: 'https://lh3.googleusercontent.com/d/1dnngfH0g7VVr4tfpH9cyNpM9tIYRVngS', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-5', name: 'Babouche Souveraine Blanche', price: 125000, image: 'https://lh3.googleusercontent.com/d/1TbOFxhE8Fcn0AiLDICgLVoTlokeS16sp', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-6', name: 'Soulier Confort Prestige', price: 140000, image: 'https://lh3.googleusercontent.com/d/1XUikto_kl1m45HVX5yy4PqMa4hQaVB3g', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-7', name: 'Babouche Elite Bazin', price: 115000, image: 'https://lh3.googleusercontent.com/d/1hNgA3g8mENTRQw6eXNTx7ToUxmGVoAjc', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-8', name: 'Mocassin Brodé Habé', price: 135000, image: 'https://lh3.googleusercontent.com/d/1dXQxTFvJHf2kssiq1nPwqdtQMWT2YtdT', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: 'sh-9', name: "Sandales d'Apparat Cuir", price: 100000, image: 'https://lh3.googleusercontent.com/d/1o5VAiDC5CS-xOta1ALsEPLDuMZ6jC9Nf', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },

  // Accessoires / Parfums / Chapeaux
  { id: '11', name: 'Accessoire Kid Styl', price: 25000, image: '', category: 'Accessoires', target: 'Enfant', garmentType: 'accessoire', fabricType: 'wax' },
  { id: '6', name: 'Montre Luxe Habé', price: 210000, image: '', category: 'Accessoires', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '7', name: 'Parfum Signature', price: 80000, image: '', category: 'Parfum', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '8', name: 'Chapeau Tradition', price: 45000, image: '', category: 'Chapeau', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('habe_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        const defaultIds = new Set(INITIAL_PRODUCTS.map(p => p.id));
        
        // Filter out obsolete or deleted default products, preserving custom items added by users
        const filteredParsed = parsed.filter(savedProd => {
          const isDefaultPattern = /^(e\d+|t-\d+|c-\d+|kd-\d+|sh-\d+|hm-\d+|6|7|8|11)$/.test(savedProd.id);
          if (isDefaultPattern) {
            return defaultIds.has(savedProd.id);
          }
          return true;
        });

        // Sync & heal stored products with updated defaults from codebase
        const merged = filteredParsed.map(savedProd => {
          const defaultProd = INITIAL_PRODUCTS.find(p => p.id === savedProd.id);
          if (defaultProd) {
            // Restore latest codebase definition for core products to reflect moved categories/targets/renamings
            return {
              ...savedProd,
              name: defaultProd.name,
              price: defaultProd.price,
              image: defaultProd.image,
              category: defaultProd.category,
              target: defaultProd.target,
              garmentType: defaultProd.garmentType,
              fabricType: defaultProd.fabricType
            };
          }
          return savedProd;
        });

        // Add any brand new default products not yet in the stored list
        const savedIds = new Set(filteredParsed.map(p => p.id));
        const newDefaults = INITIAL_PRODUCTS.filter(p => !savedIds.has(p.id));
        
        const finalProducts = [...merged, ...newDefaults];
        localStorage.setItem('habe_products', JSON.stringify(finalProducts));
        return finalProducts;
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    localStorage.setItem('habe_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });
  const [activeTarget, setActiveTargetState] = useState<Target>('Homme');
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<{ garmentType: GarmentType | null, fabricType: FabricType | null }>({
    garmentType: null,
    fabricType: null,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPretProduct, setSelectedPretProduct] = useState<PretProduct | null>(null);
  const [isTrendingOpen, setIsTrendingOpen] = useState<boolean>(false);
  const [isPretAPorterOpen, setIsPretAPorterOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('habe_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    // Check local admin fallback
    const isLocalAdmin = localStorage.getItem('habe_local_admin') === 'true';
    if (isLocalAdmin) {
      const adminEmail = localStorage.getItem('habe_local_admin_email') || 'prodioumar910@gmail.com';
      setUser({
        id: 'admin-local-id',
        email: adminEmail,
        user_metadata: { full_name: 'Habé Administrateur' },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
      } as any);
      return;
    }

    // Check local user fallback
    const isLocalUserJson = localStorage.getItem('habe_local_user');
    if (isLocalUserJson) {
      try {
        const localUser = JSON.parse(isLocalUserJson);
        setUser({
          id: 'user-local-id',
          email: localUser.email,
          user_metadata: { full_name: localUser.fullName },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
        } as any);
        return;
      } catch (e) {
        localStorage.removeItem('habe_local_user');
      }
    }

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If we are signed in on Supabase with the admin email, also register it as admin
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem('habe_local_admin');
    localStorage.removeItem('habe_local_admin_email');
    localStorage.removeItem('habe_local_user');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Ignore Supabase signOut error:', e);
    }
    setUser(null);
  };
  
  const setActiveTarget = (target: Target) => {
    setActiveTargetState(target);
    setFilters({ garmentType: null, fabricType: null });
  };

  const addToCart = (product: Product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((p) => p.id !== productId));
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const addProduct = (product: Product) => setProducts(prev => [product, ...prev]);
  const removeProduct = (productId: string) => setProducts(prev => prev.filter(p => p.id !== productId));
  const updateProduct = (updatedProduct: Product) => setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));

  return (
    <StoreContext.Provider value={{
      cart, favorites, products, addProduct, removeProduct, updateProduct,
      addToCart, removeFromCart, toggleFavorite,
      activeTarget, setActiveTarget, activeCategory, setActiveCategory,
      filters, setFilters,
      user, signOut,
      selectedProduct, setSelectedProduct,
      selectedPretProduct, setSelectedPretProduct,
      isTrendingOpen, setIsTrendingOpen,
      isPretAPorterOpen, setIsPretAPorterOpen
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
