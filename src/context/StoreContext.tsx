import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Target, Category, GarmentType, FabricType } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

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
  user: User | null;
  signOut: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock data
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Boubou Royal Wax', price: 150000, image: '', category: 'Ensemble Royal', target: 'Homme', garmentType: 'boubou', fabricType: 'wax' },
  { id: '2', name: 'Chemise Bazin Chic', price: 85000, image: '', category: 'Classique', target: 'Homme', garmentType: 'chemise', fabricType: 'bazin' },
  { id: '3', name: 'Pantalon Coton Slim', price: 60000, image: '', category: 'Tendance', target: 'Homme', garmentType: 'pantalon', fabricType: 'coton' },
  { id: '4', name: 'Ensemble Petit Prince', price: 95000, image: '', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'wax' },
  { id: '9', name: 'Boubou Junior Bazin', price: 75000, image: '', category: 'Ensemble Royal', target: 'Enfant', garmentType: 'boubou', fabricType: 'bazin' },
  { id: '10', name: 'Chemise Enfant Coton', price: 45000, image: '', category: 'Classique', target: 'Enfant', garmentType: 'chemise', fabricType: 'coton' },
  { id: '11', name: 'Accessoire Kid Styl', price: 25000, image: '', category: 'Accessoires', target: 'Enfant', garmentType: 'accessoire', fabricType: 'wax' },
  { id: '5', name: 'Chaussures Cuir Habé', price: 120000, image: '', category: 'Chaussures', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '6', name: 'Montre Luxe Habé', price: 210000, image: '', category: 'Accessoires', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '7', name: 'Parfum Signature', price: 80000, image: '', category: 'Parfum', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
  { id: '8', name: 'Chapeau Tradition', price: 45000, image: '', category: 'Chapeau', target: 'Homme', garmentType: 'accessoire', fabricType: 'coton' },
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTarget, setActiveTargetState] = useState<Target>('Homme');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };
  
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
      filters, setFilters,
      user, signOut
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
