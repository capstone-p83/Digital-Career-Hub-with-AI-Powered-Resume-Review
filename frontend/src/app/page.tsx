'use client';

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { ArrowRight, FileText, MessageCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

const LandingPage = () => {
  const { t } = useAppContext();

  const features = [
    {
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      title: 'AI Resume Review',
      description: 'Get detailed feedback on your resume structure, content, and impact.'
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-emerald-600" />,
      title: 'Career Chatbot',
      description: 'Ask questions about interview prep, job search strategies, and more.'
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      title: 'Bilingual Support',
      description: 'Access all features and resources in both English and Bangla.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl lg:text-7xl font-bold text-zinc-900 tracking-tight mb-6"
            >
              {t.hero.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-zinc-600 mb-10 leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link
                href="/review"
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                <span>{t.hero.cta}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/resources"
                className="bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-zinc-50 transition-all hover:text-emerald-600"
              >
                Browse Resources
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-emerald-200 transition-colors group"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-500 mb-2">10k+</div>
              <div className="text-zinc-400 text-sm uppercase tracking-widest">Resumes Reviewed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500 mb-2">95%</div>
              <div className="text-zinc-400 text-sm uppercase tracking-widest">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500 mb-2">24/7</div>
              <div className="text-zinc-400 text-sm uppercase tracking-widest">AI Support</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-500 mb-2">2</div>
              <div className="text-zinc-400 text-sm uppercase tracking-widest">Languages</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
