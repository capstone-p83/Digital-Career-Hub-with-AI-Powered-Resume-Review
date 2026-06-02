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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-zinc-50">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-zinc-200 overflow-hidden">
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? (
                <LogIn className="w-8 h-8 text-emerald-600" />
              ) : (
                <UserPlus className="w-8 h-8 text-emerald-600" />
              )}
            </div>

            <h1 className="text-3xl font-bold text-zinc-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>

            <p className="text-zinc-500 mt-2">
              {mode === 'login'
                ? 'Login to access your career hub'
                : 'Start your journey with CareerHub AI'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-700">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                  <LogIn className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
            >
              <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Link
                href={mode === 'login' ? '/register' : '/login'}
                className="text-emerald-600 font-bold hover:underline"
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