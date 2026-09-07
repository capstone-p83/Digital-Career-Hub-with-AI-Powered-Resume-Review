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
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {t("dashboard.welcome")} {displayName}!
          </h1>

          <p className="text-slate-600 dark:text-slate-400">
            {t("dashboard.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                className="shrink-0"
              >
                <Shield className="w-4 h-4 mr-2" />
                {t("dashboard.adminPanel")}
              </Button>
            </Link>
          )}

          {isPrivileged && (
            <Link href="/learningresources">
              <Button
                variant="outline"
                className="shrink-0"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {t("dashboard.learningResources")}
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button
              variant="outline"
              className="shrink-0"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {t("dashboard.myProfile")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Banner */}
      {isAdmin && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Card className="border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t(
                    "dashboard.adminAccessTitle"
                  )}
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t(
                    "dashboard.adminAccessDesc"
                  )}
                </p>
              </div>

              <Link href="/admin">
                <Button>
                  {t(
                    "dashboard.openAdminPanel"
                  )}

                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Learning Management Banner */}
      {isPrivileged && (
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <Card className="border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {t(
                    "dashboard.learningManagementTitle"
                  )}
                </h2>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t(
                    "dashboard.learningManagementDesc"
                  )}
                </p>
              </div>

              <Link href="/learningresources">
                <Button>
                  {t(
                    "dashboard.manageResources"
                  )}

                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Three Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Resume Score */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="h-full"
        >
          <Card className="h-full min-h-[315px] flex flex-col border-blue-200 bg-blue-50/60 dark:border-blue-900/50 dark:bg-blue-950/20">
            <CardContent className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>

              <CardTitle className="text-xl mb-2">
                {t("dashboard.resumeScore")}
              </CardTitle>

              <CardDescription>
                {t(
                  "dashboard.basedOnLatestUpload"
                )}
              </CardDescription>

              <div className="flex-1 flex flex-col items-center justify-center py-4">
                {latestFeedback ? (
                  <>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {latestFeedback.score}
                      <span className="text-lg text-blue-400 dark:text-blue-500">
                        /100
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-1">
                      {
                        latestFeedback.target_job_role
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                      {t(
                        "dashboard.noScore"
                      )}
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {t(
                        "dashboard.uploadResumeHint"
                      )}
                    </p>
                  </>
                )}
              </div>

              <div className="w-full mt-auto">
                {latestFeedback ? (
                  <Link
                    href={`/resume/feedback?id=${latestFeedback.feedback_id}`}
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
                    >
                      {t(
                        "dashboard.viewFullReport"
                      )}
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href="/resume"
                    className="block w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/40"
                    >
                      {t(
                        "dashboard.uploadResume"
                      )}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interview Questions */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          className="h-full"
        >
          <Card className="h-full min-h-[315px] flex flex-col">
            <CardContent className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <PlayCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>

              <CardTitle className="text-xl mb-2">
                {t(
                  "dashboard.interviewQuestions"
                )}
              </CardTitle>

              <CardDescription>
                {t(
                  "dashboard.interviewQuestionsDesc"
                )}
              </CardDescription>

              <div className="flex-1" />

              <div className="w-full mt-auto">
                <Link
                  href="/learning"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/30"
                  >
                    {t(
                      "dashboard.startPractice"
                    )}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cover Letter */}
        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          className="h-full"
        >
          <Card className="h-full min-h-[315px] flex flex-col">
            <CardContent className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <FileEdit className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>

              <CardTitle className="text-xl mb-2">
                {t(
                  "dashboard.coverLetterTemplates"
                )}
              </CardTitle>

              <CardDescription>
                {t(
                  "dashboard.coverLetterDesc"
                )}
              </CardDescription>

              <div className="flex-1" />

              <div className="w-full mt-auto">
                <Link
                  href="/cover-letter"
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                  >
                    {t(
                      "dashboard.openTemplates"
                    )}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t(
              "dashboard.accountStatus"
            )}
          </CardTitle>

          <CardDescription>
            {t(
              "dashboard.accountStatusDesc"
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium">
              {t("dashboard.role")}:
            </span>{" "}

            <span className="capitalize">
              {user?.role}
            </span>
          </div>

          <div>
            <span className="font-medium">
              {t("dashboard.status")}:
            </span>{" "}

            <span>
              {user?.is_active
                ? t(
                    "dashboard.active"
                  )
                : t(
                    "dashboard.deactivated"
                  )}
            </span>
          </div>

          <div>
            <span className="font-medium">
              {t(
                "dashboard.createdAt"
              )}
              :
            </span>{" "}

            <span>
              {user?.created_at
                ? new Date(
                    user.created_at
                  ).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}