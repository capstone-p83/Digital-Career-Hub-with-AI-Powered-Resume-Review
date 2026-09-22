"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../components/ui/Card";
import {
  UploadCloud,
  File,
  X,
  AlertCircle,
  Search,
  CreditCard,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { cn } from "../../lib/utils";
import {
  buildResumeReviewFormData,
  postResumeReview,
  RESUME_REVIEW_STORAGE_KEY,
} from "../../lib/resumeReviewSubmit";
import { searchJobTitles, type JobSuggestion } from "../../lib/jobSearch";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function ResumeUploadPage() {
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [jobSuggestions, setJobSuggestions] = useState<JobSuggestion[]>([]);
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedJobUri, setSelectedJobUri] = useState("");

  const [scansRemaining, setScansRemaining] = useState<number>(2);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuth();
  const { language } = useLanguage();
  const skipNextSearchRef = useRef(false);

  const userRole = (user as any)?.role;
  const subscriptionTier = (user as any)?.subscription_tier;

  const isAdminUser = userRole === "admin" || userRole === "adminstaff";

  const isFreeTier =
    !isAdminUser && (!subscriptionTier || subscriptionTier === "free");

  const hasNoScansLeft = isFreeTier && scansRemaining <= 0;

  useEffect(() => {
    const query = targetJob.trim();

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      setShowSuggestions(false);
      setJobSuggestions([]);
      return;
    }

    if (query.length < 1 || hasNoScansLeft) {
      setJobSuggestions([]);
      setShowSuggestions(false);
      setSelectedJobUri("");
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSearchingJobs(true);

      try {
        const jobs = await searchJobTitles(query, token);
        setJobSuggestions(Array.isArray(jobs) ? jobs : []);
        setShowSuggestions(Array.isArray(jobs) && jobs.length > 0);
      } catch (err) {
        console.error("Failed to search ESCO occupations:", err);
        setJobSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearchingJobs(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [targetJob, token, hasNoScansLeft]);

  useEffect(() => {
    if (!user) return;

    const role = (user as any).role;
    const rawScans = (user as any).scans_remaining;

    const isPrivilegedUser = role === "admin" || role === "adminstaff";

    if (isPrivilegedUser) {
      setScansRemaining(2);
      return;
    }

    if (rawScans !== undefined && rawScans !== null) {
      setScansRemaining(Number(rawScans));
      return;
    }

    const fetchFreshCredits = async () => {
      try {
        const storedToken =
          localStorage.getItem("token") ||
          sessionStorage.getItem("token") ||
          token;

        if (!storedToken) return;

        const response = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const serverUser = data.user;

        const serverRole = serverUser?.role;
        const isServerPrivilegedUser =
          serverRole === "admin" || serverRole === "adminstaff";

        if (isServerPrivilegedUser) {
          setScansRemaining(2);
          return;
        }

        const trueScans =
          serverUser?.scans_remaining === null ||
          serverUser?.scans_remaining === undefined
            ? 2
            : Number(serverUser.scans_remaining);

        setScansRemaining(trueScans);
      } catch (err) {
        console.error("Failed to fetch fresh user credits context:", err);
      }
    };

    fetchFreshCredits();
  }, [user, token]);

  const refreshUserCredits = async () => {
    try {
      const storedToken =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        token;

      if (!storedToken) return;

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      const serverUser = data.user;

      const serverRole = serverUser?.role;
      const isServerPrivilegedUser =
        serverRole === "admin" || serverRole === "adminstaff";

      if (isServerPrivilegedUser) {
        setScansRemaining(2);
        return;
      }

      const trueScans =
        serverUser?.scans_remaining === null ||
        serverUser?.scans_remaining === undefined
          ? 2
          : Number(serverUser.scans_remaining);

      setScansRemaining(trueScans);
    } catch (err) {
      console.error("Failed to refresh user credits:", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    if (hasNoScansLeft) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    setError("");

    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError(t("resume.errorFileType"));
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError(t("resume.errorFileSize"));
      return;
    }

    setFile(selectedFile);
  };

  const handleSelectJob = (job: JobSuggestion) => {
    skipNextSearchRef.current = true;
    setTargetJob(job.title);
    setSelectedJobUri(job.uri);
    setShowSuggestions(false);
    setJobSuggestions([]);
    setIsSearchingJobs(false);
  };

  const handleUpload = async () => {
    setShowSuggestions(false);
    setJobSuggestions([]);

    if (!file || !targetJob.trim()) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (hasNoScansLeft) {
      setError("You've used all your free scans! Upgrade to Pro for unlimited access.");
      return;
    }

    const resumeReviewFormData = buildResumeReviewFormData({
      resume: file,
      target_job_role: targetJob.trim(),
      target_job_description: targetJobDescription,
    });

    if (selectedJobUri) {
      resumeReviewFormData.append("target_job_uri", selectedJobUri);
    }

    setIsUploading(true);
    setError("");

    try {
      const res = await postResumeReview(resumeReviewFormData, token);

      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        analysis?: any;
      };

      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : t("resume.errorReviewFailed")
        );
        setIsUploading(false);
        await refreshUserCredits();
        return;
      }

      if (data.analysis != null) {
        sessionStorage.setItem(
          RESUME_REVIEW_STORAGE_KEY,
          JSON.stringify(data.analysis)
        );

        if (isFreeTier) {
          setScansRemaining((prev) => Math.max(prev - 1, 0));
        }

        const feedbackId = data.analysis?.feedback_id;

        if (feedbackId) {
          router.push(`/resume/feedback?id=${feedbackId}`);
        } else {
          router.push("/resume/feedback");
        }

        return;
      }

      setError(t("resume.errorUnexpected"));
      setIsUploading(false);
    } catch {
      setError(t("resume.errorNetwork"));
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-blue-100/50 via-indigo-50/30 to-transparent dark:from-blue-900/15 dark:via-indigo-950/10 dark:to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header with Student Guidance */}
      <div className="max-w-2xl w-full text-center mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            {language === "bn" ? "আন্তর্জাতিক মানসম্মত এআই রেজিউমে মূল্যায়ন" : "AI-Powered ATS Resume Assessment"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t("resume.title")}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {t("resume.subtitle")}
        </p>

        {/* Free scan badge indicator */}
        <div className="pt-1 flex items-center justify-center gap-2">
          {isAdminUser ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              <Sparkles className="w-3 h-3" />
              Admin: Unlimited AI Scans
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
              <Zap className="w-3 h-3 text-amber-500" />
              {language === "bn"
                ? `ফ্রি স্ক্যান অবশিষ্ট: ${scansRemaining}টি`
                : `Free Scans Remaining: ${scansRemaining}`}
            </span>
          )}
        </div>
      </div>

      <Card className="w-full max-w-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border-slate-200/80 dark:border-slate-800 relative overflow-visible rounded-3xl">
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 rounded-3xl"
            >
              <div className="w-full max-w-sm space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto shadow-md animate-bounce">
                  <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-lg text-slate-900 dark:text-white">
                    {t("resume.uploading")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === "bn"
                      ? "এআই আপনার রেজিউমে মূল্যায়ন ও স্কিল ম্যাচ করছে..."
                      : "AI is analyzing ATS compatibility, keywords & formatting..."}
                  </p>
                </div>

                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    initial={{ width: "15%" }}
                    animate={{ width: ["15%", "65%", "88%", "98%"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-medium">{t("resume.wait")}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            {t("resume.uploadDocument")}
          </CardTitle>
          <CardDescription className="text-sm">
            {t("resume.supportedFormats")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {hasNoScansLeft && (
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 flex flex-col space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span>{language === "bn" ? "ফ্রি স্ক্যান শেষ হয়েছে" : "Free Scan Limit Reached"}</span>
              </div>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                {language === "bn"
                  ? "আপনি আপনার সকল ফ্রি স্ক্যান ব্যবহার করেছেন। আনলিমিটেড স্ক্যানের জন্য প্রো প্ল্যানে আপগ্রেড করুন।"
                  : "You have used all of your free tokens. Upgrade to a Pro membership plan to unlock unlimited resume assessments and premium keyword analytics."}
              </p>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold mt-1 w-full sm:w-auto self-start rounded-full"
                onClick={() => alert("Payment gateway integration coming soon!")}
              >
                Upgrade to Pro Plan
              </Button>
            </div>
          )}

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                if (!hasNoScansLeft) fileInputRef.current?.click();
              }}
              className={cn(
                "border-2 border-dashed rounded-3xl p-10 sm:p-12 text-center transition-all duration-200 group relative",
                hasNoScansLeft
                  ? "border-slate-200 bg-slate-100/50 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/20"
                  : error
                    ? "border-red-400 bg-red-50/50 dark:bg-red-900/10 cursor-pointer"
                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800/30 cursor-pointer shadow-xs hover:shadow-md"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
                disabled={hasNoScansLeft}
                accept=".pdf,.docx"
              />

              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud
                  className={cn(
                    "h-8 w-8",
                    hasNoScansLeft
                      ? "text-slate-400"
                      : error
                        ? "text-red-400"
                        : "text-blue-600 dark:text-blue-400"
                  )}
                />
              </div>

              <p className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {hasNoScansLeft ? "Upload Disabled" : t("resume.clickUpload")}
              </p>

              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  PDF
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  DOCX
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Max 5MB
                </span>
              </div>

              {error && (
                <p className="text-sm text-red-500 mt-4 flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shadow-xs">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <File className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title={t("resume.removeFile")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Target Job Role with Autocomplete */}
          <div className="flex flex-col space-y-2 relative">
            <label
              htmlFor="resume-target-job"
              className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between"
            >
              <span>{t("resume.targetJobRole")}</span>
              <span className="text-xs font-normal text-blue-600 dark:text-blue-400">
                {language === "bn" ? "প্রয়োজনীয়" : "Required"}
              </span>
            </label>

            <div className="relative">
              <Input
                id="resume-target-job"
                type="text"
                value={targetJob}
                disabled={hasNoScansLeft}
                onChange={(e) => {
                  setTargetJob(e.target.value);
                  setSelectedJobUri("");
                }}
                onFocus={() => {
                  if (jobSuggestions.length > 0 && !hasNoScansLeft) {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => {
                    setShowSuggestions(false);
                  }, 150);
                }}
                placeholder={
                  hasNoScansLeft
                    ? "Upgrade to search roles"
                    : t("resume.targetJobPlaceholder")
                }
                autoComplete="off"
                className="pr-10 rounded-xl"
              />
              <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
            </div>

            {isSearchingJobs && (
              <p className="text-xs text-slate-500 font-medium">
                {t("resume.searching")}
              </p>
            )}

            {/* Suggestions Bubble Dropdown */}
            {showSuggestions && !hasNoScansLeft && (
              <div className="absolute top-[76px] left-0 right-0 z-30 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl dark:border-slate-800 dark:bg-slate-900/95 p-1.5 space-y-1">
                {jobSuggestions.map((job) => (
                  <button
                    key={job.uri || job.title}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectJob(job)}
                    className="w-full px-4 py-2.5 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {job.title}
                    </p>
                    {job.description && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-400">
              {t("resume.escoHint")}
            </p>
          </div>

          {/* Job Description (Optional) */}
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="resume-job-description"
              className="text-sm font-bold text-slate-800 dark:text-slate-200"
            >
              {t("resume.jobDescription")}{" "}
              <span className="font-normal text-slate-500 dark:text-slate-400">
                ({t("resume.optional")})
              </span>
            </label>
            <textarea
              id="resume-job-description"
              value={targetJobDescription}
              disabled={hasNoScansLeft}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              rows={4}
              placeholder={t("resume.jobDescriptionPlaceholder")}
              className={cn(
                "flex min-h-[96px] w-full resize-y rounded-2xl border border-slate-200/90 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              )}
            />
            <p className="text-xs text-slate-400">
              {t("resume.jobDescriptionHint")}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="button"
            variant="gradient"
            className="w-full h-13 text-base font-bold rounded-full shadow-lg shadow-blue-500/20 cursor-pointer"
            onClick={handleUpload}
            disabled={!file || !targetJob.trim() || isUploading || hasNoScansLeft}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isUploading
              ? t("resume.processing")
              : hasNoScansLeft
                ? "Limit Reached (Upgrade to Pro)"
                : isAdminUser
                  ? t("resume.generateReview")
                  : `${t("resume.generateReview")} (${scansRemaining} left)`}
          </Button>
        </CardFooter>
      </Card>

      {!isAuthenticated && (
        <p className="mt-6 text-xs sm:text-sm text-slate-500 text-center max-w-md">
          {t("resume.loginNotice")}
        </p>
      )}
    </div>
  );
}