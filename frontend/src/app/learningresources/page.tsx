"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  FileText,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const SUBCATEGORY_OPTIONS = [
  "IT",
  "Software Engineering",
  "Construction",
  "Hospitality",
  "Healthcare",
  "Finance",
  "Marketing",
  "Education",
  "Other",
];

type ResourceType = "article" | "resume";

type Article = {
  id: number;
  title: string;
  title_bn: string | null;
  author: string;
  image_url: string | null;
  content_en: string;
  content_bn: string;
  subcategory: string | null;
  created_by: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
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
  description: string | null;
  description_bn: string | null;
  subcategory: string | null;
  created_by: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ArticleForm = {
  title: string;
  title_bn: string;
  author: string;
  image_url: string;
  content_en: string;
  content_bn: string;
  subcategory: string;
  customSubcategory: string;
};

type ResumeForm = {
  title: string;
  title_bn: string;
  candidate_name: string;
  candidate_name_bn: string;
  job_title: string;
  job_title_bn: string;
  image_url: string;
  description: string;
  description_bn: string;
  subcategory: string;
  customSubcategory: string;
};

const emptyArticleForm: ArticleForm = {
  title: "",
  title_bn: "",
  author: "",
  image_url: "",
  content_en: "",
  content_bn: "",
  subcategory: "",
  customSubcategory: "",
};

const emptyResumeForm: ResumeForm = {
  title: "",
  title_bn: "",
  candidate_name: "",
  candidate_name_bn: "",
  job_title: "",
  job_title_bn: "",
  image_url: "",
  description: "",
  description_bn: "",
  subcategory: "",
  customSubcategory: "",
};

const getSubcategoryFormState = (subcategory: string | null) => {
  if (!subcategory) return { subcategory: "", customSubcategory: "" };
  if (SUBCATEGORY_OPTIONS.includes(subcategory) && subcategory !== "Other") {
    return { subcategory, customSubcategory: "" };
  }
  return { subcategory: "Other", customSubcategory: subcategory };
};

const resolveSubcategory = (sub: string, custom: string): string | null => {
  if (!sub) return null;
  if (sub === "Other") return custom.trim() || null;
  return sub;
};

export default function LearningResourcesPage() {
  const { token, isAuthenticated, isAdmin, isAdminStaff, isLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [resumes, setResumes] = useState<ResumeExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");

  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingResume, setEditingResume] = useState<ResumeExample | null>(null);

  const [articleForm, setArticleForm] = useState<ArticleForm>(emptyArticleForm);
  const [resumeForm, setResumeForm] = useState<ResumeForm>(emptyResumeForm);

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const isPrivileged = isAdmin || isAdminStaff;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (!isLoading && isAuthenticated && !isPrivileged) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, isPrivileged, router]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      const [articlesRes, resumesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/learning-resources`),
        fetch(`${API_BASE_URL}/learning-resources/resumes`),
      ]);

      const articlesData = await articlesRes.json();
      const resumesData = await resumesRes.json();

      if (!articlesRes.ok) {
        throw new Error(articlesData.message || "Failed to fetch articles");
      }

      if (!resumesRes.ok) {
        throw new Error(resumesData.message || "Failed to fetch resumes");
      }

      setArticles(articlesData.articles || []);
      setResumes(resumesData.resumes || []);
    } catch (err: any) {
      setPageError(err.message || "Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && isPrivileged) fetchResources();
    if (!isLoading && (!isAuthenticated || !isPrivileged)) setLoading(false);
  }, [isLoading, isAuthenticated, isPrivileged]);

  const openTypeSelector = () => {
    setShowTypeSelector(true);
    setShowForm(false);
    setEditingArticle(null);
    setEditingResume(null);
    setPageError("");
    setPageSuccess("");
  };

  const handleTypeSelect = (type: ResourceType) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    setArticleForm(emptyArticleForm);
    setResumeForm(emptyResumeForm);
    setShowForm(true);
  };

  const openEditArticleForm = (article: Article) => {
    setSelectedType("article");
    setEditingArticle(article);
    setEditingResume(null);

    const subState = getSubcategoryFormState(article.subcategory);

    setArticleForm({
      title: article.title,
      title_bn: article.title_bn || "",
      author: article.author,
      image_url: article.image_url || "",
      content_en: article.content_en || "",
      content_bn: article.content_bn || "",
      subcategory: subState.subcategory,
      customSubcategory: subState.customSubcategory,
    });

    setPageError("");
    setPageSuccess("");
    setShowTypeSelector(false);
    setShowForm(true);
  };

  const openEditResumeForm = (resume: ResumeExample) => {
    setSelectedType("resume");
    setEditingResume(resume);
    setEditingArticle(null);

    const subState = getSubcategoryFormState(resume.subcategory);

    setResumeForm({
      title: resume.title,
      title_bn: resume.title_bn || "",
      candidate_name: resume.candidate_name,
      candidate_name_bn: resume.candidate_name_bn || "",
      job_title: resume.job_title,
      job_title_bn: resume.job_title_bn || "",
      image_url: resume.image_url || "",
      description: resume.description || "",
      description_bn: resume.description_bn || "",
      subcategory: subState.subcategory,
      customSubcategory: subState.customSubcategory,
    });

    setPageError("");
    setPageSuccess("");
    setShowTypeSelector(false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setShowTypeSelector(false);
    setEditingArticle(null);
    setEditingResume(null);
    setSelectedType(null);
    setArticleForm(emptyArticleForm);
    setResumeForm(emptyResumeForm);
  };

  const handleSubmit = async () => {
    if (!token) return;

    try {
      setSubmitting(true);
      setPageError("");
      setPageSuccess("");

      if (selectedType === "article") {
        if (!articleForm.title || !articleForm.author || !articleForm.content_en) {
          setPageError("English title, author and English content are required.");
          return;
        }

        const finalSubcategory = resolveSubcategory(
          articleForm.subcategory,
          articleForm.customSubcategory
        );

        const isEditing = !!editingArticle;
        const url = isEditing
          ? `${API_BASE_URL}/learning-resources/${editingArticle.id}`
          : `${API_BASE_URL}/learning-resources`;

        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: articleForm.title,
            title_bn: articleForm.title_bn || articleForm.title,
            author: articleForm.author,
            image_url: articleForm.image_url || null,
            content_en: articleForm.content_en,
            content_bn: articleForm.content_bn || articleForm.content_en,
            subcategory: finalSubcategory,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save article");

        if (isEditing) {
          setArticles((prev) =>
            prev.map((a) => (a.id === editingArticle.id ? data.article : a))
          );
          setPageSuccess("Article updated successfully");
        } else {
          setArticles((prev) => [data.article, ...prev]);
          setPageSuccess("Article created successfully");
        }
      }

      if (selectedType === "resume") {
        if (
          !resumeForm.title ||
          !resumeForm.candidate_name ||
          !resumeForm.job_title ||
          !resumeForm.description
        ) {
          setPageError(
            "English title, candidate name, job title and description are required."
          );
          return;
        }

        const finalSubcategory = resolveSubcategory(
          resumeForm.subcategory,
          resumeForm.customSubcategory
        );

        const isEditing = !!editingResume;
        const url = isEditing
          ? `${API_BASE_URL}/learning-resources/resumes/${editingResume.id}`
          : `${API_BASE_URL}/learning-resources/resumes`;

        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: resumeForm.title,
            title_bn: resumeForm.title_bn || resumeForm.title,
            candidate_name: resumeForm.candidate_name,
            candidate_name_bn:
              resumeForm.candidate_name_bn || resumeForm.candidate_name,
            job_title: resumeForm.job_title,
            job_title_bn: resumeForm.job_title_bn || resumeForm.job_title,
            image_url: resumeForm.image_url || null,
            description: resumeForm.description,
            description_bn: resumeForm.description_bn || resumeForm.description,
            subcategory: finalSubcategory,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to save resume example");
        }

        if (isEditing) {
          setResumes((prev) =>
            prev.map((r) => (r.id === editingResume.id ? data.resume : r))
          );
          setPageSuccess("Resume example updated successfully");
        } else {
          setResumes((prev) => [data.resume, ...prev]);
          setPageSuccess("Resume example created successfully");
        }
      }

      closeForm();
    } catch (err: any) {
      setPageError(err.message || "Failed to save resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArticle = async (articleId: number) => {
    if (!token) return;
    const confirmed = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmed) return;

    try {
      setDeletingId(articleId);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(`${API_BASE_URL}/learning-resources/${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete resource");

      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      setPageSuccess("Article deleted successfully");
    } catch (err: any) {
      setPageError(err.message || "Failed to delete resource");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    if (!token) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this resume example?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(resumeId);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(`${API_BASE_URL}/learning-resources/resumes/${resumeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete resume example");

      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      setPageSuccess("Resume example deleted successfully");
    } catch (err: any) {
      setPageError(err.message || "Failed to delete resume example");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading || !isAuthenticated || !isPrivileged) return null;

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Staff & Admin Content Studio</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("mgmt.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t("mgmt.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full shadow-xs"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("mgmt.backToDashboard")}
          </Button>
          <Button
            variant="outline"
            className="rounded-full shadow-xs"
            onClick={fetchResources}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("mgmt.refresh")}
          </Button>
          <Button
            className="rounded-full shadow-md shadow-blue-500/20"
            onClick={openTypeSelector}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("mgmt.newResource")}
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 ring-4 ring-blue-50/50 dark:ring-blue-950/20">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("mgmt.totalArticles")}
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {articles.length}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-4 ring-emerald-50/50 dark:ring-emerald-950/20">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("mgmt.totalResumes")}
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {resumes.length}
              </h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Alerts */}
      {pageSuccess && !showForm && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{pageSuccess}</span>
        </div>
      )}
      {pageError && !showForm && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{pageError}</span>
        </div>
      )}

      {/* Type Selector Modal */}
      {showTypeSelector && (
        <Card className="rounded-3xl border-2 border-blue-500/30 bg-white/95 shadow-xl shadow-blue-500/10 backdrop-blur-xl dark:border-blue-500/30 dark:bg-slate-900/95 overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{t("mgmt.createTitle")}</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("mgmt.createPrompt")}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelect("article")}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 transition-all group active:scale-98"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform dark:bg-blue-900/40 dark:text-blue-400">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t("mgmt.articles")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("mgmt.articleDesc")}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("resume")}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 transition-all group active:scale-98"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform dark:bg-emerald-900/40 dark:text-emerald-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {t("mgmt.resumes")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("mgmt.resumeDesc")}
                  </p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && selectedType === "article" && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {editingArticle ? t("mgmt.editArticle") : t("mgmt.createArticle")}
              </CardTitle>
              <button
                onClick={closeForm}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {pageError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pageError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Title (English)"
                value={articleForm.title}
                onChange={(value) =>
                  setArticleForm((p) => ({ ...p, title: value }))
                }
                required
              />

              <TextInput
                label="Title (Bangla)"
                value={articleForm.title_bn}
                onChange={(value) =>
                  setArticleForm((p) => ({ ...p, title_bn: value }))
                }
              />
            </div>

            <TextInput
              label={t("mgmt.author")}
              value={articleForm.author}
              onChange={(value) =>
                setArticleForm((p) => ({ ...p, author: value }))
              }
              required
            />

            <SubcategoryInput
              value={articleForm.subcategory}
              customValue={articleForm.customSubcategory}
              onSubcategoryChange={(value) =>
                setArticleForm((p) => ({
                  ...p,
                  subcategory: value,
                  customSubcategory: "",
                }))
              }
              onCustomChange={(value) =>
                setArticleForm((p) => ({ ...p, customSubcategory: value }))
              }
            />

            <TextInput
              label={t("mgmt.thumbnailUrl")}
              value={articleForm.image_url}
              onChange={(value) =>
                setArticleForm((p) => ({ ...p, image_url: value }))
              }
              placeholder="https://example.com/image.jpg"
            />

            <TextareaInput
              label="Content (English)"
              value={articleForm.content_en}
              onChange={(value) =>
                setArticleForm((p) => ({ ...p, content_en: value }))
              }
              required
              rows={8}
            />

            <TextareaInput
              label="Content (Bangla)"
              value={articleForm.content_bn}
              onChange={(value) =>
                setArticleForm((p) => ({ ...p, content_bn: value }))
              }
              rows={8}
            />

            <FormActions
              submitting={submitting}
              onCancel={closeForm}
              submitLabel={
                editingArticle ? t("mgmt.updateArticle") : t("mgmt.createArticleBtn")
              }
              loadingLabel={t("mgmt.saving")}
              cancelLabel={t("mgmt.cancel")}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      )}

      {showForm && selectedType === "resume" && (
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-lg overflow-hidden">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">
                {editingResume ? t("mgmt.editResume") : t("mgmt.uploadResume")}
              </CardTitle>
              <button
                onClick={closeForm}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {pageError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pageError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Title (English)"
                value={resumeForm.title}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, title: value }))
                }
                required
              />

              <TextInput
                label="Title (Bangla)"
                value={resumeForm.title_bn}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, title_bn: value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Candidate Name (English)"
                value={resumeForm.candidate_name}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, candidate_name: value }))
                }
                required
              />

              <TextInput
                label="Candidate Name (Bangla)"
                value={resumeForm.candidate_name_bn}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, candidate_name_bn: value }))
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Job Title (English)"
                value={resumeForm.job_title}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, job_title: value }))
                }
                required
              />

              <TextInput
                label="Job Title (Bangla)"
                value={resumeForm.job_title_bn}
                onChange={(value) =>
                  setResumeForm((p) => ({ ...p, job_title_bn: value }))
                }
              />
            </div>

            <SubcategoryInput
              value={resumeForm.subcategory}
              customValue={resumeForm.customSubcategory}
              onSubcategoryChange={(value) =>
                setResumeForm((p) => ({
                  ...p,
                  subcategory: value,
                  customSubcategory: "",
                }))
              }
              onCustomChange={(value) =>
                setResumeForm((p) => ({ ...p, customSubcategory: value }))
              }
            />

            <TextInput
              label={t("mgmt.thumbnailUrl")}
              value={resumeForm.image_url}
              onChange={(value) =>
                setResumeForm((p) => ({ ...p, image_url: value }))
              }
              placeholder="https://example.com/thumbnail.jpg"
            />

            <TextareaInput
              label="Description (English)"
              value={resumeForm.description}
              onChange={(value) =>
                setResumeForm((p) => ({ ...p, description: value }))
              }
              required
              rows={4}
            />

            <TextareaInput
              label="Description (Bangla)"
              value={resumeForm.description_bn}
              onChange={(value) =>
                setResumeForm((p) => ({ ...p, description_bn: value }))
              }
              rows={4}
            />

            <FormActions
              submitting={submitting}
              onCancel={closeForm}
              submitLabel={
                editingResume ? t("mgmt.updateResume") : t("mgmt.createResumeBtn")
              }
              loadingLabel={t("mgmt.saving")}
              cancelLabel={t("mgmt.cancel")}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      )}

      <ResourceTableSection
        title={t("mgmt.articles")}
        loading={loading}
        loadingText={t("mgmt.loadingArticles")}
        emptyText={t("mgmt.noArticles")}
        headers={[
          t("mgmt.id"),
          t("mgmt.title_field"),
          "Bangla Title",
          t("mgmt.author"),
          "Subcategory",
          t("mgmt.thumbnailCol"),
          t("mgmt.createdAt"),
          t("mgmt.actions"),
        ]}
      >
        {articles.map((article) => (
          <tr
            key={article.id}
            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <td className="px-4 py-4 text-slate-900 dark:text-white">{article.id}</td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
              {article.title}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
              {article.title_bn || t("mgmt.none")}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
              {article.author}
            </td>
            <td className="px-4 py-4">
              <SubcategoryBadge subcategory={article.subcategory} noneText={t("mgmt.none")} />
            </td>
            <td className="px-4 py-4">
              <ImageLink url={article.image_url} viewText={t("mgmt.viewImage")} noneText={t("mgmt.none")} />
            </td>
            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
              {new Date(article.created_at).toLocaleString()}
            </td>
            <td className="px-4 py-4">
              <ActionButtons
                onEdit={() => openEditArticleForm(article)}
                onDelete={() => handleDeleteArticle(article.id)}
                deleting={deletingId === article.id}
              />
            </td>
          </tr>
        ))}
      </ResourceTableSection>

      <ResourceTableSection
        title={t("mgmt.resumes")}
        loading={loading}
        loadingText={t("mgmt.loadingResumes")}
        emptyText={t("mgmt.noResumes")}
        headers={[
          t("mgmt.id"),
          t("mgmt.title_field"),
          "Bangla Title",
          t("mgmt.candidateName"),
          "Bangla Candidate",
          t("mgmt.jobTitle"),
          "Bangla Job Title",
          "Subcategory",
          t("mgmt.thumbnailCol"),
          t("mgmt.createdAt"),
          t("mgmt.actions"),
        ]}
      >
        {resumes.map((resume) => (
          <tr
            key={resume.id}
            className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <td className="px-4 py-4 text-slate-900 dark:text-white">{resume.id}</td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
              {resume.title}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[180px] truncate">
              {resume.title_bn || t("mgmt.none")}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
              {resume.candidate_name}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
              {resume.candidate_name_bn || t("mgmt.none")}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
              {resume.job_title}
            </td>
            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
              {resume.job_title_bn || t("mgmt.none")}
            </td>
            <td className="px-4 py-4">
              <SubcategoryBadge subcategory={resume.subcategory} noneText={t("mgmt.none")} />
            </td>
            <td className="px-4 py-4">
              <ImageLink url={resume.image_url} viewText={t("mgmt.viewImage")} noneText={t("mgmt.none")} />
            </td>
            <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
              {new Date(resume.created_at).toLocaleString()}
            </td>
            <td className="px-4 py-4">
              <ActionButtons
                onEdit={() => openEditResumeForm(resume)}
                onDelete={() => handleDeleteResume(resume.id)}
                deleting={deletingId === resume.id}
              />
            </td>
          </tr>
        ))}
      </ResourceTableSection>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500"
      />
    </div>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        rows={rows}
        className="w-full rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500"
      />
    </div>
  );
}

function SubcategoryInput({
  value,
  customValue,
  onSubcategoryChange,
  onCustomChange,
}: {
  value: string;
  customValue: string;
  onSubcategoryChange: (value: string) => void;
  onCustomChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
        Subcategory
      </label>
      <select
        value={value}
        onChange={(e) => onSubcategoryChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500"
      >
        <option value="">Select a subcategory...</option>
        {SUBCATEGORY_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      {value === "Other" && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Enter custom subcategory"
          className="w-full mt-2.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-blue-500"
        />
      )}
    </div>
  );
}

function FormActions({
  submitting,
  onCancel,
  onSubmit,
  submitLabel,
  loadingLabel,
  cancelLabel,
}: {
  submitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loadingLabel: string;
  cancelLabel: string;
}) {
  return (
    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <Button
        variant="outline"
        className="rounded-full shadow-xs"
        onClick={onCancel}
        disabled={submitting}
      >
        {cancelLabel}
      </Button>
      <Button
        className="rounded-full shadow-md shadow-blue-500/20"
        onClick={onSubmit}
        disabled={submitting}
      >
        <Save className="w-4 h-4 mr-2" />
        {submitting ? loadingLabel : submitLabel}
      </Button>
    </div>
  );
}

function ResourceTableSection({
  title,
  loading,
  loadingText,
  emptyText,
  headers,
  children,
}: {
  title: string;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  headers: string[];
  children: React.ReactNode;
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;

  return (
    <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-sm text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
            <span>{loadingText}</span>
          </div>
        ) : !hasRows ? (
          <div className="text-center p-12 text-sm text-slate-500 dark:text-slate-400">
            {emptyText}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm text-left">
              <thead className="border-b border-slate-200/80 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-900/70">
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {headers.map((header, index) => (
                    <th
                      key={`${header}-${index}`}
                      className={`px-6 py-3.5 ${
                        index === headers.length - 1 ? "text-right" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {children}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SubcategoryBadge({
  subcategory,
  noneText,
}: {
  subcategory: string | null;
  noneText: string;
}) {
  if (!subcategory) {
    return <span className="text-slate-400 text-xs italic">{noneText}</span>;
  }

  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
      {subcategory}
    </span>
  );
}

function ImageLink({
  url,
  viewText,
  noneText,
}: {
  url: string | null;
  viewText: string;
  noneText: string;
}) {
  if (!url) {
    return <span className="text-slate-400 text-xs italic">{noneText}</span>;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
    >
      <span>{viewText}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

function ActionButtons({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center justify-center rounded-full p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
      >
        <Pencil className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="inline-flex items-center justify-center rounded-full p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
