import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { signIn, signUp, resetPassword } from '../services/supabaseService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset to initialMode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setUsername('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email for a password reset link.');
        }
      } else if (mode === 'signup') {
        if (!username.trim()) {
          setError('Username is required');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Check your email to confirm your account!');
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
    setSuccess(null);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
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
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('signin')}
              className="flex items-center gap-1 text-[#7C828D] hover:text-white transition-colors text-sm mb-3"
            >
              <ArrowLeft size={16} />
              Back to sign in
            </button>
          )}
          <h2 className="text-2xl font-space text-white">
            {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Join Continuity' : 'Reset password'}
          </h2>
          <p className="text-[#7C828D] text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to access your reading history.'
              : mode === 'signup'
              ? 'Create an account to start your canon.'
              : "Enter your email and we'll send you a reset link."}
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

          {mode !== 'forgot' && (
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
          )}

          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-[#4FD1C5] text-sm hover:underline"
            >
              Forgot password?
            </button>
          )}

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {success && (
            <div className="bg-[#4FD1C5]/10 border border-[#4FD1C5]/30 rounded-lg p-4 text-center">
              <p className="text-[#4FD1C5] font-medium">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !!success}
            className="w-full bg-[#4FD1C5] text-black font-bold py-3 rounded-lg hover:bg-[#38B2AC] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : mode === 'signin' ? (
              'Sign In'
            ) : mode === 'signup' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Footer */}
        {mode !== 'forgot' && (
          <div className="p-6 border-t border-[#1E232B] text-center">
            <p className="text-[#7C828D] text-sm">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[#4FD1C5] hover:underline"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
