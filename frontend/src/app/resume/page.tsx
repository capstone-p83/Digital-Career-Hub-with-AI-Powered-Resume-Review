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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import {
  buildResumeReviewFormData,
  postResumeReview,
  RESUME_REVIEW_STORAGE_KEY,
} from "../../lib/resumeReviewSubmit";
import { searchJobTitles, type JobSuggestion } from "../../lib/jobSearch";

export default function ResumeUploadPage() {
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

        const response = await fetch("http://localhost:5001/api/users/me", {
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

      const response = await fetch("http://localhost:5001/api/users/me", {
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
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should not exceed 5MB.");
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
            : "Review failed. Try again."
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

      setError("Unexpected response from server.");
      setIsUploading(false);
    } catch {
      setError("Network error. Check your connection and API URL.");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl w-full text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          AI Resume Review
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Upload your resume and get intelligent, actionable feedback to
          increase your chances of landing an interview.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-lg relative overflow-visible">
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 rounded-xl"
            >
              <div className="w-full max-w-xs space-y-4 text-center">
                <p className="font-medium">
                  Uploading and analyzing your resume…
                </p>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: "15%" }}
                    animate={{ width: ["15%", "85%", "40%", "100%"] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  This may take a moment.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>
            Supported formats: PDF, DOCX (Max 5MB)
          </CardDescription>
        </CardHeader>

        <CardContent>
          {hasNoScansLeft && (
            <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 flex flex-col space-y-2">
              <div className="flex items-center space-x-2 font-semibold">
                <CreditCard className="w-5 h-5 flex-shrink-0" />
                <span>Free Scan Limit Reached</span>
              </div>
              <p className="text-sm opacity-90">
                You have used all of your free tokens. Upgrade to a Pro membership plan to unlock unlimited resume assessments and premium keyword analytics.
              </p>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium mt-1 w-full sm:w-auto self-start"
                onClick={() => alert("Payment gateway integration coming soon!")}
              >
                Upgrade to Pro Plan
              </Button>
            </div>
          )}

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => {
                if (!hasNoScansLeft) fileInputRef.current?.click();
              }}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-colors",
                hasNoScansLeft
                  ? "border-slate-200 bg-slate-100/50 cursor-not-allowed dark:border-slate-800 dark:bg-slate-900/20"
                  : error
                    ? "border-red-400 bg-red-50 dark:bg-red-900/10 cursor-pointer"
                    : "border-slate-300 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800 cursor-pointer"
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
              <UploadCloud
                className={cn(
                  "mx-auto h-12 w-12 mb-4",
                  hasNoScansLeft
                    ? "text-slate-400"
                    : error
                      ? "text-red-400"
                      : "text-blue-500"
                )}
              />
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                {hasNoScansLeft ? "Upload Disabled" : "Click to upload or drag and drop"}
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                  <File className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-2 relative">
            <label
              htmlFor="resume-target-job"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Target job role
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
                    : "Start typing, e.g. frontend developer"
                }
                autoComplete="off"
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            {isSearchingJobs && (
              <p className="text-xs text-slate-500">
                Searching ESCO occupations…
              </p>
            )}

            {showSuggestions && !hasNoScansLeft && (
              <div className="absolute top-[72px] left-0 right-0 z-30 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
                {jobSuggestions.map((job) => (
                  <button
                    key={job.uri || job.title}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectJob(job)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {job.title}
                    </p>
                    {job.description && (
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-500">
              Search powered by ESCO occupation data. You can also type your own
              role if no suggestion matches.
            </p>
          </div>

          <div className="mt-6 flex flex-col space-y-2">
            <label
              htmlFor="resume-job-description"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Job description{" "}
              <span className="font-normal text-slate-500 dark:text-slate-400">
                (optional)
              </span>
            </label>
            <textarea
              id="resume-job-description"
              value={targetJobDescription}
              disabled={hasNoScansLeft}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              rows={4}
              placeholder="Paste or type a short job description to align feedback with the posting."
              className={cn(
                "flex min-h-[88px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-500"
              )}
            />
            <p className="text-xs text-slate-500">
              Optional context from the job posting helps tailor keywords and
              suggestions.
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            className="w-full h-12"
            onClick={handleUpload}
            disabled={!file || !targetJob.trim() || isUploading || hasNoScansLeft}
          >
            {isUploading
              ? "Processing..."
              : hasNoScansLeft
                ? "Limit Reached (Upgrade to Pro)"
                : isAdminUser
                  ? "Generate AI Review"
                  : `Generate AI Review (${scansRemaining} left)`}
          </Button>
        </CardFooter>
      </Card>

      {!isAuthenticated && (
        <p className="mt-6 text-sm text-slate-500 text-center max-w-md">
          You are not logged in. You will be redirected to the login page before
          the review can be generated.
        </p>
      )}
    </div>
  );
}