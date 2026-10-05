import { Product, Order, MeasureResult } from '../types';

const getBaseUrl = () => {
  const env = (import.meta as any).env || {};
  let envUrl = env.VITE_BACKEND_URL;
  
  if (!envUrl || typeof envUrl !== 'string' || envUrl.trim().length === 0) {
    return '';
  }

  envUrl = envUrl.trim();

  // If the environment URL looks like a Supabase URL, it's a misconfiguration
  // for custom API routes which must be handled by the Express backend.
  if (envUrl.toLowerCase().includes('supabase.co')) {
    console.warn('API: Ignoring VITE_BACKEND_URL because it points to Supabase instead of Express.', envUrl);
    return '';
  }

  // Ensure it's an absolute URL if provided
  if (!envUrl.startsWith('http')) {
    return '';
  }

  // Remove trailing slash to prevent double slashes like //api/
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
};

const BASE_URL = getBaseUrl();

export interface ApiUser {
  id: number | string;
  email: string;
  fullName: string;
  role: 'admin' | 'client';
  createdAt?: string;
}

const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err: any) {
    console.warn(`Fetch notice for ${url}:`, err?.message || err);
    throw new Error(`Fetch notice for ${url}: ${err?.message || 'Connexion indisponible'}`);
  }
};

export const api = {
  // Health check
  async checkHealth() {
    try {
      const res = await safeFetch(`${BASE_URL}/api/health`);
      return await res.json();
    } catch (err) {
      return { status: 'offline', connected: false };
    }
  },

  // Auth endpoints (Neon PostgreSQL)
  auth: {
    async register(email: string, password: string, fullName: string) {
      const res = await safeFetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription");
      return data;
    },

    async login(email: string, password: string) {
      const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      return data;
    },

    async getUsers(): Promise<ApiUser[]> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/auth/users`);
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('api.auth.getUsers offline, using stored accounts');
        return [];
      }
    },

    async deleteUser(id: number | string) {
      try {
        const res = await safeFetch(`${BASE_URL}/api/auth/users/${id}`, {
          method: 'DELETE',
        });
        return await res.json();
      } catch (err) {
        return { success: true };
      }
    },
  },

  // Products (Neon PostgreSQL)
  products: {
    async getAll(): Promise<Product[]> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/products`);
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('api.products.getAll offline, using local storage');
        return [];
      }
    },

    async save(product: Product): Promise<Product> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        if (!res.ok) return product;
        return await res.json();
      } catch (err) {
        return product;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await safeFetch(`${BASE_URL}/api/products/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        // Handled locally
      }
    },
  },

  // Orders (Neon PostgreSQL)
  orders: {
    async getAll(): Promise<Order[]> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/orders`);
        if (!res.ok) return [];
        return await res.json();
      } catch (err) {
        console.warn('api.orders.getAll offline, using local storage');
        return [];
      }
    },

    async create(order: Order): Promise<Order> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order),
        });
        if (!res.ok) return order;
        return await res.json();
      } catch (err) {
        return order;
      }
    },

    async updateStatus(id: string, status: 'en cours' | 'livré' | 'annulé'): Promise<Order> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/orders/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) return { id, status } as any;
        return await res.json();
      } catch (err) {
        return { id, status } as any;
      }
    },

    async delete(id: string): Promise<void> {
      try {
        await safeFetch(`${BASE_URL}/api/orders/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        // Handled locally
      }
    },
  },

  // Measurements (Neon PostgreSQL)
  measurements: {
    async getAll(email?: string): Promise<any[]> {
      const url = email
        ? `${BASE_URL}/api/measurements?email=${encodeURIComponent(email)}`
        : `${BASE_URL}/api/measurements`;
      const res = await safeFetch(url);
      if (!res.ok) throw new Error('Impossible de charger les mesures');
      return await res.json();
    },

    async save(measurement: any): Promise<any> {
      const res = await safeFetch(`${BASE_URL}/api/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(measurement),
      });
      if (!res.ok) throw new Error('Impossible de sauvegarder les mesures');
      return await res.json();
    },
  },

  // Reviews
  reviews: {
    async get(productId: string): Promise<any[]> {
      const res = await safeFetch(`${BASE_URL}/api/reviews/${productId}`);
      if (!res.ok) return [];
      return await res.json();
    },

    async create(productId: string, authorName: string, rating: number, comment: string): Promise<any> {
      const res = await safeFetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, authorName, rating, comment }),
      });
      if (!res.ok) throw new Error('Impossible de publier l avis');
      return await res.json();
    },
  },

  // Site Settings (Synchronized Logo & Branding)
  settings: {
    async getLogo(): Promise<string> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/settings/logo`);
        if (!res.ok) return '';
        const data = await res.json();
        return data.logoUrl || '';
      } catch (err) {
        return '';
      }
    },

    async saveLogo(logoUrl: string): Promise<string> {
      try {
        const res = await safeFetch(`${BASE_URL}/api/settings/logo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logoUrl }),
        });
        if (!res.ok) return logoUrl;
        const data = await res.json();
        return data.logoUrl || logoUrl;
      } catch (err) {
        return logoUrl;
      }
    },
  },
};
