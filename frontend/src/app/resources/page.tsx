"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, ExternalLink, Bookmark } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_RESOURCES = [
  { id: 1, title: "How to perfectly format your resume", category: "Resume Writing", content: "A deep dive into structure, fonts, and action verbs.", link: "#" },
  { id: 2, title: "Top 50 Behavioral Interview Questions", category: "Interview Prep", content: "Master the STAR method with these practice questions.", link: "#" },
  { id: 3, title: "Networking on LinkedIn in 2024", category: "Networking", content: "Tips and templates for cold outreach that gets replies.", link: "#" },
  { id: 4, title: "Building a Portfolio that stands out", category: "Skills", content: "What recruiters actually look for in your portfolio site.", link: "#" },
  { id: 5, title: "Navigating Tech Layoffs", category: "Job Search", content: "Strategies to stay resilient and find new opportunities.", link: "#" },
  { id: 6, title: "Negotiating your Salary", category: "Job Search", content: "A step-by-step guide to asking for what you're worth.", link: "#" },
];

const CATEGORIES = ["All", "Resume Writing", "Interview Prep", "Networking", "Skills", "Job Search"];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredResources = MOCK_RESOURCES.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Career Resource Hub
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Explore our curated collection of guides, templates, and advice to help you land your dream job.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search resources..." 
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap h-10"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Resource Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, idx) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 dark:bg-slate-800 dark:text-blue-400 px-2 py-1 rounded">
                      {resource.category}
                    </span>
                    <button className="text-slate-400 hover:text-blue-600 transition">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>
                  <CardTitle className="text-xl leading-snug">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {resource.content}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full justify-between hover:bg-blue-50 dark:hover:bg-slate-800 group text-blue-600 dark:text-blue-400">
                    Read Article
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-slate-500">Try adjusting your search or category filter.</p>
          <Button variant="outline" className="mt-4" onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
