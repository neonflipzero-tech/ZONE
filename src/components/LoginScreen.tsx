import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppState } from '../store';

import { t } from '../utils/translations';

interface LoginScreenProps {
  onLogin: (email: string, username: string) => void;
  language: 'en' | 'id';
}

const LoginScreen = ({ onLogin, language }: LoginScreenProps) => {
  const { loginWithGoogle } = useAppState();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      // Handle the case where the user closes the popup manually
      if (err.code === 'auth/popup-closed-by-user') {
        setIsGoogleLoading(false);
        return;
      }
      
      // Handle other common popup errors
      if (err.code === 'auth/cancelled-popup-request') {
        setIsGoogleLoading(false);
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        setError(language === 'id' 
          ? 'Domain ini belum diizinkan di Firebase Console. Silakan tambahkan domain Netlify Anda ke "Authorized Domains" di Firebase Authentication.'
          : 'This domain is not authorized in Firebase Console. Please add your Netlify domain to "Authorized Domains" in Firebase Authentication.');
        setIsGoogleLoading(false);
        return;
      }

      // Handle disallowed_useragent (WebView block)
      if (err.message?.includes('disallowed_useragent') || err.code === 'auth/web-storage-unsupported') {
        setError(language === 'id'
          ? 'Google memblokir login dari aplikasi ini. Silakan buka link aplikasi langsung di browser Chrome atau Safari Anda.'
          : 'Google blocks login from this app wrapper. Please open the app link directly in your Chrome or Safari browser.');
        setIsGoogleLoading(false);
        return;
      }

      setError(err.message || 'Google login failed');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError(t('login.error.fill_all', language));
      return;
    }

    if (!isLoginMode && !username.trim()) {
      setError(t('login.error.username', language));
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const usersStr = localStorage.getItem('lockin_auth_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      const normalizedEmail = email.trim().toLowerCase();

      if (isLoginMode) {
        // Login
        const isDevBypass = (normalizedEmail === 'zaiki' || normalizedEmail === 'zaikiwildan@gmail.com') && password === 'zaiki';
        
        if (isDevBypass) {
          // If dev bypass used, find or create the zaiki user
          const devEmail = 'zaikiwildan@gmail.com';
          if (!users[devEmail]) {
            users[devEmail] = { username: 'Zaiki', password: 'zaiki', isOG: true };
            localStorage.setItem('lockin_auth_users', JSON.stringify(users));
          }
          onLogin(devEmail, users[devEmail].username);
          return;
        }

        if (users[normalizedEmail] && users[normalizedEmail].password === password) {
          onLogin(normalizedEmail, users[normalizedEmail].username);
        } else {
          setError(t('login.error.invalid', language));
          setIsLoading(false);
        }
      } else {
        // Sign Up
        if (users[normalizedEmail]) {
          setError(t('login.error.exists', language));
          setIsLoading(false);
        } else {
          // Check if username is already taken
          const isUsernameTaken = Object.values(users).some(
            (u: any) => u.username.toLowerCase() === username.trim().toLowerCase()
          );
          if (isUsernameTaken) {
            setError(language === 'id' ? 'Username sudah digunakan' : 'Username is already taken');
            setIsLoading(false);
            return;
          }

          const userCount = Object.keys(users).length;
          const isOG = userCount < 100;
          
          users[normalizedEmail] = { username: username.trim(), password, isOG };
          localStorage.setItem('lockin_auth_users', JSON.stringify(users));
          onLogin(normalizedEmail, username.trim());
        }
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black space-y-10 p-6 text-center">
        {/* Bullseye Segmented Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
          />
          {/* Middle dashed ring (spins opposite) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-[3px] border-dashed border-white/40"
          />
          {/* Inner dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 rounded-full border-2 border-dashed border-white/60"
          />
          {/* Center pulsing core */}
          <motion.div
            animate={{ scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center space-y-3">
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-display font-black text-white tracking-[0.3em] ml-[0.3em]"
          >
            ZONE
          </motion.h2>
          <p className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] ml-[0.2em]">
            {t('login.establishing', language)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-6 bg-black"
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h1 className="text-7xl font-display font-black tracking-tighter mb-2 text-white">ZONE</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-medium">{t('login.subtitle', language)}</p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-sm space-y-4"
        >
          <div className="space-y-3">
            <input
              type="email"
              placeholder={t('login.email', language)}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
            />
            
            <AnimatePresence>
              {!isLoginMode && (
                <motion.input
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  type="text"
                  placeholder={t('login.username', language)}
                  value={username}
                  maxLength={15}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              )}
            </AnimatePresence>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t('login.password', language)}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 pr-12 text-white placeholder:text-zinc-500 focus:outline-none focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && <p className="text-rose-500 text-sm px-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:opacity-90 transition-all disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLoginMode ? t('login.enter', language) : t('login.join', language)}</span>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-zinc-500">{language === 'id' ? 'Atau lanjut dengan' : 'Or continue with'}</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading || isGoogleLoading}
            className="w-full bg-zinc-900 border border-zinc-800 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-all disabled:opacity-70"
          >
            {isGoogleLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Google</span>
              </>
            )}
          </button>
          
          <div className="text-center pt-4 space-y-4">
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors block w-full"
            >
              {isLoginMode ? t('login.no_account', language) : t('login.has_account', language)}
            </button>

            <button 
              onClick={() => {
                if (window.confirm(language === 'id' ? 'Hapus semua data lokal? Ini akan menghapus semua akun di perangkat ini.' : 'Reset all local data? This will delete all accounts on this device.')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-[10px] text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
            >
              {language === 'id' ? 'Reset Data Aplikasi' : 'Reset App Data'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(LoginScreen);
