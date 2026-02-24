import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
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
          users[normalizedEmail] = { username: username.trim(), password };
          localStorage.setItem('lockin_auth_users', JSON.stringify(users));
          onLogin(normalizedEmail, username.trim());
        }
      }
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background space-y-10 p-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/5 rounded-xl blur-xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border-[1px] border-dashed border-white/30 rounded-lg"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-6 border-[2px] border-dotted border-white/50 rounded-lg"
          />
          <motion.div
            animate={{ scale: [0.8, 1, 0.8], rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 bg-white rounded-sm shadow-[0_0_40px_rgba(255,255,255,1)] flex items-center justify-center"
          >
            <div className="w-3 h-3 bg-black/80 rounded-sm" />
          </motion.div>
        </div>
        <div>
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5], y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-3xl font-display font-bold text-white mb-3 tracking-widest uppercase"
          >
            Syncing
          </motion.h2>
          <motion.p 
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="text-white/50 font-mono text-xs uppercase tracking-[0.3em]"
          >
            Establishing Connection...
          </motion.p>
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
          <p className="text-secondary text-sm tracking-widest uppercase font-medium">Enter The Zone. Just Progress.</p>
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
              placeholder="Email address"
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
                  placeholder="Username"
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
                placeholder="Password"
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
              <span>{isLoginMode ? 'Enter Zone' : 'Join Zone'}</span>
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
              {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
