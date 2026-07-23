import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { KeyRound, User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login(data.username, data.password);
      login(response.access_token);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        'Invalid credentials. Please verify username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-bg flex items-center justify-center px-6 relative">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-text-secondary hover:text-white transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-sans text-sm font-medium">Back to Portfolio</span>
      </Link>

      <div className="w-full max-w-md bg-navy-card border border-navy-card/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Soft background glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-cyan/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col items-center gap-2 mb-8 relative">
          <div className="w-12 h-12 bg-accent-blue/15 border border-accent-blue/30 rounded-xl flex items-center justify-center text-accent-blue mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Admin Console</h2>
          <p className="font-sans text-sm text-text-secondary text-center">
            Sign in to manage Sravan's portfolio databases
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-xs font-sans mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-bold text-text-secondary uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary/60" />
              <input
                type="text"
                {...register('username', { required: 'Username is required' })}
                className="w-full bg-navy-bg border border-navy-card/85 focus:border-accent-cyan hover:border-navy-card text-white pl-10 pr-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors duration-200"
                placeholder="Enter username"
              />
            </div>
            {errors.username && (
              <span className="text-red-400 text-[10px] font-sans">
                {errors.username.message as string}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-xs font-bold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-text-secondary/60" />
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full bg-navy-bg border border-navy-card/85 focus:border-accent-cyan hover:border-navy-card text-white pl-10 pr-4 py-2.5 rounded-lg text-sm font-sans focus:outline-none transition-colors duration-200"
                placeholder="Enter password"
              />
            </div>
            {errors.password && (
              <span className="text-red-400 text-[10px] font-sans">
                {errors.password.message as string}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-blue hover:bg-accent-blue/90 disabled:bg-accent-blue/50 text-white font-sans font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Login to Console</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
