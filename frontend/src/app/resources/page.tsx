"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Search, Bookmark, FileText } from "lucide-react";
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
  candidate_name: string;
  job_title: string;
  image_url: string | null;
  description: string;
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
            image_url: a.image_url,
            subcategory: a.subcategory,
          })
        );

        const resumeItems: ResourceItem[] = (resumesData.resumes || []).map(
          (r: ResumeExample) => ({
            id: `resume-${r.id}`,
            title: r.title,
            title_bn: null,
            category: "Resume Example" as const,
            content_en: r.description,
            content_bn: r.description,
            author: r.candidate_name,
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

    const matchesSearch =
      displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "articles" && res.category === "Article") ||
      (selectedCategory === "resumes" && res.category === "Resume Example");

    const matchesSubcategory =
      selectedSubcategory === "all" || res.subcategory === selectedSubcategory;

    return matchesSearch && matchesCategory && matchesSubcategory;
  });

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {t("resources.title")}
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t("resources.subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("resources.search")}
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((category) => (
            <Button
              key={category.key}
              variant={selectedCategory === category.key ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.key)}
              className="whitespace-nowrap h-10"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {SUBCATEGORIES.length > 1 && (
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
            {t("resources.filterBySubcategory")}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBCATEGORIES.map((sub) => (
              <Button
                key={sub}
                variant={selectedSubcategory === sub ? "default" : "outline"}
                onClick={() => setSelectedSubcategory(sub)}
                className="whitespace-nowrap h-9 text-sm"
                size="sm"
              >
                {sub === "all" ? t("resources.allSubcategories") : sub}
              </Button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-500">{t("resources.loading")}</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20 bg-red-50 dark:bg-red-950/20 rounded-xl border border-dashed border-red-300 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{t(error)}</p>
        </div>
      )}

      {!loading && !error && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, idx) => {
            const content =
              language === "bn" ? resource.content_bn : resource.content_en;

            const displayTitle =
              language === "bn" && resource.title_bn
                ? resource.title_bn
                : resource.title;

            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col hover:border-blue-300 dark:hover:border-blue-700 transition">
                  {resource.image_url && (
                    <div className="w-full h-40 overflow-hidden rounded-t-xl">
                      <img
                        src={resource.image_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                            resource.category === "Article"
                              ? "text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400"
                              : "text-emerald-600 bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400"
                          }`}
                        >
                          {resource.category === "Article"
                            ? t("resources.articles")
                            : t("resources.resumes")}
                        </span>

                        {resource.subcategory && (
                          <span className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                            {resource.subcategory}
                          </span>
                        )}
                      </div>

                      <button className="text-slate-400 hover:text-blue-600 transition">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    <CardTitle className="text-xl leading-snug">
                      {displayTitle}
                    </CardTitle>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {t("resources.by")} {resource.author}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                      {content}
                    </p>

                    <a
                      href={`/resources/${resource.id}`}
                      className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t("resources.viewFullResource")}
                    </a>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredResources.length === 0 && (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-4" />

          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
            {t("resources.noResults")}
          </h3>

          <p className="text-slate-500">{t("resources.noResultsHint")}</p>

          <Button
            variant="outline"
            className="mt-4"
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