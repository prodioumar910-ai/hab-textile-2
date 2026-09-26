import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, Target, Category, GarmentType, FabricType, PretProduct, Order } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { api } from '../lib/api';

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
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: 'en cours' | 'livré' | 'annulé') => void;
  deleteOrder: (orderId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('habe_products');
    
    // Retrieve deleted products list so deletions are preserved forever and not restored on reload
    const savedDeleted = localStorage.getItem('habe_deleted_products');
    let deletedIds = new Set<string>();
    if (savedDeleted) {
      try {
        deletedIds = new Set(JSON.parse(savedDeleted) as string[]);
      } catch (e) {}
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        const defaultIds = new Set(INITIAL_PRODUCTS.map(p => p.id).filter(id => !deletedIds.has(id)));
        
        // Filter out obsolete or deleted default products, preserving custom items added by users
        const filteredParsed = parsed.filter(savedProd => {
          if (deletedIds.has(String(savedProd.id))) {
            return false;
          }
          const isDefaultPattern = /^(e\d+|t-\d+|c-\d+|kd-\d+|sh-\d+|hm-\d+|hp-\d+|6|7|8|11)$/.test(String(savedProd.id));
          if (isDefaultPattern) {
            return defaultIds.has(String(savedProd.id));
          }
          return true;
        });

        // Sync & heal stored products with updated defaults from codebase
        const merged = filteredParsed.map(savedProd => {
          if (savedProd.isEdited) {
            return savedProd;
          }
          const defaultProd = INITIAL_PRODUCTS.find(p => String(p.id) === String(savedProd.id));
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

        // Add any brand new default products not yet in the stored list, excluding deleted ones
        const savedIds = new Set(filteredParsed.map(p => String(p.id)));
        const newDefaults = INITIAL_PRODUCTS.filter(p => !savedIds.has(String(p.id)) && !deletedIds.has(String(p.id)));
        
        const finalProducts = [...merged, ...newDefaults];
        localStorage.setItem('habe_products', JSON.stringify(finalProducts));
        return finalProducts;
      } catch (e) {
        return INITIAL_PRODUCTS.filter(p => !deletedIds.has(p.id));
      }
    }
    const filteredInitial = INITIAL_PRODUCTS.filter(p => !deletedIds.has(p.id));
    localStorage.setItem('habe_products', JSON.stringify(filteredInitial));
    return filteredInitial;
  });
  const [activeTarget, setActiveTargetState] = useState<Target>('Enfant');
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>('Ensemble Royal');
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const stored = localStorage.getItem('habe_orders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addOrder = (order: Order) => {
    setOrders(prev => {
      const updated = [order, ...prev];
      localStorage.setItem('habe_orders', JSON.stringify(updated));
      return updated;
    });
    api.orders.create(order).catch(e => console.warn('Neon sync create order error:', e));
  };

  const updateOrderStatus = (orderId: string, status: 'en cours' | 'livré' | 'annulé') => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('habe_orders', JSON.stringify(updated));
      return updated;
    });
    api.orders.updateStatus(orderId, status).catch(e => console.warn('Neon sync order status error:', e));
  };

  const deleteOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      localStorage.setItem('habe_orders', JSON.stringify(updated));
      return updated;
    });
    api.orders.delete(orderId).catch(e => console.warn('Neon sync delete order error:', e));
  };
  const [filters, setFilters] = useState<{ garmentType: GarmentType | null, fabricType: FabricType | null }>({
    garmentType: null,
    fabricType: null,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPretProduct, setSelectedPretProduct] = useState<PretProduct | null>(null);
  const [isTrendingOpen, setIsTrendingOpen] = useState<boolean>(false);
  const [isPretAPorterOpen, setIsPretAPorterOpen] = useState<boolean>(false);

  // Sync products and orders with Neon PostgreSQL database on mount
  useEffect(() => {
    api.products.getAll()
      .then((neonProducts) => {
        if (neonProducts && neonProducts.length > 0) {
          setProducts(neonProducts);
          localStorage.setItem('habe_products', JSON.stringify(neonProducts));
        }
      })
      .catch((err) => console.warn('Neon products fetch error, fallback to local:', err));

    api.orders.getAll()
      .then((neonOrders) => {
        if (neonOrders && neonOrders.length > 0) {
          setOrders(neonOrders);
          localStorage.setItem('habe_orders', JSON.stringify(neonOrders));
        }
      })
      .catch((err) => console.warn('Neon orders fetch error, fallback to local:', err));
  }, []);

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
    localStorage.removeItem('habe_skip_auth');
    localStorage.removeItem('habe_selected_experience');
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

  const addProduct = (product: Product) => {
    const productWithFlag = { ...product, isEdited: true };
    setProducts(prev => {
      const updated = [productWithFlag, ...prev];
      localStorage.setItem('habe_products', JSON.stringify(updated));
      return updated;
    });
    api.products.save(productWithFlag).catch(e => console.warn('Neon sync addProduct error:', e));
  };
  const removeProduct = (productId: string) => {
    setProducts(prev => {
      const updated = prev.filter(p => String(p.id) !== String(productId));
      localStorage.setItem('habe_products', JSON.stringify(updated));
      return updated;
    });
    api.products.delete(productId).catch(e => console.warn('Neon sync removeProduct error:', e));
    
    // Store in deleted IDs list so it is never re-added during automatic codebase syncs
    const savedDeleted = localStorage.getItem('habe_deleted_products');
    let deletedList: string[] = [];
    if (savedDeleted) {
      try {
        deletedList = JSON.parse(savedDeleted);
      } catch (e) {}
    }
    const targetIdStr = String(productId);
    if (!deletedList.includes(targetIdStr)) {
      deletedList.push(targetIdStr);
      localStorage.setItem('habe_deleted_products', JSON.stringify(deletedList));
    }
  };
  const updateProduct = (updatedProduct: Product) => {
    const productWithFlag = { ...updatedProduct, isEdited: true };
    setProducts(prev => {
      const updated = prev.map(p => String(p.id) === String(productWithFlag.id) ? productWithFlag : p);
      localStorage.setItem('habe_products', JSON.stringify(updated));
      return updated;
    });
    api.products.save(productWithFlag).catch(e => console.warn('Neon sync updateProduct error:', e));
  };

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
      isPretAPorterOpen, setIsPretAPorterOpen,
      orders, addOrder, updateOrderStatus, deleteOrder
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
