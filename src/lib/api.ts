import { Product, Order, MeasureResult } from '../types';

const BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || '';

export interface ApiUser {
  id: number | string;
  email: string;
  fullName: string;
  role: 'admin' | 'client';
  createdAt?: string;
}

export const api = {
  // Health check
  async checkHealth() {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      return await res.json();
    } catch (err) {
      console.warn('Backend health check failed:', err);
      return { status: 'offline', connected: false };
    }
  },

  // Auth endpoints (Neon PostgreSQL)
  auth: {
    async register(email: string, password: string, fullName: string) {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'inscription");
      return data;
    },

    async login(email: string, password: string) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
      return data;
    },

    async getUsers(): Promise<ApiUser[]> {
      const res = await fetch(`${BASE_URL}/api/auth/users`);
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs');
      return await res.json();
    },

    async deleteUser(id: number | string) {
      const res = await fetch(`${BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
      });
      return await res.json();
    },
  },

  // Products (Neon PostgreSQL)
  products: {
    async getAll(): Promise<Product[]> {
      const res = await fetch(`${BASE_URL}/api/products`);
      if (!res.ok) throw new Error('Impossible de charger les produits');
      return await res.json();
    },

    async save(product: Product): Promise<Product> {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Impossible de sauvegarder le produit');
      return await res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Impossible de supprimer le produit');
    },
  },

  // Orders (Neon PostgreSQL)
  orders: {
    async getAll(): Promise<Order[]> {
      const res = await fetch(`${BASE_URL}/api/orders`);
      if (!res.ok) throw new Error('Impossible de charger les commandes');
      return await res.json();
    },

    async create(order: Order): Promise<Order> {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error('Impossible de créer la commande');
      return await res.json();
    },

    async updateStatus(id: string, status: 'en cours' | 'livré' | 'annulé'): Promise<Order> {
      const res = await fetch(`${BASE_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Impossible de mettre à jour le statut');
      return await res.json();
    },

    async delete(id: string): Promise<void> {
      const res = await fetch(`${BASE_URL}/api/orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Impossible de supprimer la commande');
    },
  },

  // Measurements (Neon PostgreSQL)
  measurements: {
    async getAll(email?: string): Promise<any[]> {
      const url = email
        ? `${BASE_URL}/api/measurements?email=${encodeURIComponent(email)}`
        : `${BASE_URL}/api/measurements`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Impossible de charger les mesures');
      return await res.json();
    },

    async save(measurement: any): Promise<any> {
      const res = await fetch(`${BASE_URL}/api/measurements`, {
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
      const res = await fetch(`${BASE_URL}/api/reviews/${productId}`);
      if (!res.ok) return [];
      return await res.json();
    },

    async create(productId: string, authorName: string, rating: number, comment: string): Promise<any> {
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, authorName, rating, comment }),
      });
      if (!res.ok) throw new Error('Impossible de publier l avis');
      return await res.json();
    },
  },
};
