import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product, Target, Category, GarmentType, FabricType } from '../types';

interface StoreContextType {
  cart: Product[];
  favorites: string[];
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock data
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Boubou Royal Wax', price: 150, image: 'https://images.unsplash.com/photo-1548624149-f9b1859aa7d0?q=80&w=500&auto=format&fit=crop', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: '2', name: 'Chemise Bazin Chic', price: 85, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=500&auto=format&fit=crop', category: 'Classique', target: 'Homme', garmentType: 'chemise', fabricType: 'bazin' },
  { id: '3', name: 'Pantalon Coton Slim', price: 60, image: 'https://images.unsplash.com/photo-1624371414361-e6e9efc99142?q=80&w=500&auto=format&fit=crop', category: 'Tendance', target: 'Homme', garmentType: 'pantalon', fabricType: 'coton' },
  { id: '4', name: 'Ensemble Petit Prince', price: 95, image: 'https://images.unsplash.com/photo-1519457431-75514b723006?q=80&w=500&auto=format&fit=crop', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'wax' },
  { id: '9', name: 'Boubou Junior Bazin', price: 75, image: 'https://images.unsplash.com/photo-1519704201730-802551ec9413?q=80&w=500&auto=format&fit=crop', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: '10', name: 'Chemise Enfant Coton', price: 45, image: 'https://images.unsplash.com/photo-1503919919749-646dfc4a5bb9?q=80&w=500&auto=format&fit=crop', category: 'Classique', target: 'Enfant', garmentType: 'chemise', fabricType: 'coton' },
  { id: '11', name: 'Accessoire Kid Styl', price: 25, image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=500&auto=format&fit=crop', category: 'Accessoires', target: 'Enfant', garmentType: 'accessoire', fabricType: 'wax' },
  { id: '5', name: 'Chaussures Cuir Habé', price: 120, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=500&auto=format&fit=crop', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '6', name: 'Montre Luxe Habé', price: 210, image: 'https://images.unsplash.com/photo-1524592091214-8f97ad337cf5?q=80&w=500&auto=format&fit=crop', category: 'Accessoires', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '7', name: 'Parfum Signature', price: 80, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop', category: 'Parfum', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '8', name: 'Chapeau Tradition', price: 45, image: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=500&auto=format&fit=crop', category: 'Chapeau', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTarget, setActiveTargetState] = useState<Target>('Homme');
  
  const setActiveTarget = (target: Target) => {
    setActiveTargetState(target);
    setFilters({ garmentType: null, fabricType: null });
  };
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<{ garmentType: GarmentType | null, fabricType: FabricType | null }>({
    garmentType: null,
    fabricType: null,
  });

  const addToCart = (product: Product) => setCart((prev) => [...prev, product]);
  const removeFromCart = (productId: string) => setCart((prev) => prev.filter((p) => p.id !== productId));
  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  return (
    <StoreContext.Provider value={{
      cart, favorites, addToCart, removeFromCart, toggleFavorite,
      activeTarget, setActiveTarget, activeCategory, setActiveCategory,
      filters, setFilters
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
