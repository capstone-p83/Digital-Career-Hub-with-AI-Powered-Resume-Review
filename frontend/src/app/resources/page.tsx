'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { RESOURCES } from '../../constants';
import { BookOpen, Play, FileText, Search, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

const ResourceHub = () => {
  const { language } = useAppContext();
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');

  const categories = ['all', 'resume', 'interview', 'networking', 'skills'];

  const filteredResources = RESOURCES.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                         r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-5 h-5" />;
      case 'video': return <Play className="w-5 h-5" />;
      case 'guide': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 mb-2">
            {language === 'en' ? 'Career Resources' : 'ক্যারিয়ার রিসোর্স'}
          </h1>
          <p className="text-zinc-600">
            {language === 'en' ? 'Everything you need to succeed in your job search.' : 'আপনার চাকরির সন্ধানে সফল হওয়ার জন্য প্রয়োজনীয় সবকিছু।'}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-xl w-full md:w-80 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
              activeCategory === cat 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-emerald-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredResources.map((res, i) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-lg transition-all group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {res.category}
                </span>
                <div className="text-zinc-400 group-hover:text-emerald-600 transition-colors">
                  {getIcon(res.type)}
                </div>
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {res.title}
              </h3>
              <p className="text-zinc-600 text-sm leading-relaxed mb-6">
                {res.description}
              </p>
              <a
                href={res.url}
                className="inline-flex items-center text-emerald-600 font-bold text-sm hover:underline"
              >
                Read More
                <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ResourceHub;
