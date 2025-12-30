import React, { useState } from 'react';
import { X, Loader2, Mail, Lock, User } from 'lucide-react';
import { signIn, signUp } from '../services/supabaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          onSuccess();
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onSuccess();
          onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
  };

  const switchMode = () => {
    resetForm();
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161A21] rounded-2xl border border-[#1E232B] w-full max-w-md relative">
        {/* Header */}
        <div className="p-6 border-b border-[#1E232B]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#7C828D] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-space text-white">
            {mode === 'signin' ? 'Welcome back' : 'Join Continuity'}
          </h2>
          <p className="text-[#7C828D] text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to access your reading history.'
              : 'Create an account to start your canon.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase block mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C828D]" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase block mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C828D]" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C828D]" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
                className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4FD1C5] text-black font-bold py-3 rounded-lg hover:bg-[#38B2AC] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-[#1E232B] text-center">
          <p className="text-[#7C828D] text-sm">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-[#4FD1C5] hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
