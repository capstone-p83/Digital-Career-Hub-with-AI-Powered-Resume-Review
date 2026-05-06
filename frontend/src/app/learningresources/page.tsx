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
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type ResourceType = "article" | "resume";

type Article = {
  id: number;
  title: string;
  author: string;
  image_url: string | null;
  content_en: string;
  content_bn: string;
  article_url: string | null;
  created_by: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ResumeExample = {
  id: number;
  title: string;
  candidate_name: string;
  job_title: string;
  image_url: string | null;
  description: string | null;
  created_by: number;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ArticleForm = {
  title: string;
  author: string;
  image_url: string;
  content: string;
  article_url: string;
};

type ResumeForm = {
  title: string;
  candidate_name: string;
  job_title: string;
  image_url: string;
  description: string;
};

const emptyArticleForm: ArticleForm = {
  title: "",
  author: "",
  image_url: "",
  content: "",
  article_url: "",
};

const emptyResumeForm: ResumeForm = {
  title: "",
  candidate_name: "",
  job_title: "",
  image_url: "",
  description: "",
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

      if (!articlesRes.ok) throw new Error(articlesData.message || "Failed to fetch articles");
      if (!resumesRes.ok) throw new Error(resumesData.message || "Failed to fetch resumes");

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
    setArticleForm({
      title: article.title,
      author: article.author,
      image_url: article.image_url || "",
      content: article.content_en,
      article_url: article.article_url || "",
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
    setResumeForm({
      title: resume.title,
      candidate_name: resume.candidate_name,
      job_title: resume.job_title,
      image_url: resume.image_url || "",
      description: resume.description || "",
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
        if (!articleForm.title || !articleForm.author || !articleForm.content) {
          setPageError("Title, author and content are required.");
          return;
        }

        const isEditing = !!editingArticle;
        const url = isEditing
          ? `${API_BASE_URL}/learning-resources/${editingArticle.id}`
          : `${API_BASE_URL}/learning-resources`;

        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: articleForm.title,
            author: articleForm.author,
            image_url: articleForm.image_url || null,
            content_en: articleForm.content,
            content_bn: articleForm.content,
            article_url: articleForm.article_url || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save article");

        if (isEditing) {
          setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? data.article : a)));
          setPageSuccess("Article updated successfully");
        } else {
          setArticles((prev) => [data.article, ...prev]);
          setPageSuccess("Article created successfully");
        }
      }

      if (selectedType === "resume") {
        if (!resumeForm.title || !resumeForm.candidate_name || !resumeForm.job_title || !resumeForm.description) {
          setPageError("Title, candidate name, job title and description are required.");
          return;
        }

        const isEditing = !!editingResume;
        const url = isEditing
          ? `${API_BASE_URL}/learning-resources/resumes/${editingResume.id}`
          : `${API_BASE_URL}/learning-resources/resumes`;

        const res = await fetch(url, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: resumeForm.title,
            candidate_name: resumeForm.candidate_name,
            job_title: resumeForm.job_title,
            image_url: resumeForm.image_url || null,
            description: resumeForm.description,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to save resume example");

        if (isEditing) {
          setResumes((prev) => prev.map((r) => (r.id === editingResume.id ? data.resume : r)));
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
    const confirmed = window.confirm("Are you sure you want to delete this resume example?");
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t("mgmt.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">{t("mgmt.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            {t("mgmt.backToDashboard")}
          </Button>
          <Button variant="outline" onClick={fetchResources} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("mgmt.refresh")}
          </Button>
          <Button onClick={openTypeSelector}>
            <Plus className="w-4 h-4 mr-2" />
            {t("mgmt.newResource")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("mgmt.totalArticles")}</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{articles.length}</h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("mgmt.totalResumes")}</p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{resumes.length}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Selector */}
      {showTypeSelector && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("mgmt.createTitle")}</CardTitle>
              <button onClick={closeForm} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t("mgmt.createPrompt")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleTypeSelect("article")}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group"
              >
                <FileText className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">{t("mgmt.articles")}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("mgmt.articleDesc")}</p>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect("resume")}
                className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all group"
              >
                <FileText className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <p className="font-semibold text-slate-900 dark:text-white">{t("mgmt.resumes")}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t("mgmt.resumeDesc")}</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Article Form */}
      {showForm && selectedType === "article" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingArticle ? t("mgmt.editArticle") : t("mgmt.createArticle")}</CardTitle>
              <button onClick={closeForm} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pageError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("mgmt.title_field")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder={t("mgmt.title_field")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("mgmt.author")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={articleForm.author}
                  onChange={(e) => setArticleForm((p) => ({ ...p, author: e.target.value }))}
                  placeholder={t("mgmt.author")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.thumbnailUrl")}
              </label>
              <input
                type="text"
                value={articleForm.image_url}
                onChange={(e) => setArticleForm((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.externalUrl")}
              </label>
              <input
                type="text"
                value={articleForm.article_url}
                onChange={(e) => setArticleForm((p) => ({ ...p, article_url: e.target.value }))}
                placeholder="https://example.com/full-article"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
              <p className="text-xs text-slate-400 mt-1">{t("mgmt.externalUrlHint")}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.content")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={articleForm.content}
                onChange={(e) => setArticleForm((p) => ({ ...p, content: e.target.value }))}
                placeholder={t("mgmt.content")}
                rows={8}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeForm} disabled={submitting}>{t("mgmt.cancel")}</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? t("mgmt.saving") : editingArticle ? t("mgmt.updateArticle") : t("mgmt.createArticleBtn")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Form */}
      {showForm && selectedType === "resume" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingResume ? t("mgmt.editResume") : t("mgmt.uploadResume")}</CardTitle>
              <button onClick={closeForm} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pageError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                {pageError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("mgmt.title_field")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resumeForm.title}
                  onChange={(e) => setResumeForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder={t("mgmt.title_field")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t("mgmt.candidateName")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={resumeForm.candidate_name}
                  onChange={(e) => setResumeForm((p) => ({ ...p, candidate_name: e.target.value }))}
                  placeholder={t("mgmt.candidateName")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.jobTitle")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={resumeForm.job_title}
                onChange={(e) => setResumeForm((p) => ({ ...p, job_title: e.target.value }))}
                placeholder={t("mgmt.jobTitle")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.thumbnailUrl")}
              </label>
              <input
                type="text"
                value={resumeForm.image_url}
                onChange={(e) => setResumeForm((p) => ({ ...p, image_url: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t("mgmt.description")} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resumeForm.description}
                onChange={(e) => setResumeForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t("mgmt.description")}
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeForm} disabled={submitting}>{t("mgmt.cancel")}</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                <Save className="w-4 h-4 mr-2" />
                {submitting ? t("mgmt.saving") : editingResume ? t("mgmt.updateResume") : t("mgmt.createResumeBtn")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mgmt.articles")}</CardTitle>
          {!showForm && !showTypeSelector && pageError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {pageError}
            </div>
          )}
          {pageSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              {pageSuccess}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t("mgmt.loadingArticles")}
            </div>
          ) : articles.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t("mgmt.noArticles")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">{t("mgmt.id")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.title_field")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.author")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.thumbnailCol")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.externalUrlCol")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.createdAt")}</th>
                    <th className="px-4 py-3 font-medium text-right">{t("mgmt.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 text-slate-900 dark:text-white">{article.id}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{article.title}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{article.author}</td>
                      <td className="px-4 py-4">
                        {article.image_url ? (
                          <a href={article.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[120px]">
                            {t("mgmt.viewImage")}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">{t("mgmt.none")}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {article.article_url ? (
                          <a href={article.article_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[120px]">
                            {t("mgmt.viewArticle")}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">{t("mgmt.none")}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{new Date(article.created_at).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEditArticleForm(article)} className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30" title={t("mgmt.actions")}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteArticle(article.id)} disabled={deletingId === article.id} className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Examples List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("mgmt.resumes")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t("mgmt.loadingResumes")}
            </div>
          ) : resumes.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {t("mgmt.noResumes")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">{t("mgmt.id")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.title_field")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.candidateName")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.jobTitle")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.thumbnailCol")}</th>
                    <th className="px-4 py-3 font-medium">{t("mgmt.createdAt")}</th>
                    <th className="px-4 py-3 font-medium text-right">{t("mgmt.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {resumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-4 text-slate-900 dark:text-white">{resume.id}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{resume.title}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{resume.candidate_name}</td>
                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{resume.job_title}</td>
                      <td className="px-4 py-4">
                        {resume.image_url ? (
                          <a href={resume.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-xs truncate block max-w-[120px]">
                            {t("mgmt.viewImage")}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">{t("mgmt.none")}</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{new Date(resume.created_at).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={() => openEditResumeForm(resume)} className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteResume(resume.id)} disabled={deletingId === resume.id} className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}