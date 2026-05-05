"use client";

import { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
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

function scoreHeadline(score: number): string {
  if (score >= 85) return "Strong resume";
  if (score >= 70) return "Solid foundation";
  return "Room to grow";
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

export default function ResumeFeedbackPage() {
  const searchParams = useSearchParams();
  const requestedFeedbackId = searchParams.get("id");

  const { token, isAuthenticated } = useAuth();

  const [ready, setReady] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeReviewAnalysis | null>(null);
  const [history, setHistory] = useState<ResumeFeedbackHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [showFullJobDescription, setShowFullJobDescription] = useState(false);
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
            typeof data.message === "string"
              ? data.message
              : "Could not load feedback details."
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
        setError("Network error. Could not load feedback details.");
      }
    },
    [token]
  );

  async function handleDeleteFeedback(feedbackId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this feedback record?"
    );

    if (!confirmed) return;

    try {
      const res = await deleteResumeFeedbackById(feedbackId, token);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Failed to delete feedback.");
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
      setError("Network error. Could not delete feedback.");
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
        setError("Could not load resume feedback.");
      } finally {
        setReady(true);
      }
    }

    loadInitialData();
  }, [isAuthenticated, token, requestedFeedbackId, loadFeedbackDetail]);

  if (!ready) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4 text-slate-500 dark:text-slate-400">
        Loading results…
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-slate-50 dark:bg-slate-900 text-center">
        <p className="text-slate-700 dark:text-slate-300 mb-2 max-w-md">
          No review results found. Generate a review from the upload page first.
        </p>
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
        <Link href="/resume">
          <Button>Go to resume upload</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/resume">
            <Button
              variant="ghost"
              className="pl-0 hover:bg-transparent -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Upload
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Share to LinkedIn will be implemented later.")}
            >
              <Share2 className="mr-2 w-4 h-4" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => alert("Export PDF will be implemented later.")}
            >
              <Download className="mr-2 w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <History className="mr-2 w-5 h-5 text-blue-600" />
                Resume Feedback History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">No history found.</p>
              ) : (
                history.map((item) => {
                  const isActive = selectedId === item.feedback_id;

                  return (
                    <div
                      key={item.feedback_id}
                      className={`w-full rounded-xl border p-3 transition ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => loadFeedbackDetail(item.feedback_id)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                              {item.target_job_role}
                            </p>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {item.score}/100
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(item.created_at)}
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(item.feedback_id)}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Delete feedback"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="mr-2 w-5 h-5 text-blue-600" />
                  Target Position
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Target Job Role
                  </p>
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {analysis.target_job_role}
                  </p>
                </div>

                {analysis.target_job_description ? (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Target Job Description
                    </p>

                    <p
                      className={`text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line ${
                        showFullJobDescription ? "" : "line-clamp-3"
                      }`}
                    >
                      {analysis.target_job_description}
                    </p>

                    {analysis.target_job_description.length > 180 && (
                      <button
                        type="button"
                        onClick={() => setShowFullJobDescription((prev) => !prev)}
                        className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {showFullJobDescription ? "Show less" : "Show full description"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <p>
                      No detailed job description was provided. The analysis is based on common
                      industry requirements for this target role.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="col-span-1"
              >
                <Card className="h-full flex flex-col items-center justify-center py-10 text-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-950 border-blue-100 dark:border-blue-900/50">
                  <div className="relative">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={
                          2 * Math.PI * 56 * ((100 - analysis.score) / 100)
                        }
                        className="text-blue-600 drop-shadow-md"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                        {analysis.score}
                      </span>
                      <span className="text-xs text-slate-500 font-medium tracking-wide">
                        /100
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold mt-6 text-slate-900 dark:text-white">
                    {scoreHeadline(analysis.score)}
                  </h2>

                  <p className="text-sm text-slate-500 px-6 mt-2">
                    {analysis.summary}
                  </p>

                  <span
                    className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getConfidenceStyle(
                      analysis.confidence
                    )}`}
                  >
                    Confidence: {analysis.confidence}
                  </span>
                </Card>
              </motion.div>

              <div className="col-span-1 md:col-span-2 grid grid-rows-2 gap-6">
                <FeedbackListCard
                  title="Strengths"
                  icon={<CheckCircle2 className="mr-2 w-5 h-5" />}
                  titleClass="text-emerald-600 dark:text-emerald-500"
                  bulletClass="text-emerald-500"
                  items={analysis.strengths}
                />

                <FeedbackListCard
                  title="Areas for Improvement"
                  icon={<AlertCircle className="mr-2 w-5 h-5" />}
                  titleClass="text-red-600 dark:text-red-500"
                  bulletClass="text-red-500"
                  items={analysis.areas_for_improvement}
                />
              </div>
            </div>

            <Card className="border-amber-200 dark:border-amber-900/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-amber-700 dark:text-amber-400">
                  <Info className="mr-2 w-5 h-5" />
                  Evaluation Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    Evaluation Basis
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
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
                    <p className="font-medium text-slate-900 dark:text-white">
                      Missing Resume Sections
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {analysis.missing_resume_sections.map((item, i) => (
                        <span
                          key={`${item}-${i}`}
                          className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.missing_job_information && (
                  <WarningBox message="The job description is missing or limited, so the analysis may rely on general industry standards." />
                )}

                {analysis.impact_explanation && (
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Impact on Score
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      {analysis.impact_explanation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="h-full border-blue-200 dark:border-blue-900/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-400">
                      <Lightbulb className="mr-2 w-5 h-5" />
                      Actionable Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {analysis.actionable_suggestions.length === 0 ? (
                        <li className="text-sm text-slate-500">None listed.</li>
                      ) : (
                        analysis.actionable_suggestions.map((item, i) => (
                          <li
                            key={i}
                            className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30"
                          >
                            {item}
                          </li>
                        ))
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center">
                      <TrendingUp className="mr-2 w-5 h-5 text-purple-600" />
                      ATS Keyword Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm text-slate-500">
                      This section compares your resume skills with the target
                      job requirements.
                    </p>

                    <SkillGroup
                      title="Matched Skills"
                      description="Required or useful skills found in your resume."
                      items={analysis.matched_skills}
                      type="matched"
                    />

                    <SkillGroup
                      title="Missing Skills"
                      description="Important skills for this role that were not found."
                      items={analysis.missing_skills}
                      type="missing"
                    />

                    <SkillGroup
                      title="Extra Skills / Bonus"
                      description="Additional skills that may still support your application."
                      items={analysis.extra_skills}
                      type="extra"
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
}: {
  title: string;
  icon: React.ReactNode;
  titleClass: string;
  bulletClass: string;
  items: string[];
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className={`text-lg flex items-center ${titleClass}`}>
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-2">
            {items.length === 0 ? (
              <li className="text-sm text-slate-500">None listed.</li>
            ) : (
              items.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className={`${bulletClass} mr-2 mt-1`}>•</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {item}
                  </span>
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
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

function SkillGroup({
  title,
  description,
  items,
  type,
}: {
  title: string;
  description: string;
  items: string[];
  type: "matched" | "missing" | "extra";
}) {
  const styleMap = {
    matched:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    missing:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    extra:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  };

  return (
    <div>
      <div className="mb-2">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">None listed.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styleMap[type]}`}
            >
              {type === "matched" && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {type === "missing" && <X className="w-3 h-3 mr-1" />}
              {type === "extra" && <CalendarDays className="w-3 h-3 mr-1" />}
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}