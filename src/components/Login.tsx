import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Briefcase, Sparkles, Globe, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { login, signup, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = React.useState(true);
  const [showReset, setShowReset] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (showReset) {
        await resetPassword(email);
        setMessage('Password reset email sent! Check your inbox.');
        setTimeout(() => setShowReset(false), 3000);
      } else if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-slate-800 p-8 md:p-10 rounded-[32px] border border-slate-700 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-display font-black text-white tracking-tight uppercase">JobAI Japan</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">
              {showReset 
                ? 'Reset your secure connection.' 
                : isLogin 
                  ? 'Welcome back, professional.' 
                  : 'Start your Japanese career journey.'}
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold uppercase tracking-wider"
            >
              {message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && !showReset && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="田中 健太"
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {!showReset && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => {
                        setShowReset(true);
                        setError('');
                        setMessage('');
                      }}
                      className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
            >
              {loading 
                ? 'Processing...' 
                : showReset 
                  ? 'Send Reset Link' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-4">
            {showReset ? (
               <button 
               onClick={() => setShowReset(false)}
               className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
             >
               Back to Login
             </button>
            ) : (
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            )}
            <div className="flex gap-4">
              <FeatureIcon icon={Sparkles} />
              <FeatureIcon icon={Globe} />
              <FeatureIcon icon={LogIn} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FeatureIcon({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="p-2 bg-slate-700/50 rounded-xl border border-slate-700">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
    </div>
  );
}
