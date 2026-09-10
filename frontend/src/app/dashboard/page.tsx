"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  FileText,
  ArrowRight,
  PlayCircle,
  Edit3,
  Shield,
  BookOpen,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  getLatestResumeFeedback,
  type ResumeReviewAnalysis,
  type ResumeReviewSuccessBody,
} from "../../lib/resumeReviewSubmit";

export default function Dashboard() {
  const { t } = useLanguage();

  const {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isAdminStaff,
    isLoading,
  } = useAuth();

  const router = useRouter();

  const [latestFeedback, setLatestFeedback] =
    useState<ResumeReviewAnalysis | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function loadLatestFeedback() {
      if (!isAuthenticated) return;

      try {
        const res = await getLatestResumeFeedback(token);

        if (!res.ok) {
          setLatestFeedback(null);
          return;
        }

        const data =
          (await res.json()) as ResumeReviewSuccessBody;

        if (data.status === "ok" && data.analysis) {
          setLatestFeedback(data.analysis);
        }
      } catch {
        setLatestFeedback(null);
      }
    }

    loadLatestFeedback();
  }, [isAuthenticated, token]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const isPrivileged =
    isAdmin || isAdminStaff;

  const displayName =
    user?.profile?.first_name?.trim() ||
    user?.email ||
    t("dashboard.user");

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-10 w-[500px] h-[300px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent dark:from-blue-900/10 dark:to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-blue-500/25 shrink-0">
            {displayName[0]?.toUpperCase() || "U"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t("dashboard.welcome")} {displayName}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                {user?.role || "Student"}
              </span>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/30"
              >
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                {t("dashboard.adminPanel")}
              </Button>
            </Link>
          )}

          {isPrivileged && (
            <Link href="/learningresources">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                {t("dashboard.learningResources")}
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              {t("dashboard.myProfile")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 rounded-3xl border border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-900 dark:to-slate-900/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("dashboard.adminAccessTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {t("dashboard.adminAccessDesc")}
              </p>
            </div>

            <Link href="/admin">
              <Button size="sm" className="rounded-full shrink-0 shadow-sm">
                {t("dashboard.openAdminPanel")}
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Learning Management Banner */}
      {isPrivileged && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-6 rounded-3xl border border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-slate-900 dark:to-slate-900/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t("dashboard.learningManagementTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {t("dashboard.learningManagementDesc")}
              </p>
            </div>

            <Link href="/learningresources">
              <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 shadow-sm">
                {t("dashboard.manageResources")}
                <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* Three Core Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Resume Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <Card className="h-full min-h-[330px] flex flex-col rounded-3xl border-blue-200/80 bg-gradient-to-b from-blue-50/50 via-white to-white dark:border-blue-900/50 dark:from-blue-950/20 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex-1 flex flex-col items-center text-center p-7">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 shadow-xs">
                <FileText className="w-7 h-7" />
              </div>

              <CardTitle className="text-lg font-bold mb-1">
                {t("dashboard.resumeScore")}
              </CardTitle>

              <CardDescription className="text-xs">
                {t("dashboard.basedOnLatestUpload")}
              </CardDescription>

              <div className="flex-1 flex flex-col items-center justify-center py-5">
                {latestFeedback ? (
                  <>
                    <div className="text-4xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                      {latestFeedback.score}
                      <span className="text-sm font-semibold text-blue-400 dark:text-blue-500">
                        /100
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2 line-clamp-1 max-w-[200px]">
                      {latestFeedback.target_job_role}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {t("dashboard.noScore")}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                      {t("dashboard.uploadResumeHint")}
                    </p>
                  </>
                )}
              </div>

              <div className="w-full mt-auto pt-2">
                {latestFeedback ? (
                  <Link
                    href={`/resume/feedback?id=${latestFeedback.feedback_id}`}
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/40"
                    >
                      {t("dashboard.viewFullReport")}
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href="/resume"
                    className="block w-full"
                  >
                    <Button
                      variant="gradient"
                      className="w-full rounded-full shadow-sm"
                    >
                      {t("dashboard.uploadResume")}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <Card className="h-full min-h-[330px] flex flex-col rounded-3xl border-purple-200/80 bg-gradient-to-b from-purple-50/50 via-white to-white dark:border-purple-900/50 dark:from-purple-950/20 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex-1 flex flex-col items-center text-center p-7">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 shadow-xs">
                <PlayCircle className="w-7 h-7" />
              </div>

              <CardTitle className="text-lg font-bold mb-1">
                {t("dashboard.interviewQuestions")}
              </CardTitle>

              <CardDescription className="text-xs">
                {t("dashboard.interviewQuestionsDesc")}
              </CardDescription>

              <div className="flex-1 flex flex-col items-center justify-center py-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  STAR Technique Ready
                </span>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                  Practice 3D flashcards or explore behavioral questions.
                </p>
              </div>

              <div className="w-full mt-auto pt-2">
                <Link
                  href="/learning"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-950/30"
                  >
                    {t("dashboard.startPractice")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cover Letter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <Card className="h-full min-h-[330px] flex flex-col rounded-3xl border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 via-white to-white dark:border-emerald-900/50 dark:from-emerald-950/20 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex-1 flex flex-col items-center text-center p-7">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <FileEdit className="w-7 h-7" />
              </div>

              <CardTitle className="text-lg font-bold mb-1">
                {t("dashboard.coverLetterTemplates")}
              </CardTitle>

              <CardDescription className="text-xs">
                {t("dashboard.coverLetterDesc")}
              </CardDescription>

              <div className="flex-1 flex flex-col items-center justify-center py-5">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Direct Word Export (.docx)
                </span>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                  Graduate, Professional & Career Change styles.
                </p>
              </div>

              <div className="w-full mt-auto pt-2">
                <Link
                  href="/cover-letter"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                  >
                    {t("dashboard.openTemplates")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Status Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <CardTitle className="text-base font-bold">
            {t("dashboard.accountStatus")}
          </CardTitle>
          <CardDescription className="text-xs">
            {t("dashboard.accountStatusDesc")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                {t("dashboard.role")}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white capitalize inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                {user?.role}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                {t("dashboard.status")}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${user?.is_active ? "bg-emerald-500" : "bg-rose-500"}`} />
                {user?.is_active
                  ? t("dashboard.active")
                  : t("dashboard.deactivated")}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                {t("dashboard.createdAt")}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}