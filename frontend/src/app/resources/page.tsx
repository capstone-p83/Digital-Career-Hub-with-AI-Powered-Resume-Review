"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Bookmark, FileText, ArrowRight, BookOpen, Sparkles, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type Article = {
  id: number;
  title: string;
  title_bn: string | null;
  author: string;
  image_url: string | null;
  content_en: string;
  content_bn: string;
  subcategory: string | null;
  created_at: string;
};

type ResumeExample = {
  id: number;
  title: string;
  title_bn: string | null;
  candidate_name: string;
  candidate_name_bn: string | null;
  job_title: string;
  job_title_bn: string | null;
  image_url: string | null;
  description: string;
  description_bn: string | null;
  subcategory: string | null;
  created_at: string;
};

type ResourceItem = {
  id: string;
  title: string;
  title_bn: string | null;
  category: "Article" | "Resume Example";
  content_en: string;
  content_bn: string;
  author: string;
  author_bn: string | null;
  job_title?: string;
  job_title_bn?: string | null;
  image_url: string | null;
  subcategory: string | null;
};

export default function ResourcesPage() {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const resourcesPerPage = 6;

  const CATEGORIES = [
    { key: "all", label: t("resources.all") },
    { key: "articles", label: t("resources.articles") },
    { key: "resumes", label: t("resources.resumes") },
  ];

  const SUBCATEGORIES = useMemo(() => {
    const unique = new Set<string>();
    resources.forEach((r) => {
      if (r.subcategory) unique.add(r.subcategory);
    });
    return ["all", ...Array.from(unique).sort()];
  }, [resources]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError("");

        const [articlesRes, resumesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/learning-resources`),
          fetch(`${API_BASE_URL}/learning-resources/resumes`),
        ]);

        const articlesData = await articlesRes.json();
        const resumesData = await resumesRes.json();

        const articleItems: ResourceItem[] = (articlesData.articles || []).map(
          (a: Article) => ({
            id: `article-${a.id}`,
            title: a.title,
            title_bn: a.title_bn,
            category: "Article" as const,
            content_en: a.content_en,
            content_bn: a.content_bn,
            author: a.author,
            author_bn: null,
            image_url: a.image_url,
            subcategory: a.subcategory,
          })
        );

        const resumeItems: ResourceItem[] = (resumesData.resumes || []).map(
          (r: ResumeExample) => ({
            id: `resume-${r.id}`,
            title: r.title,
            title_bn: r.title_bn || r.title,
            category: "Resume Example" as const,
            content_en: r.description,
            content_bn: r.description_bn || r.description,
            author: r.candidate_name,
            author_bn: r.candidate_name_bn || r.candidate_name,
            job_title: r.job_title,
            job_title_bn: r.job_title_bn || r.job_title,
            image_url: r.image_url,
            subcategory: r.subcategory,
          })
        );

        setResources([...articleItems, ...resumeItems]);
      } catch (err: any) {
        setError("resources.failedLoad");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources = resources.filter((res) => {
    const content = language === "bn" ? res.content_bn : res.content_en;
    const displayTitle =
      language === "bn" && res.title_bn ? res.title_bn : res.title;
    const displayAuthor =
      language === "bn" && res.author_bn ? res.author_bn : res.author;
    const displayJobTitle =
      language === "bn" && res.job_title_bn ? res.job_title_bn : res.job_title;

    const matchesSearch =
      displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      displayAuthor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (displayJobTitle || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "articles" && res.category === "Article") ||
      (selectedCategory === "resumes" && res.category === "Resume Example");

    const matchesSubcategory =
      selectedSubcategory === "all" || res.subcategory === selectedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });
       useEffect(() => {
       setCurrentPage(1);
       }, [searchTerm, selectedCategory, selectedSubcategory]);

    const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);
    const startIndex = (currentPage - 1) * resourcesPerPage;
    const endIndex = startIndex + resourcesPerPage;

const paginatedResources = filteredResources.slice(startIndex, endIndex);
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero Header */}
      <div className="relative mb-10 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {language === "bn" ? "শিক্ষার্থীদের ক্যারিয়ার লাইব্রেরি" : "Career Knowledge Base"}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t("resources.title")}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t("resources.subtitle")}
        </p>
      </div>

      {/* Search and Primary Category Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("resources.search")}
            className="pl-11 h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 items-center">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`whitespace-nowrap h-11 px-5 rounded-full text-xs font-semibold transition-all shadow-xs ${
                selectedCategory === category.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Pills */}
      {SUBCATEGORIES.length > 1 && (
        <div className="mb-10 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
            {t("resources.filterBySubcategory")}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedSubcategory === sub
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500"
                }`}
              >
                {sub === "all" ? t("resources.allSubcategories") : sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500 font-medium">{t("resources.loading")}</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-dashed border-red-200 dark:border-red-800/60">
          <p className="text-red-600 dark:text-red-400 font-medium">{t(error)}</p>
        </div>
      )}

      {!loading && !error && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedResources.map((resource, idx) => {
            const content =
              language === "bn" ? resource.content_bn : resource.content_en;

            const displayTitle =
              language === "bn" && resource.title_bn
                ? resource.title_bn
                : resource.title;

            const displayAuthor =
              language === "bn" && resource.author_bn
                ? resource.author_bn
                : resource.author;

            const displayJobTitle =
              language === "bn" && resource.job_title_bn
                ? resource.job_title_bn
                : resource.job_title;
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden group">
                  {resource.image_url && (
                    <div className="w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={resource.image_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${
                            resource.category === "Article"
                              ? "text-blue-700 bg-blue-50/80 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50"
                              : "text-emerald-700 bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
                          }`}
                        >
                          {resource.category === "Article"
                            ? t("resources.articles")
                            : t("resources.resumes")}
                        </span>

                        {resource.subcategory && (
                          <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {resource.subcategory}
                          </span>
                        )}
                      </div>

                      <button className="text-slate-400 hover:text-blue-600 transition-colors p-1" aria-label="Bookmark">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <CardTitle className="text-xl font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {displayTitle}
                    </CardTitle>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      {resource.category === "Resume Example" && displayJobTitle
                        ? `${displayAuthor} • ${displayJobTitle}`
                        : `${t("resources.by")} ${displayAuthor}`}
                    </p>
                  </CardHeader>

                  <CardContent className="p-6 pt-2 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {content}
                    </p>

                    <a
                      href={`/resources/${resource.id}`}
                      className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group/link"
                    >
                      <span>{t("resources.viewFullResource")}</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded-full px-4"
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index + 1}
              variant={currentPage === index + 1 ? "default" : "outline"}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-10 h-10 rounded-full p-0 ${
                currentPage === index + 1 ? "shadow-md shadow-blue-600/20" : ""
              }`}
            >
              {index + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="rounded-full px-4"
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredResources.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-4" />

          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("resources.noResults")}
          </h3>

          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{t("resources.noResultsHint")}</p>

          <Button
            variant="outline"
            className="mt-5 rounded-full px-6"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setSelectedSubcategory("all");
            }}
          >
            {t("resources.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}