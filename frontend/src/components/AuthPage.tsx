'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, UserPlus, Mail, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const AuthPage = ({ mode }: { mode: 'login' | 'register' }) => {
  const { setUser } = useAppContext();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const loggedInUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };

    // Only save login state in React memory.
    // Do not save to localStorage/sessionStorage.
    // After closing/reopening or refreshing the app, user will be logged out.
    setUser(loggedInUser);

    router.push('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/15 via-blue-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden relative z-10">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-600/20">
              {mode === 'login' ? (
                <LogIn className="w-7 h-7" />
              ) : (
                <UserPlus className="w-7 h-7" />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
              {mode === 'login'
                ? 'Login to access your career hub'
                : 'Start your journey with CareerHub AI'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                    required
                  />
                  <LogIn className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white h-11 rounded-full font-semibold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 mt-2"
            >
              <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Link
                href={mode === 'login' ? '/register' : '/login'}
                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold underline-offset-4 hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;