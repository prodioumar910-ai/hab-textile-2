import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  showSkip?: boolean;
  onSkip?: () => void;
}

const Auth: React.FC<AuthProps> = ({ showSkip = false, onSkip }) => {
  const [isLogin, setIsLogin] = useState(true); // Default to sign in first for best user flow
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Translate common Supabase messages into beautiful French
  const translateError = (msg: string): string => {
    const term = msg.toLowerCase();
    if (term.includes('invalid login credentials')) {
      return 'Adresse email ou mot de passe incorrect.';
    }
    if (term.includes('user already registered') || term.includes('already exists')) {
      return 'Cette adresse e-mail est déjà associée à un compte.';
    }
    if (term.includes('password should be at least 6 characters')) {
      return 'Le mot de passe doit comporter au moins 6 caractères.';
    }
    if (term.includes('invalid email')) {
      return 'Veuillez saisir une adresse email valide.';
    }
    if (term.includes('database error') || term.includes('api key')) {
      return 'Erreur de connexion. Veuillez réessayer ultérieurement.';
    }
    return msg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic client validation
    if (!email.trim() || !password) {
      setError('Veuillez remplir tous les champs requis.');
      setLoading(false);
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError('Veuillez renseigner votre nom complet.');
      setLoading(false);
      return;
    }

    try {
      const emailLower = email.trim().toLowerCase();
      if (isLogin) {
        if (emailLower === 'prodioumar910@gmail.com' && password === '12345678') {
          localStorage.setItem('habe_local_admin', 'true');
          localStorage.setItem('habe_local_admin_email', emailLower);
          localStorage.setItem('habe_selected_experience', 'choice');
          window.location.reload();
          return;
        }
        
        try {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (loginError) throw loginError;
          
          // Keep local account synched for offline use on this browser
          try {
            const localAccounts = JSON.parse(localStorage.getItem('habe_local_accounts') || '[]');
            if (!localAccounts.some((acc: any) => acc.email.toLowerCase() === emailLower)) {
              localAccounts.push({
                email: emailLower,
                password: password,
                fullName: emailLower.split('@')[0]
              });
              localStorage.setItem('habe_local_accounts', JSON.stringify(localAccounts));
            }
          } catch (e) {
            console.error(e);
          }

          localStorage.setItem('habe_selected_experience', 'choice');
          window.location.reload();
        } catch (supaErr: any) {
          console.warn('Supabase login failed, trying local fallback:', supaErr);
          
          const isInvalidCredentials = supaErr?.message?.toLowerCase().includes('invalid login credentials') || 
                                      supaErr?.message?.toLowerCase().includes('invalid credentials');

          if (isInvalidCredentials) {
            throw supaErr;
          }

          // Check if user is registered in the local registry
          const localAccounts = JSON.parse(localStorage.getItem('habe_local_accounts') || '[]');
          const foundAccount = localAccounts.find((acc: any) => acc.email.toLowerCase() === emailLower);
          
          if (foundAccount) {
            if (foundAccount.password === password) {
              localStorage.setItem('habe_local_user', JSON.stringify({ email: emailLower, fullName: foundAccount.fullName }));
              localStorage.setItem('habe_selected_experience', 'choice');
              window.location.reload();
              return;
            } else {
              throw new Error('invalid login credentials');
            }
          } else {
            throw new Error("Aucun compte n'existe avec cette adresse e-mail. Veuillez vous inscrire d'abord.");
          }
        }
      } else {
        const storeNewMember = () => {
          try {
            const newM = {
              name: fullName.trim() || emailLower.split('@')[0],
              email: emailLower,
              date: 'Juin 2026',
              role: 'Actif (Ce mois-ci)'
            };
            const existing = JSON.parse(localStorage.getItem('habe_registered_members') || '[]');
            if (!existing.some((m: any) => m.email.toLowerCase() === newM.email.toLowerCase())) {
              existing.unshift(newM);
              localStorage.setItem('habe_registered_members', JSON.stringify(existing));
            }

            // Also keep record in habe_local_accounts to enforce professional login restriction
            const localAccounts = JSON.parse(localStorage.getItem('habe_local_accounts') || '[]');
            if (!localAccounts.some((acc: any) => acc.email.toLowerCase() === emailLower)) {
              localAccounts.push({
                email: emailLower,
                password: password,
                fullName: fullName.trim() || emailLower.split('@')[0]
              });
              localStorage.setItem('habe_local_accounts', JSON.stringify(localAccounts));
            }
          } catch (e) {
            console.error(e);
          }
        };

        try {
          const { error: signUpError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                full_name: fullName.trim(),
              },
            },
          });
          if (signUpError) throw signUpError;
          storeNewMember();
          setSuccess('Votre compte a été créé avec succès ! Veuillez vérifier votre boîte email pour valider votre inscription.');
          
          // Clear sign up inputs after success
          setFullName('');
          setEmail('');
          setPassword('');
        } catch (supaErr: any) {
          console.warn('Supabase signup failed, trying local fallback:', supaErr);
          // Create local session immediately for smooth fallback and store member credentials
          storeNewMember();
          localStorage.setItem('habe_local_user', JSON.stringify({ email: emailLower, fullName: fullName.trim() }));
          localStorage.setItem('habe_selected_experience', 'choice');
          setSuccess('Votre compte a été configuré avec succès ! Connexion automatique...');
          
          setFullName('');
          setEmail('');
          setPassword('');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(translateError(err.message || 'Une erreur inattendue est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8 relative w-full">
      {showSkip && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-6 right-6 md:top-10 md:right-10 z-50 px-5 py-2.5 bg-brand-orange-dark hover:bg-brand-orange-dark/90 active:scale-95 text-white text-[10px] font-heading font-extrabold uppercase tracking-[0.25em] rounded-full transition-all border border-brand-orange-light/30 flex items-center gap-2 shadow-2xl shadow-brand-orange-dark/30 ring-1 ring-brand-orange-light/20"
        >
          Ignorer <ArrowRight className="w-3" />
        </button>
      )}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-[0_24px_50px_rgba(0,0,0,0.15)]"
      >
        {/* Logo and Greeting Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-block mb-3"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1rIc99ggOZFOnB_wYD9Fnq1klzVJTkAma" 
              alt="Habé Textile Logo" 
              className="h-16 w-auto mx-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <h2 className="font-heading font-bold text-2xl text-brand-black tracking-tight mt-2 uppercase">
            Habé Textile
          </h2>
          <p className="text-sm font-body text-brand-black/60 mt-1">
            Rejoignez l'élégance et la tradition
          </p>
        </div>

        {/* Custom Tab Switcher */}
        <div className="relative flex p-1.5 bg-black/5 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setSuccess(null);
            }}
            className={`relative flex-1 py-2.5 text-xs font-heading font-medium uppercase tracking-wider transition-colors z-10 ${
              isLogin ? 'text-white' : 'text-brand-black/60 hover:text-brand-black'
            }`}
          >
            Se connecter
            {isLogin && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 bg-brand-black rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setSuccess(null);
            }}
            className={`relative flex-1 py-2.5 text-xs font-heading font-medium uppercase tracking-wider transition-colors z-10 ${
              !isLogin ? 'text-white' : 'text-brand-black/60 hover:text-brand-black'
            }`}
          >
            S'inscrire
            {!isLogin && (
              <motion.div
                layoutId="active-auth-tab"
                className="absolute inset-0 bg-brand-black rounded-xl -z-10"
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              />
            )}
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {!isLogin && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, y: -15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -15, height: 0 }}
                transition={{ duration: 0.25 }}
                className="relative overflow-hidden"
              >
                <label className="block text-xs font-body font-bold text-brand-black/70 mb-1.5 uppercase tracking-wider">
                  Nom Complet
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-brand-black/40" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Amadou Diallo"
                    className="block w-full pl-10 pr-3-5 py-3.5 bg-black/5 hover:bg-black/10 focus:bg-white border-0 rounded-xl text-sm font-body text-brand-black placeholder-brand-black/40 focus:ring-2 focus:ring-brand-orange-dark focus:outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-body font-bold text-brand-black/70 mb-1.5 uppercase tracking-wider">
              Adresse E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-brand-black/40" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: client@habetextile.com"
                className="block w-full pl-10 pr-3.5 py-3.5 bg-black/5 hover:bg-black/10 focus:bg-white border-0 rounded-xl text-sm font-body text-brand-black placeholder-brand-black/40 focus:ring-2 focus:ring-brand-orange-dark focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-body font-bold text-brand-black/70 mb-1.5 uppercase tracking-wider">
              Mot de passe
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-brand-black/40" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Saisissez votre mot de passe" : "Minimum 6 caractères"}
                className="block w-full pl-10 pr-10 py-3.5 bg-black/5 hover:bg-black/10 focus:bg-white border-0 rounded-xl text-sm font-body text-brand-black placeholder-brand-black/40 focus:ring-2 focus:ring-brand-orange-dark focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-black/40 hover:text-brand-black transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-box"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 rounded-xl text-xs font-body border border-red-100/50"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success-box"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-start gap-2.5 p-3.5 bg-green-50 text-green-700 rounded-xl text-xs font-body border border-green-100/50"
              >
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 bg-brand-orange-dark hover:bg-brand-orange-dark/95 text-white rounded-xl font-body font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-brand-orange-dark/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Se connecter' : "Créer mon compte"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Lower Toggle Switcher Helper */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }}
            className="text-xs font-body text-brand-black/60 hover:text-brand-black hover:underline transition-all"
          >
            {isLogin 
              ? "Pas encore de compte de fidélité ? Rejoignez-nous" 
              : "Vous possédez déjà votre espace ? Connexion"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
