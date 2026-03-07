import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { t } from '../utils/translations';

interface LoginScreenProps {
  onLogin: (email: string, username: string) => void;
  language: 'en' | 'id';
}

export default function LoginScreen({ onLogin, language }: LoginScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLoginMode && !username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const usersStr = localStorage.getItem('lockin_auth_users');
      const users = usersStr ? JSON.parse(usersStr) : {};
      
      const normalizedEmail = email.trim().toLowerCase();

      if (isLoginMode) {
        // Login
        if (users[normalizedEmail] && users[normalizedEmail].password === password) {
          onLogin(normalizedEmail, users[normalizedEmail].username);
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      } else {
        // Sign Up
        if (users[normalizedEmail]) {
          setError('Account with this email already exists');
          setIsLoading(false);
        } else {
          const userCount = Object.keys(users).length;
          const isOG = userCount < 100;
          
          users[normalizedEmail] = { username: username.trim(), password, isOG };
          localStorage.setItem('lockin_auth_users', JSON.stringify(users));
          onLogin(normalizedEmail, username.trim());
        }
      }
    }, 2500);
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
            className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
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
            ESTABLISHING CONNECTION...
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
      className="flex flex-col items-center justify-center h-full px-6 bg-background"
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <h1 className="text-7xl font-display font-black tracking-tighter mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">ZONE</h1>
          <p className="text-secondary text-sm tracking-widest uppercase font-medium">{t('login.subtitle', language)}</p>
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
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
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
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 pr-12 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {error && <p className="text-accent text-sm px-2">{error}</p>}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-primary text-background font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLoginMode ? t('login.enter', language) : t('login.join', language)}</span>
            )}
          </button>
          
          <div className="text-center pt-4">
            <button 
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              className="text-sm text-secondary hover:text-primary transition-colors"
            >
              {isLoginMode ? t('login.no_account', language) : t('login.has_account', language)}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
