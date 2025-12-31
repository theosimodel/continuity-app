import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';
import { updatePassword } from '../services/supabaseService';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#161A21] rounded-2xl border border-[#1E232B] w-full max-w-md p-8 text-center">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <h2 className="text-2xl font-space text-white mb-2">Password Updated</h2>
          <p className="text-[#7C828D]">Redirecting you to the app...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-[#161A21] rounded-2xl border border-[#1E232B] w-full max-w-md">
        <div className="p-6 border-b border-[#1E232B]">
          <h2 className="text-2xl font-space text-white">Set new password</h2>
          <p className="text-[#7C828D] text-sm mt-1">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase block mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C828D]" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase block mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C828D]" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
