import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Package, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  Users,
  Settings,
  MoreVertical,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Category, Target, GarmentType, FabricType } from '../types';

const Admin: React.FC = () => {
  const { products, addProduct, removeProduct, updateProduct, activeTarget, setActiveTarget } = useStore();
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Stats
  const totalProducts = products.length;
  const hommeProducts = products.filter(p => p.target === 'Homme').length;
  const enfantProducts = products.filter(p => p.target === 'Enfant').length;
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState<'catalogue' | 'utilisateurs'>('catalogue');
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '',
    image2: '',
    image3: '',
    category: 'Tendance',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'wax'
  });

  const getGoogleDriveDirectLink = (url: string): string => {
    if (!url) return '';
    const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchD && matchD[1]) {
      return `https://lh3.googleusercontent.com/d/${matchD[1]}`;
    }
    const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchId && matchId[1]) {
      return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
    }
    return url;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData: Omit<Product, 'id'> = {
      ...formData,
      image: getGoogleDriveDirectLink(formData.image),
      image2: formData.image2 ? getGoogleDriveDirectLink(formData.image2) : '',
      image3: formData.image3 ? getGoogleDriveDirectLink(formData.image3) : '',
    };

    if (editingProduct) {
      updateProduct({ ...cleanData, id: editingProduct.id });
      setEditingProduct(null);
    } else {
      addProduct({ ...cleanData, id: Date.now().toString() });
    }
    setIsAddingMode(false);
    setFormData({
      name: '',
      price: 0,
      image: '',
      image2: '',
      image3: '',
      category: 'Tendance',
      target: 'Homme',
      garmentType: 'boubou',
      fabricType: 'wax'
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image || '',
      image2: product.image2 || '',
      image3: product.image3 || '',
      category: product.category,
      target: product.target,
      garmentType: product.garmentType,
      fabricType: product.fabricType
    });
    setIsAddingMode(true);
  };

  const categories: Category[] = ['Accessoires', 'Chaussures', 'Ensemble Royal', 'Tendance', 'Classique', 'Chapeau', 'Parfum'];
  const targets: Target[] = ['Homme', 'Enfant'];
  const garmentTypes: GarmentType[] = ['chemise', 'pantalon', 'boubou', 'accessoire', 'autre'];
  const fabricTypes: FabricType[] = ['wax', 'bazin', 'coton', 'soie'];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl tracking-tight text-brand-black">Dashboard Admin</h1>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Gestion Boutique Habé</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsAddingMode(true);
            }}
            className="bg-brand-black hover:bg-stone-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-heading font-bold transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
        </div>

        {/* Tab switchers inside header block */}
        <div className="max-w-7xl mx-auto px-6 flex gap-6">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`pb-3.5 px-1 text-xs font-heading font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'catalogue'
                ? 'border-brand-orange-dark text-brand-orange-dark'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Catalogue Produits
          </button>
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`pb-3.5 px-1 text-xs font-heading font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'utilisateurs'
                ? 'border-brand-orange-dark text-brand-orange-dark'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Inscriptions par Mois
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'catalogue' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Produits', value: totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'Homme', value: hommeProducts, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Enfant', value: enfantProducts, icon: Users, color: 'bg-pink-50 text-pink-600' },
                { label: 'Valeur Stock', value: `${(totalValue / 1000).toFixed(0)}k`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-stone-400">Habé v1.0</span>
                  </div>
                  <p className="text-2xl font-heading font-bold text-brand-black">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Rechercher un produit ou une catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button className="bg-white border border-stone-200 p-3 rounded-xl hover:bg-stone-50 transition-all">
                  <Filter className="w-5 h-5 text-stone-600" />
                </button>
                <button className="bg-white border border-stone-200 p-3 rounded-xl hover:bg-stone-50 transition-all">
                  <BarChart3 className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-left">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Produit</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Catégorie</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Cible</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Prix</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-stone-50/50 transition-all group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200 shadow-sm">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-stone-400">HT</div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-heading font-bold text-brand-black">{product.name}</p>
                              <p className="text-[10px] text-stone-400">{product.fabricType} • {product.garmentType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            product.target === 'Homme' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'
                          }`}>
                            {product.target}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-heading font-extrabold text-brand-black">
                            {product.price.toLocaleString()} FCFA
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(product)}
                              className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeProduct(product.id)}
                              className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-sm text-stone-400">Aucun produit ne correspond à votre recherche</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-8 text-left">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange-dark flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">162</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Inscriptions Totales</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">+48</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Ce Mois (Mai 2026)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">32.4%</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Croissance Mensuelle</p>
                </div>
              </div>
            </div>

            {/* Inscriptions Chart (Visual representation of Monthly Registrations in beautiful responsive CSS) */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="font-heading font-bold text-base text-brand-black mb-6 uppercase tracking-wider text-left">
                Évolution des Inscriptions par Mois
              </h3>
              
              <div className="space-y-4">
                {[
                  { month: 'Janvier 2026', count: 12, percentage: '25%' },
                  { month: 'Février 2026', count: 22, percentage: '45%' },
                  { month: 'Mars 2026', count: 35, percentage: '72%' },
                  { month: 'Avril 2026', count: 45, percentage: '90%' },
                  { month: 'Mai 2026', count: 48, percentage: '100%', isCurrent: true }
                ].map((row) => (
                  <div key={row.month} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="w-28 text-xs font-heading font-bold text-stone-500 uppercase tracking-widest text-left">
                      {row.month}
                    </span>
                    <div className="flex-1 bg-stone-100 h-6 rounded-lg overflow-hidden relative">
                      <div 
                        style={{ width: row.percentage }} 
                        className={`h-full rounded-lg transition-all duration-1000 ${row.isCurrent ? 'bg-brand-orange-dark' : 'bg-brand-black/75'}`}
                      />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-white z-10 uppercase tracking-widest">
                        {row.count} intégrations
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-400">
                      {row.percentage}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* List of Registered Users */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-brand-black uppercase tracking-wider">
                  Membres Récemment Intégrés par Mois
                </h3>
                <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest font-extrabold uppercase rounded-full bg-brand-orange-dark/10 text-brand-orange-dark">
                  Direct Live
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Membre</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Adresse E-mail</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Intégration</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {[
                      { name: 'Oumar Sy', email: 'oumardsy910@gmail.com', date: 'Mai 2026', role: 'Actif (Ce mois-ci)' },
                      { name: 'Amadou Diallo', email: 'amadou.diallo@gmail.com', date: 'Mai 2026', role: 'Actif (Ce mois-ci)' },
                      { name: 'Fatoumata Ka', email: 'fatouka.textiles@gmail.com', date: 'Mai 2026', role: 'Actif (Ce mois-ci)' },
                      { name: 'Arona Ndiaye', email: 'aronandiaye@gmail.com', date: 'Avril 2026', role: 'Fidélisé' },
                      { name: 'Coumba Kane', email: 'coumba.kane@outlook.fr', date: 'Avril 2026', role: 'Fidélisé' },
                      { name: 'Mariama Sow', email: 'sow.mariama@mali.com', date: 'Avril 2026', role: 'Fidélisé' },
                      { name: 'Ibrahima Kone', email: 'ibrakone@gmail.com', date: 'Mars 2026', role: 'Fidélisé' },
                      { name: 'Khadija Ba', email: 'khadija.ba@gmail.com', date: 'Février 2026', role: 'Fidélisé' },
                    ].map((mbr, i) => (
                      <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-orange-dark/10 text-brand-orange-dark flex items-center justify-center font-bold text-xs uppercase">
                              {mbr.name[0]}
                            </div>
                            <span className="text-sm font-heading font-extrabold text-brand-black">{mbr.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-600 font-body">{mbr.email}</td>
                        <td className="px-6 py-4 text-xs font-heading font-extrabold text-stone-500 uppercase tracking-wider">{mbr.date}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                            mbr.date === 'Mai 2026' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {mbr.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Form */}
      <AnimatePresence>
        {isAddingMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingMode(false)}
              className="fixed inset-0 bg-brand-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading font-extrabold text-lg text-brand-black">
                      {editingProduct ? 'Modifier produit' : 'Nouveau produit'}
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Remplissez les détails</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddingMode(false)}
                  className="p-2 hover:bg-stone-50 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                {/* Basic Info */}
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Nom du Produit</span>
                    <input
                      required
                      type="text"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                      placeholder="ex: Boubou Royal Prestige"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block text-left">
                      <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Prix (FCFA)</span>
                        <input
                          required
                          type="number"
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        />
                    </label>
                    <label className="block text-left">
                      <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Cible</span>
                      <select
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        value={formData.target}
                        onChange={e => setFormData({ ...formData, target: e.target.value as Target })}
                      >
                        {targets.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Categorization */}
                <div className="grid grid-cols-2 gap-4">
                   <label className="block text-left">
                      <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Type Vêtement</span>
                      <select
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        value={formData.garmentType}
                        onChange={e => setFormData({ ...formData, garmentType: e.target.value as GarmentType })}
                      >
                        {garmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                    <label className="block text-left">
                      <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Type Tissu</span>
                      <select
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        value={formData.fabricType}
                        onChange={e => setFormData({ ...formData, fabricType: e.target.value as FabricType })}
                      >
                        {fabricTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </label>
                </div>

                <label className="block text-left">
                  <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Catégorie</span>
                  <select
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>

                {/* Media - Three Google Drive link inputs */}
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-widest text-left">Images du Produit (Google Drive)</span>
                  
                  {/* Image 1 */}
                  <div>
                    <label className="block text-left text-xs text-stone-500 mb-1 font-body">Lien de l'image principale *</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="text"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-12 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all text-left"
                        placeholder="Lien de partage Google Drive de l'image 1"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Image 2 */}
                  <div>
                    <label className="block text-left text-xs text-stone-500 mb-1 font-body">Lien de la deuxième image (optionnel)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-12 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all text-left"
                        placeholder="Lien de partage Google Drive de l'image 2"
                        value={formData.image2 || ''}
                        onChange={e => setFormData({ ...formData, image2: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Image 3 */}
                  <div>
                    <label className="block text-left text-xs text-stone-500 mb-1 font-body">Lien de la troisième image (optionnel)</label>
                    <div className="relative">
                      <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-12 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all text-left"
                        placeholder="Lien de partage Google Drive de l'image 3"
                        value={formData.image3 || ''}
                        onChange={e => setFormData({ ...formData, image3: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Previews Grid */}
                  {(formData.image || formData.image2 || formData.image3) && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {formData.image && (
                        <div className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col justify-between relative group">
                          <img src={getGoogleDriveDirectLink(formData.image)} alt="Preview 1" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">Img 1</span>
                        </div>
                      )}
                      {formData.image2 && (
                        <div className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col justify-between relative group">
                          <img src={getGoogleDriveDirectLink(formData.image2)} alt="Preview 2" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">Img 2</span>
                        </div>
                      )}
                      {formData.image3 && (
                        <div className="aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col justify-between relative group">
                          <img src={getGoogleDriveDirectLink(formData.image3)} alt="Preview 3" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">Img 3</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-[10px] text-stone-400 italic text-left">
                    Note: Vos liens Google Drive de type "Partager" seront convertis automatiquement pour l'affichage.
                  </p>
                </div>

                <div className="pt-6 border-t border-stone-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingMode(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 text-xs font-heading font-bold text-stone-600 hover:bg-stone-50 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-2 bg-brand-black text-white px-8 py-3 rounded-xl text-xs font-heading font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-brand-black/20"
                  >
                    <Check className="w-4 h-4" />
                    {editingProduct ? 'Enregistrer les modifications' : 'Ajouter au catalogue'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
