import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface LoginScreenProps {
  onLogin: (email: string, username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
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
    }, 1000);
  };

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
          <h1 className="text-6xl font-display font-bold tracking-tighter mb-2 bg-gradient-to-r from-white via-primary to-secondary bg-clip-text text-transparent">LOCK IN</h1>
          <p className="text-secondary text-sm tracking-widest uppercase font-medium">No Distractions. Just Progress.</p>
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

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 text-primary placeholder:text-secondary focus:outline-none focus:border-accent transition-colors"
            />
            
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
              <span>{isLoginMode ? 'Log In' : 'Sign Up'}</span>
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
