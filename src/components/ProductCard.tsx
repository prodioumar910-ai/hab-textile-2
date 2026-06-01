import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Edit3, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Product, Category, Target, GarmentType, FabricType } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  isSharp?: boolean;
}

const categories: Category[] = ['Accessoires', 'Chaussures', 'Ensemble Royal', 'Tendance', 'Classique', 'Chapeau', 'Parfum'];
const targets: Target[] = ['Homme', 'Enfant'];
const garmentTypes: GarmentType[] = ['chemise', 'pantalon', 'boubou', 'accessoire', 'autre'];
const fabricTypes: FabricType[] = ['wax', 'bazin', 'coton', 'soie'];

const ProductCard: React.FC<ProductCardProps> = ({ product, isSharp = false }) => {
  const { toggleFavorite, favorites, addToCart, user, removeProduct, updateProduct, setSelectedProduct } = useStore();
  const isFavorite = favorites.includes(product.id);
  const isAdmin = user?.email?.toLowerCase() === 'prodimany@gmail.com' || user?.email?.toLowerCase() === 'prodioumar910@gmail.com';

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: product.name,
    price: product.price,
    image: product.image || '',
    image2: product.image2 || '',
    image3: product.image3 || '',
    category: product.category,
    target: product.target,
    garmentType: product.garmentType,
    fabricType: product.fabricType,
  });

  // Sync edit form with product changes or state activation
  useEffect(() => {
    if (isEditing) {
      setEditForm({
        name: product.name,
        price: product.price,
        image: product.image || '',
        image2: product.image2 || '',
        image3: product.image3 || '',
        category: product.category,
        target: product.target,
        garmentType: product.garmentType,
        fabricType: product.fabricType,
      });
    }
  }, [isEditing, product]);

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Voulez-vous vraiment supprimer "${product.name}" ?`)) {
      removeProduct(product.id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct: Product = {
      ...product,
      name: editForm.name,
      price: Number(editForm.price),
      category: editForm.category,
      target: editForm.target,
      garmentType: editForm.garmentType,
      fabricType: editForm.fabricType,
      image: getGoogleDriveDirectLink(editForm.image),
      image2: editForm.image2 ? getGoogleDriveDirectLink(editForm.image2) : '',
      image3: editForm.image3 ? getGoogleDriveDirectLink(editForm.image3) : '',
    };
    updateProduct(updatedProduct);
    setIsEditing(false);
  };

  return (
    <>
      <motion.div
        layout
        onClick={() => setSelectedProduct(product)}
        className="overflow-hidden group transform-gpu h-full flex flex-col justify-between cursor-pointer"
      >
        <div className="flex flex-col h-full">
          <div className={`relative aspect-[3/4] ${isSharp ? '' : 'rounded-lg'} overflow-hidden bg-gradient-to-b from-stone-900 to-stone-950 flex items-center justify-center border border-black/10`}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 text-center select-none">
                <span className="font-heading font-extrabold text-3xl tracking-widest text-amber-500/80 group-hover:scale-115 transition-transform duration-500">
                  HT
                </span>
                <span className="text-[8px] font-mono tracking-[0.25em] text-stone-400 mt-3 uppercase opacity-90">
                  Habé Textile
                </span>
                <div className="w-8 h-[1px] bg-amber-500/20 mt-3" />
              </div>
            )}

            {/* Admin Controls */}
            {isAdmin && (
              <div className="absolute top-2 left-2 flex gap-1.5 z-40">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg border border-amber-400/20 transition-all active:scale-90"
                  title="Modifier"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg border border-red-500/20 transition-all active:scale-90"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
            </button>
          </div>
          
          <div className="p-3 flex flex-col flex-grow justify-between">
            <div>
              <h3 className="font-body font-medium text-sm text-brand-black line-clamp-1 text-left">
                {product.name}
              </h3>
              <p className="font-heading font-bold text-lg text-brand-black mt-1 text-left">
                {product.price} FCFA
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className={`w-full mt-3 py-2 bg-white text-brand-black ${isSharp ? '' : 'rounded-lg'} font-body font-medium text-xs hover:bg-opacity-90 transition-all border border-stone-200 shadow-sm`}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </motion.div>



      {/* Elegant Edit Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-stone-100 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-lg bg-brand-orange-dark/10 flex items-center justify-center text-brand-orange-dark">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-brand-black">Modifier le Produit</h3>
                    <p className="text-[10px] font-mono tracking-widest text-stone-400 mt-0.5">{product.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-brand-black hover:bg-stone-50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
                {/* Name */}
                <div className="text-left">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Nom du modèle *</label>
                  <input
                    required
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    placeholder="Nom du vêtement..."
                  />
                </div>

                {/* Price */}
                <div className="text-left">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Prix (FCFA) *</label>
                  <input
                    required
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    placeholder="Ex: 85000"
                  />
                </div>

                {/* Target & Fabric */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Cible *</label>
                    <select
                      value={editForm.target}
                      onChange={e => setEditForm({ ...editForm, target: e.target.value as Target })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    >
                      {targets.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Type de Tissu *</label>
                    <select
                      value={editForm.fabricType}
                      onChange={e => setEditForm({ ...editForm, fabricType: e.target.value as FabricType })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    >
                      {fabricTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Garment type & Category */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Type de vêtement *</label>
                    <select
                      value={editForm.garmentType}
                      onChange={e => setEditForm({ ...editForm, garmentType: e.target.value as GarmentType })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    >
                      {garmentTypes.map(gt => <option key={gt} value={gt}>{gt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Catégorie *</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value as Category })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Google Drive links */}
                <div className="space-y-3 text-left">
                  <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-widest">Liens Images (Google Drive)</span>
                  
                  <div>
                    <span className="text-[10px] text-stone-500">Image Principale *</span>
                    <div className="relative mt-1">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        required
                        type="text"
                        value={editForm.image}
                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 text-xs focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        placeholder="Lien Google Drive partageable image 1"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500">Deuxième Image</span>
                    <div className="relative mt-1">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={editForm.image2}
                        onChange={e => setEditForm({ ...editForm, image2: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 text-xs focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        placeholder="Lien Google Drive partageable image 2"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500">Troisième Image</span>
                    <div className="relative mt-1">
                      <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        value={editForm.image3}
                        onChange={e => setEditForm({ ...editForm, image3: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 pl-10 text-xs focus:ring-2 focus:ring-brand-black/5 focus:border-brand-black outline-none transition-all"
                        placeholder="Lien Google Drive partageable image 3"
                      />
                    </div>
                  </div>
                </div>

                {/* Previews */}
                {(editForm.image || editForm.image2 || editForm.image3) && (
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {editForm.image && (
                      <div className="aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-200 relative">
                        <img src={getGoogleDriveDirectLink(editForm.image)} alt="Preview 1" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white">Img 1</span>
                      </div>
                    )}
                    {editForm.image2 && (
                      <div className="aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-200 relative">
                        <img src={getGoogleDriveDirectLink(editForm.image2)} alt="Preview 2" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white">Img 2</span>
                      </div>
                    )}
                    {editForm.image3 && (
                      <div className="aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-200 relative">
                        <img src={getGoogleDriveDirectLink(editForm.image3)} alt="Preview 3" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white">Img 3</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-stone-100 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-stone-500 transition-all active:scale-95"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all shadow-lg shadow-brand-orange-dark/20 active:scale-95"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;

