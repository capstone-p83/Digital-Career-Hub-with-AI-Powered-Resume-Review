"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ArrowLeft, CheckCircle2, AlertCircle, Lightbulb, TrendingUp, Download, Share2, X } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  RESUME_REVIEW_STORAGE_KEY,
  type ResumeReviewAnalysis,
} from "../../../lib/resumeReviewSubmit";

function isResumeReviewAnalysis(x: unknown): x is ResumeReviewAnalysis {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.score !== "number" || typeof o.summary !== "string") return false;
  const f = o.feedback;
  if (!f || typeof f !== "object") return false;
  const fb = f as Record<string, unknown>;
  return (
    Array.isArray(fb.strengths) &&
    Array.isArray(fb.weaknesses) &&
    Array.isArray(fb.suggestions)
  );
}

function scoreHeadline(score: number): string {
  if (score >= 85) return "Strong resume";
  if (score >= 70) return "Solid foundation";
  return "Room to grow";
}

export default function ResumeFeedbackPage() {
  const [ready, setReady] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeReviewAnalysis | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RESUME_REVIEW_STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isResumeReviewAnalysis(parsed)) {
          setAnalysis({
            ...parsed,
            keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          });
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setReady(true);
  }, []);

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
        <Link href="/resume">
          <Button>Go to resume upload</Button>
        </Link>
      </div>
    );
  }

  const { score, summary, feedback, keywords } = analysis;
  const strengths = feedback.strengths.map(String);
  const weaknesses = feedback.weaknesses.map(String);
  const suggestions = feedback.suggestions.map(String);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link href="/resume">
            <Button variant="ghost" className="pl-0 hover:bg-transparent -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <ArrowLeft className="mr-2 w-4 h-4" /> Back to Upload
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Share2 className="mr-2 w-4 h-4" /> Share</Button>
            <Button size="sm"><Download className="mr-2 w-4 h-4" /> Export PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="col-span-1">
            <Card className="h-full flex flex-col items-center justify-center py-10 text-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-950 border-blue-100 dark:border-blue-900/50">
              <div className="relative">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={2 * Math.PI * 56}
                    strokeDashoffset={2 * Math.PI * 56 * ((100 - score) / 100)}
                    className="text-blue-600 drop-shadow-md"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{score}</span>
                  <span className="text-xs text-slate-500 font-medium tracking-wide">/100</span>
                </div>
              </div>
              <h2 className="text-xl font-bold mt-6 text-slate-900 dark:text-white">{scoreHeadline(score)}</h2>
              <p className="text-sm text-slate-500 px-6 mt-2">
                {summary}
              </p>
            </Card>
          </motion.div>

          <div className="col-span-1 md:col-span-2 grid grid-rows-2 gap-6">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <Card className="h-full">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-lg flex items-center text-emerald-600 dark:text-emerald-500">
                    <CheckCircle2 className="mr-2 w-5 h-5" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {strengths.length === 0 ? (
                      <li className="text-sm text-slate-500">None listed.</li>
                    ) : (
                      strengths.map((str, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-emerald-500 mr-2 mt-1">•</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{str}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Card className="h-full">
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-lg flex items-center text-red-600 dark:text-red-500">
                    <AlertCircle className="mr-2 w-5 h-5" /> Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {weaknesses.length === 0 ? (
                      <li className="text-sm text-slate-500">None listed.</li>
                    ) : (
                      weaknesses.map((weak, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">•</span>
                          <span className="text-sm text-slate-700 dark:text-slate-300">{weak}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="h-full border-blue-200 dark:border-blue-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-blue-700 dark:text-blue-400">
                  <Lightbulb className="mr-2 w-5 h-5" /> Actionable Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {suggestions.length === 0 ? (
                    <li className="text-sm text-slate-500">None listed.</li>
                  ) : (
                    suggestions.map((sug, i) => (
                      <li key={i} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-800/30">
                        {sug}
                      </li>
                    ))
                  )}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 w-5 h-5 text-purple-600" /> ATS Keyword Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  Based on your target role, here is how well your resume matches expected keywords.
                </p>
                {keywords.length === 0 ? (
                  <p className="text-sm text-slate-500">No keyword breakdown returned.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((kw, i) => (
                      <span
                        key={`${kw.word}-${i}`}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          kw.found
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {kw.word}
                        {kw.found ? <CheckCircle2 className="w-3 h-3 ml-1" /> : <X className="w-3 h-3 ml-1" />}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
