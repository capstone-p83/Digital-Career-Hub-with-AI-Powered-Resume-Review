"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Download,
  Share2,
  X,
  Info,
  Briefcase,
  CalendarDays,
  History,
  Trash2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import {
  RESUME_REVIEW_STORAGE_KEY,
  getResumeFeedbackById,
  getResumeFeedbackHistory,
  deleteResumeFeedbackById,
  type ResumeFeedbackHistoryItem,
  type ResumeFeedbackListBody,
  type ResumeReviewAnalysis,
  type ResumeReviewSuccessBody,
} from "../../../lib/resumeReviewSubmit";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isResumeReviewAnalysis(x: unknown): x is ResumeReviewAnalysis {
  if (!x || typeof x !== "object") return false;

  const o = x as Record<string, unknown>;

  return (
    typeof o.score === "number" &&
    typeof o.summary === "string" &&
    typeof o.target_job_role === "string" &&
    typeof o.confidence === "string" &&
    typeof o.evaluation_basis === "string" &&
    typeof o.missing_job_information === "boolean" &&
    typeof o.impact_explanation === "string" &&
    isStringArray(o.missing_resume_sections) &&
    isStringArray(o.strengths) &&
    isStringArray(o.areas_for_improvement) &&
    isStringArray(o.actionable_suggestions) &&
    isStringArray(o.matched_skills) &&
    isStringArray(o.missing_skills) &&
    isStringArray(o.extra_skills)
  );
}

function getConfidenceStyle(confidence: string): string {
  const value = confidence.toLowerCase();

  if (value === "high") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
  }

  if (value === "medium") {
    return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
  }

  return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

function ResumeFeedbackContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const requestedFeedbackId = searchParams.get("id");

  const { token, isAuthenticated, user } = useAuth();

  // Only admin can delete feedback history from the UI.
  const isAdminUser = (user as any)?.role === "admin";

  const [ready, setReady] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeReviewAnalysis | null>(null);
  const [history, setHistory] = useState<ResumeFeedbackHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showFullJobDescription, setShowFullJobDescription] = useState(false);

  const scoreHeadline = (score: number): string => {
    if (score >= 85) return t("feedback.strongResume");
    if (score >= 70) return t("feedback.solidFoundation");
    return t("feedback.roomToGrow");
  };
  const loadFeedbackDetail = useCallback(
    async (feedbackId: number) => {
      try {
        setError("");

        const res = await getResumeFeedbackById(feedbackId, token);
        const data = (await res.json().catch(() => ({}))) as
          | ResumeReviewSuccessBody
          | { message?: string };

          if (!res.ok || !("analysis" in data)) {
            setError(
              "message" in data && typeof data.message === "string"
                ? data.message
                : t("feedback.couldNotLoadDetails")
            );
            return;
          }

        if (isResumeReviewAnalysis(data.analysis)) {
          setAnalysis(data.analysis);
          setSelectedId(data.analysis.feedback_id ?? feedbackId);
          sessionStorage.setItem(
            RESUME_REVIEW_STORAGE_KEY,
            JSON.stringify(data.analysis)
          );
        }

        setShowFullJobDescription(false);
      } catch {
        setError(t("feedback.networkLoadError"));
      }
    },
    [token, t]
  );

  async function handleDeleteFeedback(feedbackId: number) {
    if (!isAdminUser) {
      setError(t("feedback.onlyAdminCanDelete"));
      return;
    }

    const confirmed = window.confirm(t("feedback.confirmDelete"));

    if (!confirmed) return;

    try {
      const res = await deleteResumeFeedbackById(feedbackId, token);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || t("feedback.failedDelete"));
        return;
      }

      const updatedHistory = history.filter(
        (item) => item.feedback_id !== feedbackId
      );

      setHistory(updatedHistory);

      if (selectedId === feedbackId) {
        const nextItem = updatedHistory[0];

        if (nextItem) {
          await loadFeedbackDetail(nextItem.feedback_id);
        } else {
          setAnalysis(null);
          setSelectedId(null);
          sessionStorage.removeItem(RESUME_REVIEW_STORAGE_KEY);
        }
      }
    } catch {
      setError(t("feedback.networkDeleteError"));
    }
  }

  useEffect(() => {
    async function loadInitialData() {
      if (!isAuthenticated) {
        setReady(true);
        return;
      }

      try {
        setError("");

        const historyRes = await getResumeFeedbackHistory(token);
        const historyData = (await historyRes.json().catch(() => ({}))) as
          | ResumeFeedbackListBody
          | { message?: string };

        if (historyRes.ok && "feedbacks" in historyData) {
          setHistory(historyData.feedbacks);

          const idFromUrl = requestedFeedbackId
            ? Number(requestedFeedbackId)
            : null;

          const targetId =
            idFromUrl && Number.isInteger(idFromUrl)
              ? idFromUrl
              : historyData.feedbacks[0]?.feedback_id;

          if (targetId) {
            await loadFeedbackDetail(targetId);
            return;
          }
        }

        const raw = sessionStorage.getItem(RESUME_REVIEW_STORAGE_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (isResumeReviewAnalysis(parsed)) {
            setAnalysis(parsed);
            setSelectedId(parsed.feedback_id ?? null);
          }
        }
      } catch {
        setError(t("feedback.couldNotLoadFeedback"));
      } finally {
        setReady(true);
      }
    }

    loadInitialData();
  }, [isAuthenticated, token, requestedFeedbackId, loadFeedbackDetail, t]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4 text-slate-500 dark:text-slate-400">
        {t("feedback.loadingResults")}
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-slate-50 dark:bg-slate-900 text-center">
        <p className="text-slate-700 dark:text-slate-300 mb-2 max-w-md">
          {t("feedback.noResults")}
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Link href="/resume">
          <Button>{t("feedback.goToUpload")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient gradient glow */}
      <div className="absolute top-10 left-1/3 w-[600px] h-[350px] bg-gradient-to-b from-blue-100/40 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <Link href="/resume">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white"
            >
              <ArrowLeft className="mr-1.5 w-4 h-4" />
              {t("feedback.backToUpload")}
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => alert(t("feedback.shareLater"))}
            >
              <Share2 className="mr-1.5 w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {t("feedback.share")}
            </Button>
            <Button
              variant="gradient"
              size="sm"
              className="rounded-full shadow-sm"
              onClick={() => alert(t("feedback.exportLater"))}
            >
              <Download className="mr-1.5 w-3.5 h-3.5" />
              {t("feedback.exportPdf")}
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[310px_1fr] gap-6 items-start">
          {/* History Sidebar */}
          <Card className="h-fit rounded-3xl border-slate-200/80 dark:border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <CardTitle className="text-base font-bold flex items-center text-slate-900 dark:text-white">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">
                  <History className="w-4 h-4" />
                </div>
                {t("feedback.historyTitle")}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-4 max-h-[580px] overflow-y-auto">
              {history.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400">
                    {t("feedback.noHistory")}
                  </p>
                </div>
              ) : (
                history.map((item) => {
                  const isActive = selectedId === item.feedback_id;

                  return (
                    <div
                      key={item.feedback_id}
                      className={`w-full rounded-2xl border p-3.5 transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50/80 dark:border-blue-700 dark:bg-blue-950/40 shadow-xs"
                          : "border-slate-200/70 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => loadFeedbackDetail(item.feedback_id)}
                          className="flex-1 text-left cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {item.target_job_role}
                            </p>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                              {item.score}%
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {formatDate(item.created_at)}
                          </p>
                        </button>

                        {isAdminUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(item.feedback_id)}
                            className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition cursor-pointer"
                            title={t("feedback.deleteFeedback")}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Main Feedback Content */}
          <div className="space-y-6">
            {/* Target Role Card */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center text-slate-900 dark:text-white">
                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center mr-2 text-blue-600 dark:text-blue-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    {t("feedback.targetPosition")}
                  </CardTitle>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    ESCO Occupations Framework
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {t("feedback.targetJobRole")}
                  </p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {analysis.target_job_role}
                  </p>
                </div>

                {analysis.target_job_description ? (
                  <div className="pt-1">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      {t("feedback.targetJobDescription")}
                    </p>

                    <p
                      className={`text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line mt-1 leading-relaxed ${
                        showFullJobDescription ? "" : "line-clamp-3"
                      }`}
                    >
                      {analysis.target_job_description}
                    </p>

                    {analysis.target_job_description.length > 180 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowFullJobDescription((prev) => !prev)
                        }
                        className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
                      >
                        {showFullJobDescription
                          ? t("feedback.showLess")
                          : t("feedback.showFullDescription")}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                    <p>{t("feedback.noJobDescription")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scorecard and Strengths/Improvements Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Scorecard Hero */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-1 h-full"
              >
                <Card className="h-full rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 border-blue-200/70 dark:border-blue-900/40 shadow-sm relative overflow-hidden">
                  <div className="relative my-2">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-slate-100 dark:text-slate-800"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="60"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={
                          2 * Math.PI * 60 * ((100 - analysis.score) / 100)
                        }
                        className="text-blue-600 drop-shadow-md transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        {analysis.score}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                        / 100
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold mt-4 text-slate-900 dark:text-white">
                    {scoreHeadline(analysis.score)}
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 px-3 mt-2 leading-relaxed">
                    {analysis.summary}
                  </p>

                  <div className="mt-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getConfidenceStyle(
                        analysis.confidence
                      )}`}
                    >
                      {t("feedback.confidence")}: {analysis.confidence}
                    </span>
                  </div>
                </Card>
              </motion.div>

              {/* Strengths & Improvement Cards */}
              <div className="col-span-1 md:col-span-2 grid grid-rows-2 gap-6">
                <FeedbackListCard
                  title={t("feedback.strengths")}
                  icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  titleClass="text-emerald-700 dark:text-emerald-400"
                  bulletClass="text-emerald-500"
                  items={analysis.strengths}
                  emptyText={t("feedback.noneListed")}
                />

                <FeedbackListCard
                  title={t("feedback.areasForImprovement")}
                  icon={<AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                  titleClass="text-rose-700 dark:text-rose-400"
                  bulletClass="text-rose-500"
                  items={analysis.areas_for_improvement}
                  emptyText={t("feedback.noneListed")}
                />
              </div>
            </div>

            {/* Evaluation Notes Card */}
            <Card className="rounded-3xl border-amber-200/80 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10">
              <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-900/30">
                <CardTitle className="text-base font-bold flex items-center text-amber-800 dark:text-amber-400">
                  <Info className="mr-2 w-4 h-4 text-amber-600" />
                  {t("feedback.evaluationNotes")}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 space-y-3.5 text-sm">
                <div>
                  <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                    {t("feedback.evaluationBasis")}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {analysis.evaluation_basis}
                  </p>
                </div>

                {analysis.resume_text_truncated &&
                  analysis.resume_length_warning && (
                    <WarningBox message={analysis.resume_length_warning} />
                  )}

                {analysis.job_description_truncated &&
                  analysis.job_description_warning && (
                    <WarningBox message={analysis.job_description_warning} />
                  )}

                {analysis.missing_resume_sections.length > 0 && (
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                      {t("feedback.missingResumeSections")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_resume_sections.map((item, i) => (
                        <span
                          key={`${item}-${i}`}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missing_job_information && (
                  <WarningBox message={t("feedback.missingJobInfoWarning")} />
                )}

                {analysis.impact_explanation && (
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-1">
                      {t("feedback.impactOnScore")}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      {analysis.impact_explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions & Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Actionable Suggestions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="h-full"
              >
                <Card className="h-full rounded-3xl border-blue-200/80 dark:border-blue-900/50">
                  <CardHeader className="pb-3 border-b border-blue-100 dark:border-blue-900/40">
                    <CardTitle className="text-base font-bold flex items-center text-blue-700 dark:text-blue-400">
                      <Lightbulb className="mr-2 w-4 h-4" />
                      {t("feedback.actionableSuggestions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3">
                      {analysis.actionable_suggestions.length === 0 ? (
                        <li className="text-sm text-slate-500">
                          {t("feedback.noneListed")}
                        </li>
                      ) : (
                        analysis.actionable_suggestions.map((item, i) => (
                          <li
                            key={i}
                            className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl text-xs sm:text-sm text-blue-950 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30 leading-relaxed flex gap-2.5"
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ATS Keyword Analysis Bubbles */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="h-full"
              >
                <Card className="h-full rounded-3xl border-slate-200/80 dark:border-slate-800">
                  <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-base font-bold flex items-center text-slate-900 dark:text-white">
                      <TrendingUp className="mr-2 w-4 h-4 text-purple-600 dark:text-purple-400" />
                      {t("feedback.atsKeywordAnalysis")}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-5 pt-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {t("feedback.atsDescription")}
                    </p>

                    <SkillGroup
                      title={t("feedback.matchedSkills")}
                      description={t("feedback.matchedSkillsDesc")}
                      items={analysis.matched_skills}
                      type="matched"
                      emptyText={t("feedback.noneListed")}
                    />

                    <SkillGroup
                      title={t("feedback.missingSkills")}
                      description={t("feedback.missingSkillsDesc")}
                      items={analysis.missing_skills}
                      type="missing"
                      emptyText={t("feedback.noneListed")}
                    />

                    <SkillGroup
                      title={t("feedback.extraSkills")}
                      description={t("feedback.extraSkillsDesc")}
                      items={analysis.extra_skills}
                      type="extra"
                      emptyText={t("feedback.noneListed")}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackListCard({
  title,
  icon,
  titleClass,
  bulletClass,
  items,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  titleClass: string;
  bulletClass: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-full"
    >
      <Card className="h-full rounded-3xl border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className={`text-base font-bold flex items-center ${titleClass}`}>
            <span className="mr-2">{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          <ul className="space-y-2.5">
            {items.length === 0 ? (
              <li className="text-xs text-slate-400">{emptyText}</li>
            ) : (
              items.map((item, i) => (
                <li key={i} className="flex items-start text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className={`${bulletClass} mr-2 font-bold select-none`}>•</span>
                  <span>{item}</span>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function WarningBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/25 dark:text-amber-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
      <p>{message}</p>
    </div>
  );
}

function SkillGroup({
  title,
  description,
  items,
  type,
  emptyText,
}: {
  title: string;
  description: string;
  items: string[];
  type: "matched" | "missing" | "extra";
  emptyText: string;
}) {
  const styleMap = {
    matched:
      "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
    missing:
      "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
    extra:
      "bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60",
  };

  return (
    <div>
      <div className="mb-2.5">
        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          {title}
        </p>
        <p className="text-[11px] text-slate-400">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs hover:scale-105 transition-transform ${styleMap[type]}`}
            >
              {type === "matched" && <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />}
              {type === "missing" && <X className="w-3 h-3 mr-1 text-rose-600" />}
              {type === "extra" && <Sparkles className="w-3 h-3 mr-1 text-indigo-600" />}
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
export default function ResumeFeedbackPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ResumeFeedbackContent />
    </Suspense>
  );
}