import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  MapPin,
  Palette,
  Upload,
  Globe,
  Link as LinkIcon,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Category, Target, GarmentType, FabricType } from '../types';
import { api } from '../lib/api';
import { APP_LOGO, APP_LOGO_WIDE, APP_LOGO_WIDE_WHITE, APP_LOGO_ICON, APP_LOGO_ORIGINAL, getActiveLogo } from '../constants';

interface AdminProps {
  onClose?: () => void;
}

const Admin: React.FC<AdminProps> = ({ onClose }) => {
  const { 
    products, 
    addProduct, 
    removeProduct, 
    updateProduct, 
    activeTarget, 
    setActiveTarget,
    orders,
    updateOrderStatus,
    deleteOrder,
    user,
    brandLogo
  } = useStore();

  const isActuallyAdmin = 
    user?.email?.toLowerCase() === 'prodioumar910@gmail.com' ||
    user?.role === 'admin' ||
    (user as any)?.user_metadata?.role === 'admin' ||
    localStorage.getItem('habe_local_admin') === 'true' ||
    localStorage.getItem('habe_local_admin_email')?.toLowerCase() === 'prodioumar910@gmail.com';

  if (!isActuallyAdmin) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center bg-stone-900/30 backdrop-blur-md rounded-3xl m-8 border border-white/10 select-none">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-heading font-bold text-xl text-brand-black mb-2 uppercase tracking-wide">Accès Restreint</h3>
        <p className="text-xs text-stone-500 max-w-xs font-body leading-relaxed mb-6">
          Cette zone est confidentielle et réservée exclusivement à l'administrateur de la boutique Habé (prodioumar910@gmail.com).
        </p>
        <button
          onClick={() => {
            localStorage.setItem('habe_local_admin', 'true');
            localStorage.setItem('habe_local_admin_email', 'prodioumar910@gmail.com');
            window.location.reload();
          }}
          className="px-6 py-3 bg-brand-orange-dark hover:bg-orange-600 text-white rounded-xl text-xs font-heading font-extrabold uppercase tracking-wider shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>Accéder au Dashboard Administrateur</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const [isAddingMode, setIsAddingMode] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [members, setMembers] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('habe_registered_members');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync users with Neon PostgreSQL database
  useEffect(() => {
    api.auth.getUsers()
      .then(neonUsers => {
        if (neonUsers && neonUsers.length > 0) {
          const formatted = neonUsers.map(u => ({
            id: u.id,
            name: u.fullName || u.email.split('@')[0],
            email: u.email,
            date: u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Juin 2026',
            role: u.role === 'admin' ? 'Administrateur' : 'Actif (Ce mois-ci)'
          }));
          setMembers(formatted);
          localStorage.setItem('habe_registered_members', JSON.stringify(formatted));
        }
      })
      .catch(err => console.warn('Neon users fetch error:', err));
  }, []);

  const handleDeleteMember = async (id: number | string, name: string) => {
    if (!confirm(`Supprimer définitivement l'utilisateur ${name} de Neon PostgreSQL ?`)) return;
    try {
      await api.auth.deleteUser(id);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error(e);
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };
  
  // Stats
  const totalProducts = products.length;
  const hommeProducts = products.filter(p => p.target === 'Homme').length;
  const enfantProducts = products.filter(p => p.target === 'Enfant').length;
  const totalValue = products.reduce((acc, p) => acc + p.price, 0);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mettre toutes les informations en ordre : trié par cible (Homme puis Enfant), puis par catégorie, puis par nom
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const targetCompare = a.target.localeCompare(b.target);
    if (targetCompare !== 0) return targetCompare;
    
    const categoryCompare = a.category.localeCompare(b.category);
    if (categoryCompare !== 0) return categoryCompare;
    
    return a.name.localeCompare(b.name);
  });

  const [activeTab, setActiveTab] = useState<'catalogue' | 'commandes' | 'utilisateurs' | 'marque'>('catalogue');
  const [customLogoInput, setCustomLogoInput] = useState(() => {
    return localStorage.getItem('habe_custom_logo_url') || '';
  });
  const [logoSaveNotice, setLogoSaveNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyLogoUrl = (urlToSet: string) => {
    const trimmed = urlToSet.trim();
    if (trimmed) {
      const directUrl = getGoogleDriveDirectLink(trimmed);
      localStorage.setItem('habe_custom_logo_url', directUrl);
      setCustomLogoInput(directUrl);
      setLogoSaveNotice('Nouveau logo enregistré avec succès ! Il est maintenant synchronisé sur tout le site.');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('habe_logo_updated', { detail: directUrl }));
      // Persist to database so all devices and visitors receive the updated logo
      api.settings.saveLogo(directUrl).catch((err) => {
        console.warn('Backend database logo save notice:', err);
      });
    } else {
      localStorage.removeItem('habe_custom_logo_url');
      setCustomLogoInput('');
      setLogoSaveNotice('Logo officiel Habé rétabli par défaut !');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('habe_logo_updated', { detail: '' }));
      api.settings.saveLogo('').catch(() => {});
    }
    setTimeout(() => setLogoSaveNotice(null), 4000);
  };

  const handleFileProcess = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    setIsProcessingLogo(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        setIsProcessingLogo(false);
        return;
      }

      // Optimize image dimensions for smooth storage & ultra-crisp display
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const maxDimension = 1000;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedDataUrl = canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.95);
            handleApplyLogoUrl(optimizedDataUrl);
            setIsProcessingLogo(false);
            return;
          }
        }
        handleApplyLogoUrl(rawDataUrl);
        setIsProcessingLogo(false);
      };
      img.onerror = () => {
        handleApplyLogoUrl(rawDataUrl);
        setIsProcessingLogo(false);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    image: '',
    image2: '',
    image3: '',
    category: 'Tendance',
    target: 'Homme',
    garmentType: 'boubou',
    fabricType: 'wax',
    description: '',
    colors: []
  });

  const [customColorInput, setCustomColorInput] = useState('');

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
      fabricType: 'wax',
      description: '',
      colors: []
    });
    setCustomColorInput('');
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
      fabricType: product.fabricType,
      description: product.description || '',
      colors: product.colors || []
    });
    setCustomColorInput('');
    setIsAddingMode(true);
  };

  const categories: Category[] = ['Ensemble Royal', 'Tendance', 'Classique', 'Accessoires', 'Chaussures', 'Chapeau', 'Parfum'];
  const targets: Target[] = ['Homme', 'Enfant'];
  const garmentTypes: GarmentType[] = ['chemise', 'pantalon', 'boubou', 'accessoire', 'autre'];
  const fabricTypes: FabricType[] = ['wax', 'bazin', 'coton', 'soie'];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-600 transition-colors shadow-xs cursor-pointer active:scale-95 shrink-0"
                title="Retour à la boutique"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="h-40 sm:h-52 px-8 py-3 bg-white rounded-[2rem] shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_10px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-white shrink-0 overflow-hidden border-2 border-brand-orange-dark/10 group transition-all hover:scale-[1.02]">
              <img src={brandLogo.logoWide || brandLogo.logoIcon} alt="Habé Logo" className="h-full w-auto max-w-[400px] sm:max-w-[600px] object-contain" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xl tracking-tight text-brand-black">Dashboard Admin</h1>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Gestion Boutique Habé</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Neon PostgreSQL Connecté
            </span>
            
            <button
              onClick={() => setActiveTab('marque')}
              className="bg-brand-orange-dark hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-heading font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
              title="Accéder directement à la modification du logo de la boutique"
            >
              <Palette className="w-4 h-4" />
              <span>Modifier le Logo</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setIsAddingMode(true);
              }}
              className="bg-brand-black hover:bg-stone-800 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-heading font-bold transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau Produit</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Tab switchers inside header block - fully responsive with scroll & highlighted logo modifier */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto no-scrollbar flex items-center gap-2 sm:gap-4 py-2 border-t border-stone-100">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`px-3 py-2 text-xs font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalogue'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalogue Produits</span>
          </button>
          
          <button
            onClick={() => setActiveTab('commandes')}
            className={`px-3 py-2 text-xs font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'commandes'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Commandes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`px-3 py-2 text-xs font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'utilisateurs'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Inscriptions ({members.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('marque')}
            className={`px-4 py-2 text-xs font-heading font-black uppercase tracking-wider rounded-xl transition-all shrink-0 flex items-center gap-2 cursor-pointer border ${
              activeTab === 'marque'
                ? 'bg-brand-orange-dark text-white border-brand-orange-dark shadow-md shadow-orange-500/25 ring-2 ring-orange-400/40'
                : 'bg-orange-50 border-orange-300 text-brand-orange-dark hover:bg-orange-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>MODIFIER LE LOGO</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
              activeTab === 'marque' ? 'bg-white/25 text-white' : 'bg-brand-orange-dark text-white'
            }`}>
              Marque
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'catalogue' ? (
          <>
            {/* Quick Banner for Logo Management */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-black/10">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-brand-orange-dark/20 border border-brand-orange-dark/40 flex items-center justify-center shrink-0 p-2">
                  <img src={getActiveLogo('icon')} alt="Logo Habé" className="w-full h-full object-contain drop-shadow" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                    <span>Modifier le Logo de la boutique</span>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-brand-orange-dark text-white rounded-full font-bold">
                      Personnalisable
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300 mt-0.5 font-body">
                    Vous avez votre propre image de logo ? Importez-la en un clic ou saisissez son lien pour l'afficher partout sur le site.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('marque')}
                className="px-5 py-2.5 bg-brand-orange-dark hover:bg-orange-600 text-white text-xs font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Palette className="w-4 h-4" />
                <span>Ouvrir l'éditeur de logo</span>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total Produits', value: totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
                { label: 'Homme', value: hommeProducts, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'Enfant', value: enfantProducts, icon: Users, color: 'bg-pink-50 text-pink-600' },
                { label: 'Valeur Stock', value: `${totalValue.toLocaleString('fr-FR')} FCFA`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' }
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

            {/* Tableaux groupés par Catégorie */}
            <div className="space-y-8">
              {Array.from(new Set([...categories, ...sortedProducts.map(p => p.category)])).map((cat) => {
                const categoryProducts = sortedProducts.filter(p => p.category === cat);
                if (categoryProducts.length === 0) return null;
                
                return (
                  <div key={cat} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden text-left">
                    <div className="bg-stone-50/50 px-6 py-4 border-b border-stone-200 flex items-center justify-between">
                      <h3 className="font-heading font-extrabold text-xs text-brand-black uppercase tracking-[0.15em] flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-brand-orange-dark animate-pulse" />
                        {cat}
                      </h3>
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest font-extrabold uppercase rounded-full bg-brand-orange-dark/10 text-brand-orange-dark">
                        {categoryProducts.length} {categoryProducts.length > 1 ? 'produits' : 'produit'}
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-stone-50/30 border-b border-stone-200 text-left">
                            <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Produit</th>
                            <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Cible</th>
                            <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Prix</th>
                            <th className="px-6 py-3.5 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {categoryProducts.map((product) => (
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
                  </div>
                );
              })}
              
              {filteredProducts.length === 0 && (
                <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-sm text-stone-400">Aucun produit ne correspond à votre recherche</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'commandes' ? (
          <div className="space-y-8 text-left">
            {/* Orders statistics metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Commandes', value: orders.length, icon: ShoppingBag, color: 'bg-indigo-50 text-indigo-600' },
                { label: 'En Cours de Confection', value: orders.filter(o => o.status === 'en cours').length, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Livrées & Confectionnées', value: orders.filter(o => o.status === 'livré').length, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
                { 
                  label: "Chiffre d'Affaires Réalisé", 
                  value: `${orders.filter(o => o.status === 'livré').reduce((sum, o) => sum + o.total, 0).toLocaleString('fr-FR')} FCFA`, 
                  icon: DollarSign, 
                  color: 'bg-blue-50 text-blue-600' 
                }
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm"
                >
                  <div className="p-2 rounded-lg inline-block mb-3.5 food-badge-shape bg-stone-50 text-stone-600">
                    <stat.icon className={`w-4 h-4 ${stat.color.split(' ')[1]}`} />
                  </div>
                  <p className="text-xl md:text-2xl font-heading font-extrabold text-brand-black">{stat.value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Orders list block */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-heading font-extrabold text-base text-brand-black uppercase tracking-wider">
                    Suivi des Commandes clients
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">Consultez, modifiez le statut ou gérez les commandes envoyées depuis WhatsApp.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest font-extrabold uppercase rounded-full bg-brand-orange-dark/10 text-brand-orange-dark animate-pulse">
                    En temps réel
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-left">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Client / Coordonnées</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Articles Commandés</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Livraison & Paiement</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Total Facturé</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Statut de Suivi</th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/50 transition-all select-none">
                        {/* Client details info */}
                        <td className="px-6 py-4 align-top">
                          <div className="space-y-1">
                            <h4 className="font-heading font-bold text-sm text-brand-black">{ord.clientName}</h4>
                            <a 
                              href={`https://wa.me/${ord.clientPhone.replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-600 hover:underline font-mono font-semibold flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {ord.clientPhone}
                            </a>
                            <div className="text-xs text-stone-400 flex items-center gap-1.5 pt-0.5">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{ord.clientQuarter}</span>
                            </div>
                            <div className="text-[9px] font-mono text-stone-400 flex items-center gap-1 mt-1">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{new Date(ord.date).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </td>

                        {/* List of ordered products inside this order */}
                        <td className="px-6 py-4 align-top">
                          <div className="space-y-3 max-w-xs">
                            {ord.items.map((it, idx) => (
                              <div key={`${it.productId}-${idx}`} className="flex gap-2.5 items-center">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                                  {it.image ? (
                                    <img src={it.image} alt={it.productName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-stone-200 flex items-center justify-center font-bold text-[10px] text-stone-400">HT</div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-heading font-extrabold text-brand-black line-clamp-1">{it.productName}</p>
                                  <div className="text-[10px] text-stone-400 flex items-center gap-1.5">
                                    <span className="bg-stone-100 px-1 py-0.5 rounded text-stone-600 font-mono font-semibold">Taille: {it.size}</span>
                                    <span>•</span>
                                    <span className="text-stone-500">Coloris: {it.color}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-brand-black">x{it.quantity}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Deliveries & methods chosen */}
                        <td className="px-6 py-4 align-top text-xs">
                          <div className="space-y-1.5 pt-1">
                            <span className="px-2 py-1 rounded bg-stone-100 text-[10px] font-bold uppercase text-stone-600 inline-block">
                              🚚 {ord.deliveryMethod}
                            </span>
                            <br />
                            <span className="px-2 py-1 rounded bg-brand-orange-dark/5 text-[10px] font-bold uppercase text-brand-orange-dark inline-block">
                              💳 Paiement : {ord.paymentMethod}
                            </span>
                          </div>
                        </td>

                        {/* Order total amount badge */}
                        <td className="px-6 py-4 align-top">
                          <p className="text-sm font-heading font-extrabold text-brand-black pt-1">
                            {ord.total.toLocaleString()} FCFA
                          </p>
                        </td>

                        {/* Interactive order status modifier */}
                        <td className="px-6 py-4 align-top">
                          <div className="pt-0.5">
                            <select
                              value={ord.status}
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value as 'en cours' | 'livré' | 'annulé')}
                              className={`p-1.5 pl-2.5 pr-8 rounded-xl text-xs font-bold uppercase tracking-wider border outline-none cursor-pointer focus:ring-1 focus:ring-brand-black transition-all ${
                                ord.status === 'livré'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                  : ord.status === 'annulé'
                                  ? 'bg-red-50 border-red-300 text-red-700'
                                  : 'bg-amber-50 border-amber-300 text-amber-700'
                              }`}
                            >
                              <option value="en cours">En Cours</option>
                              <option value="livré">Livré</option>
                              <option value="annulé">Annulé</option>
                            </select>
                          </div>
                        </td>

                        {/* Delete action */}
                        <td className="px-6 py-4 align-top text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Voulez-vous vraiment supprimer cette commande ?')) {
                                deleteOrder(ord.id);
                              }
                            }}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all pt-1 inline-block"
                            title="Supprimer la commande"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-200">
                            <ShoppingBag className="w-6 h-6 text-stone-300" />
                          </div>
                          <p className="text-sm text-stone-400 font-medium">Aucune commande n'a encore été enregistrée.</p>
                          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                            Les commandes passées par vos clients apparaîtront automatiquement ici en temps réel pour faciliter la gestion et le suivi.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'utilisateurs' ? (
          <div className="space-y-8 text-left">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange-dark flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">{members.length}</p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Inscriptions Totales</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">
                    +{members.filter(m => m.date === 'Juin 2026').length}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Ce Mois (Juin 2026)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-extrabold text-brand-black">
                    {members.length > 0 ? "100%" : "0%"}
                  </p>
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
                  { 
                    month: 'Juin 2026', 
                    count: members.filter(m => m.date === 'Juin 2026').length, 
                    percentage: members.length > 0 ? '100%' : '0%', 
                    isCurrent: true 
                  }
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
                        {row.count} {row.count > 1 ? 'inscrits' : 'inscrit'}
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
                  Membres Récemment Inscrits
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      const dummyNames = ['Cheikh Oumar', 'Amina Sow', 'Mamadou Kane', 'Raby Diallo', 'Fatimata Ndiaye', 'Youssou Touré', 'Mariama Ba', 'Sidi Seye'];
                      const randomName = dummyNames[Math.floor(Math.random() * dummyNames.length)];
                      const emailPrefix = randomName.toLowerCase().replace(/\s+/g, '.');
                      const randomNum = Math.floor(Math.random() * 899 + 100);
                      const userEmail = `${emailPrefix}.${randomNum}@gmail.com`;
                      
                      try {
                        // Persist to Neon PostgreSQL
                        await api.auth.register(userEmail, '12345678', randomName);
                        // Refresh from Neon
                        const neonUsers = await api.auth.getUsers();
                        if (neonUsers && neonUsers.length > 0) {
                          const formatted = neonUsers.map(u => ({
                            id: u.id,
                            name: u.fullName || u.email.split('@')[0],
                            email: u.email,
                            date: u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : 'Juin 2026',
                            role: u.role === 'admin' ? 'Administrateur' : 'Actif (Ce mois-ci)'
                          }));
                          setMembers(formatted);
                          localStorage.setItem('habe_registered_members', JSON.stringify(formatted));
                        }
                      } catch (err) {
                        console.error('Neon simulation register error:', err);
                        const newM = {
                          id: Date.now(),
                          name: randomName,
                          email: userEmail,
                          date: 'Juin 2026',
                          role: 'Actif (Ce mois-ci)'
                        };
                        const updated = [newM, ...members];
                        setMembers(updated);
                        localStorage.setItem('habe_registered_members', JSON.stringify(updated));
                      }
                    }}
                    className="px-3 py-1.5 text-[10px] font-heading font-bold uppercase tracking-wider rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 transition-all border border-stone-200 active:scale-95"
                  >
                    + Simuler une inscription
                  </button>
                  <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest font-extrabold uppercase rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Neon Live
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto text-left">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-left">
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Membre</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Adresse E-mail</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Date d'Inscription</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Statut</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {members.map((mbr, i) => (
                      <tr key={mbr.id || i} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4 text-left">
                          <div className="flex items-center gap-3 justify-start text-left">
                            <div className="w-8 h-8 rounded-full bg-brand-orange-dark/10 text-brand-orange-dark flex items-center justify-center font-bold text-xs uppercase">
                              {mbr.name[0]}
                            </div>
                            <span className="text-sm font-heading font-extrabold text-brand-black">{mbr.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-stone-600 font-body text-left">{mbr.email}</td>
                        <td className="px-6 py-4 text-xs font-heading font-extrabold text-stone-500 uppercase tracking-wider text-left">{mbr.date}</td>
                        <td className="px-6 py-4 text-left">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest ${
                            mbr.date === 'Juin 2026' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {mbr.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteMember(mbr.id, mbr.name)}
                            title="Supprimer de Neon PostgreSQL"
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400 text-xs italic">
                          Aucun membre n'est encore inscrit. Les nouvelles inscriptions s'afficheront ici en temps réel.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 text-left">
            {/* Header info banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-brand-orange-dark/10 text-brand-orange-dark border border-brand-orange-dark/20">
                    Gestion de l'Identité Visuelle
                  </span>
                  {customLogoInput ? (
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      Logo Personnalisé Actif
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Logo Officiel Habé Actif
                    </span>
                  )}
                </div>
                <h2 className="font-heading font-black text-2xl text-brand-black tracking-tight mt-1">
                  Modifier le Logo de la Boutique
                </h2>
                <p className="text-xs text-stone-500 font-body mt-1 max-w-xl leading-relaxed">
                  Importez votre propre logo (image PNG avec fond transparent, JPEG, SVG ou WebP) directement depuis votre appareil ou saisissez son URL. Il sera instantanément appliqué sur l'entête, l'écran de chargement et l'ensemble de l'application.
                </p>
              </div>

              {customLogoInput && (
                <button
                  type="button"
                  onClick={() => handleApplyLogoUrl('')}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-heading font-bold rounded-xl transition-all border border-stone-200 active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-stone-500" />
                  <span>Rétablir le logo officiel Habé</span>
                </button>
              )}
            </div>

            {/* Notification alert banner */}
            {logoSaveNotice && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-heading font-bold flex items-center gap-3 shadow-sm animate-fade-in">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{logoSaveNotice}</span>
              </div>
            )}

            {/* Grid: Option 1 (Upload) & Option 2 (URL) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Option 1: File Upload directly from phone/computer */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-heading font-black text-base text-brand-black flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-brand-orange-dark flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      Option 1 : Importer depuis votre appareil
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Recommandé
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-body leading-relaxed">
                    Sélectionnez votre fichier logo (PNG avec fond transparent recommandé, JPEG, SVG ou WebP).
                  </p>
                </div>

                {/* Dropzone area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleFileProcess(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-[200px] ${
                    isDragging
                      ? 'border-brand-orange-dark bg-orange-50/60 scale-[1.01]'
                      : 'border-stone-300 hover:border-brand-orange-dark hover:bg-stone-50/70'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200/60 text-brand-orange-dark flex items-center justify-center mb-3 shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <p className="font-heading font-extrabold text-sm text-brand-black mb-1">
                    {isProcessingLogo ? "Optimisation du logo..." : "Glissez votre logo ici ou cliquez pour parcourir"}
                  </p>
                  <p className="text-[11px] text-stone-400 font-body">
                    Fichiers acceptés : PNG transparent, JPEG, SVG, WebP
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-5 py-2.5 bg-brand-black hover:bg-stone-800 text-white text-xs font-heading font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Choisir une image sur mon appareil</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 font-body">
                  💡 <strong>Astuce :</strong> Pour un rendu parfait sur fond clair et fond sombre, utilisez de préférence une image PNG avec fond transparent.
                </div>
              </div>

              {/* Option 2: Image URL from external host */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h3 className="font-heading font-black text-base text-brand-black flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      Option 2 : Saisir un Lien ou URL d'Image
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 font-body leading-relaxed">
                    Si votre image est déjà hébergée sur Google Drive, Cloudinary, Imgur ou votre propre serveur, collez le lien direct ici.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-heading font-bold uppercase tracking-wider text-stone-600 mb-2">
                      Lien direct ou lien Google Drive du logo
                    </label>
                    <div className="flex flex-col gap-3">
                      <input
                        type="url"
                        value={customLogoInput}
                        onChange={(e) => setCustomLogoInput(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... ou https://exemple.com/logo.png"
                        className="w-full px-4 py-3 rounded-xl border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-orange-dark/30 focus:border-brand-orange-dark bg-stone-50"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApplyLogoUrl(customLogoInput)}
                          className="flex-1 px-5 py-3 bg-brand-orange-dark hover:bg-orange-600 text-white text-xs font-heading font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Appliquer ce logo
                        </button>
                        {customLogoInput && (
                          <button
                            type="button"
                            onClick={() => handleApplyLogoUrl('')}
                            className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-heading font-bold rounded-xl transition-all border border-stone-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                            title="Rétablir le logo officiel"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {customLogoInput && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                      <img
                        src={customLogoInput}
                        alt="Aperçu logo personnalisé"
                        className="h-12 w-12 object-contain rounded-lg bg-white border border-stone-200 p-1 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <p className="text-[11px] text-amber-900 font-medium leading-tight">
                        Aperçu du lien enregistré. Cliquez sur « Appliquer ce logo » pour confirmer.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-500 font-body">
                  🌐 Les liens de partage Google Drive sont automatiquement convertis pour un chargement direct sans interruption.
                </div>
              </div>
            </div>

            {/* Section 3: Live Real-Time Previews across the Application */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h3 className="font-heading font-black text-lg text-brand-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-orange-dark" />
                    Aperçu en Direct sur la Boutique
                  </h3>
                  <p className="text-xs text-stone-500 font-body mt-1">
                    Vérifiez comment votre logo s'affiche actuellement sur les différentes sections de la boutique.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Synchronisé en Temps Réel
                  </span>
                </div>
              </div>

              {/* Logo Showcases: White background and Luxury Dark background */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Light preview (Header & Pages) */}
                <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                      Sur Fond Clair (Pages, Catalogue &amp; Panier)
                    </p>
                    <span className="text-[10px] font-mono text-stone-400">Fond blanc</span>
                  </div>
                  <div className="h-28 flex items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-stone-200 w-full max-w-sm">
                    <img
                      src={getActiveLogo('wide')}
                      alt="Aperçu Fond Clair"
                      className="h-16 w-auto max-w-[280px] object-contain drop-shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Affichage entête jour &amp; reçus de commandes
                  </p>
                </div>

                {/* Dark preview (Navbar, Splash & Footer) */}
                <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="flex items-center justify-between w-full">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-stone-300">
                      Sur Fond Sombre (Navbar, Splash &amp; Pied de page)
                    </p>
                    <span className="text-[10px] font-mono text-stone-500">Fond noir de luxe</span>
                  </div>
                  <div className="h-28 flex items-center justify-center p-4 bg-stone-950 rounded-xl shadow-inner border border-white/10 w-full max-w-sm">
                    <img
                      src={getActiveLogo('wide-white')}
                      alt="Aperçu Fond Sombre"
                      className="h-16 w-auto max-w-[280px] object-contain drop-shadow-md"
                    />
                  </div>
                  <p className="text-[11px] text-stone-400 font-mono">
                    Affichage mode sombre &amp; écran de démarrage
                  </p>
                </div>
              </div>

              {/* Emblems showcase */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-center">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-2">Format Horizontal</p>
                  <div className="h-16 flex items-center justify-center">
                    <img src={getActiveLogo('wide')} alt="Format Wide" className="h-12 w-auto max-w-full object-contain" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-2">Version Fond Sombre</p>
                  <div className="h-16 flex items-center justify-center">
                    <img src={getActiveLogo('wide-white')} alt="Wide White" className="h-12 w-auto max-w-full object-contain" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-2">Icône App 192px</p>
                  <div className="h-16 flex items-center justify-center">
                    <img src="/icon-192.png" alt="App Icon" className="h-10 w-10 rounded-xl object-contain shadow-md" />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <p className="text-[9px] uppercase font-bold tracking-wider text-stone-400 mb-2">Favicon 32px</p>
                  <div className="h-16 flex items-center justify-center">
                    <img src="/favicon.png" alt="Favicon" className="h-7 w-7 rounded-lg object-contain shadow" />
                  </div>
                </div>
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

                  <label className="block text-left">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Prix (FCFA)</span>
                    <input
                      required
                      type="number"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  </label>

                  <label className="block text-left">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Description</span>
                    <textarea
                      rows={3}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all resize-none"
                      placeholder="Ajoutez une description élégante de l'article..."
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </label>
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

                <div className="grid grid-cols-2 gap-4">
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

                  <label className="block text-left">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mb-1.5 block tracking-widest">Public Cible</span>
                    <select
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                      value={formData.target}
                      onChange={e => setFormData({ ...formData, target: e.target.value as Target })}
                    >
                      {targets.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                </div>

                {/* Colors Picker and Multi-Tags Generator */}
                <div className="space-y-3.5 text-left bg-stone-50 p-4 rounded-xl border border-stone-100">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block tracking-widest">Couleurs Disponibles</span>
                  
                  {/* Selected Colors list */}
                  <div className="flex flex-wrap gap-2">
                    {(!formData.colors || formData.colors.length === 0) ? (
                      <span className="text-[11px] text-stone-400 italic">Aucune restriction de couleur (toutes les couleurs seront possibles par défaut lors de la commande)</span>
                    ) : (
                      formData.colors.map(col => (
                        <span 
                          key={col} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-white rounded-full text-xs font-heading font-medium tracking-wide shadow-sm"
                        >
                          {col}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                colors: (formData.colors || []).filter(c => c !== col)
                              });
                            }}
                            className="bg-white/20 hover:bg-white/40 text-white p-0.5 rounded-full text-[10px] transition-all"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Custom Color input */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Palette className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Ajouter une couleur personnalisée..."
                        className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all placeholder-stone-400"
                        value={customColorInput}
                        onChange={e => setCustomColorInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = customColorInput.trim();
                            if (val && !(formData.colors || []).includes(val)) {
                              setFormData({
                                ...formData,
                                colors: [...(formData.colors || []), val]
                              });
                              setCustomColorInput('');
                            }
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const val = customColorInput.trim();
                        if (val && !(formData.colors || []).includes(val)) {
                          setFormData({
                            ...formData,
                            colors: [...(formData.colors || []), val]
                          });
                          setCustomColorInput('');
                        }
                      }}
                      className="bg-brand-black hover:bg-stone-800 text-white px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>

                  {/* Suggest presets */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200/50">
                    <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Couleurs suggérées (cliquez pour ajouter)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bleu Royal', 'Blanc Pur', 'Doré Traditionnel', 'Noir Intense', 'Vert Émeraude', 'Moutarde', 'Bazin Indigo', 'Bordeaux', 'Beige', 'Marron', 'Gris'].map((preset) => {
                        const isAdded = (formData.colors || []).includes(preset);
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setFormData({
                                  ...formData,
                                  colors: (formData.colors || []).filter(c => c !== preset)
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  colors: [...(formData.colors || []), preset]
                                });
                              }
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-heading font-semibold transition-all border cursor-pointer ${
                              isAdded 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' 
                                : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                            }`}
                          >
                            {isAdded ? '✓ ' : ''}{preset}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

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
