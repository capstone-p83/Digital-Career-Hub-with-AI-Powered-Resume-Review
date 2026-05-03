"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../components/ui/Card";
import { UploadCloud, File, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";
import {
  buildResumeReviewFormData,
  postResumeReview,
  RESUME_REVIEW_STORAGE_KEY,
} from "../../lib/resumeReviewSubmit";

export default function ResumeUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
    const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
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

  const handleUpload = async () => {
    if (!file || !targetJob.trim()) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const resumeReviewFormData = buildResumeReviewFormData({
      resume: file,
      target_job_role: targetJob.trim(),
      target_job_description: targetJobDescription,
    });

    if (!resumeReviewFormData.has("resume")) {
      setError("Could not prepare your resume for upload.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const res = await postResumeReview(resumeReviewFormData, token);
      const data = (await res.json().catch(() => ({}))) as {
        status?: string;
        message?: string;
        analysis?: unknown;
      };

      if (!res.ok) {
        setError(
          typeof data.message === "string"
            ? data.message
            : "Review failed. Try again."
        );
        setIsUploading(false);
        return;
      }

      if (data.status === "ok" && data.analysis != null) {
        sessionStorage.setItem(
          RESUME_REVIEW_STORAGE_KEY,
          JSON.stringify(data.analysis)
        );
        router.push("/resume/feedback");
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
          Upload your resume and get intelligent, actionable feedback to increase your chances of landing an interview.
        </p>
      </div>

      <Card className="w-full max-w-xl shadow-lg relative overflow-hidden">
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6"
            >
              <div className="w-full max-w-xs space-y-4 text-center">
                <p className="font-medium">Uploading and analyzing your resume…</p>
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
                <p className="text-xs text-slate-500">This may take a moment.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Supported formats: PDF, DOCX (Max 5MB)</CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
                ${error ? "border-red-400 bg-red-50 dark:bg-red-900/10" : "border-slate-300 hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-500 dark:hover:bg-slate-800"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />
              <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${error ? "text-red-400" : "text-blue-500"}`} />
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                Click to upload or drag and drop
              </p>
              {error && (
                <p className="text-sm text-red-500 mt-2 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 mr-1" /> {error}
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
                  <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
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

        <div className="mt-6 flex flex-col space-y-2">
          <label htmlFor="resume-target-job" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Target job role
          </label>
          <Input
            id="resume-target-job"
            type="text"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            placeholder="e.g. Frontend Developer, Marketing Manager, Business Analyst"
            autoComplete="organization-title"
          />
          <p className="text-xs text-slate-500">
            Enter the job title or role you are targeting so feedback can be tailored to that position.
          </p>
        </div>

        <div className="mt-6 flex flex-col space-y-2">
          <label htmlFor="resume-job-description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Job description{" "}
            <span className="font-normal text-slate-500 dark:text-slate-400">(optional)</span>
          </label>
          <textarea
            id="resume-job-description"
            value={targetJobDescription}
            onChange={(e) => setTargetJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste or type a short job description to align feedback with the posting."
            className={cn(
              "flex min-h-[88px] w-full resize-y rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-blue-500"
            )}
          />
          <p className="text-xs text-slate-500">
            Optional context from the job posting helps tailor keywords and suggestions.
          </p>
        </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-12" 
            onClick={handleUpload} 
            disabled={!file || !targetJob.trim() || isUploading}
          >
            {isUploading ? "Processing..." : "Generate AI Review"}
          </Button>
        </CardFooter>
      </Card>
      
      {!isAuthenticated && (
         <p className="mt-6 text-sm text-slate-500 text-center max-w-md">
           You are not logged in. You will be redirected to the login page before the review can be generated.
         </p>
      )}
    </div>
  );
}
