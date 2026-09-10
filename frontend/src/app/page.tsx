"use client";

import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Bot,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  GraduationCap,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t, language } = useLanguage();

  const openChatbot = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-chatbot"));
    }
  };

  const features = [
    {
      title: t("home.feature.resume.title"),
      description: t("home.feature.resume.description"),
      icon: <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      tag: language === "bn" ? "এআই চালিত" : "AI Powered",
      href: "/resume",
      badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      title: t("home.feature.resources.title"),
      description: t("home.feature.resources.description"),
      icon: <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      tag: language === "bn" ? "লার্নিং হাব" : "Guides & Resumes",
      href: "/resources",
      badgeColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
    {
      title: t("home.feature.assistant.title"),
      description: t("home.feature.assistant.description"),
      icon: <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      tag: language === "bn" ? "২৪/৭ অ্যাসিস্ট্যান্ট" : "24/7 Smart Bot",
      action: "chatbot",
      badgeColor: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
    },
  ];

  const workflowSteps = [
    {
      number: "01",
      title: language === "bn" ? "রেজিউমে আপলোড করুন" : "Upload Your Resume",
      description:
        language === "bn"
          ? "পিডিএফ বা ডক ফাইল ড্রপ করুন। কোনো জটিল ফরম্যাটিং পরিবর্তনের প্রয়োজন নেই।"
          : "Drop your PDF or DOCX file. Fast, simple, and private upload in seconds.",
      icon: <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
    {
      number: "02",
      title: language === "bn" ? "এআই বিশ্লেষণ ও স্কিল গ্যাপ" : "AI Deep ATS Analysis",
      description:
        language === "bn"
          ? "ESCO স্ট্যান্ডার্ডে আপনার দক্ষতা, মিসিং কিওয়ার্ড এবং স্কোর নিখুঁতভাবে যাচাই করুন।"
          : "Instantly check keyword matches, missing skills, and overall ATS readiness score.",
      icon: <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      number: "03",
      title: language === "bn" ? "ক্যারিয়ারে এগিয়ে যান" : "Elevate Your Career",
      description:
        language === "bn"
          ? "সুপারিশ অনুযায়ী রিজিউমে আপডেট করুন এবং ইন্টারভিউ প্র্যাকটিস শুরু করুন।"
          : "Apply actionable fixes, generate tailored cover letters, and master interview prep.",
      icon: <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      {/* Decorative ambient bubble glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-100/60 via-indigo-50/40 to-transparent dark:from-blue-900/20 dark:via-indigo-950/10 dark:to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-60 right-10 w-72 h-72 bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-96 left-10 w-80 h-80 bg-emerald-100/40 dark:bg-emerald-900/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {/* Student Badge Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/60 shadow-xs">
              <span className="text-base leading-none">🇧🇩</span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {language === "bn"
                  ? "বাংলাদেশি শিক্ষার্থী ও গ্র্যাজুয়েটদের জন্য তৈরি"
                  : "Tailored for Bangladeshi Students & Tech Aspirants"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 pt-2">
              <Link href="/resume" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full sm:w-auto h-13 px-8 text-base shadow-lg shadow-blue-500/25 group cursor-pointer"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  {t("cta.upload")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={openChatbot}
                className="w-full sm:w-auto h-13 px-7 text-base rounded-full border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bot className="mr-2 w-4 h-4 text-purple-600 dark:text-purple-400" />
                {t("cta.askAI")}
              </Button>
            </div>

            {/* Micro Benefits Pills */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {language === "bn" ? "বিনামূল্যে এআই স্ক্যান" : "Free AI Assessment"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {language === "bn" ? "দ্বিভাষিক (বাংলা ও ইংরেজি)" : "Bilingual (English & বাংলা)"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {language === "bn" ? "গোপনীয় ও নিরাপদ" : "Private & Secure"}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3-Step Interactive Process Bubbles */}
      <section className="py-14 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/50">
              {language === "bn" ? "কিভাবে কাজ করে" : "How It Works"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-3">
              {language === "bn"
                ? "৩টি সহজ ধাপে চাকরি প্রস্তুতির শীর্ষে থাকুন"
                : "Land Your Dream Job in 3 Clear Steps"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {workflowSteps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="h-full"
              >
                <div className="h-full p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {step.icon}
                    </div>
                    <span className="text-2xl font-black text-slate-200 dark:text-slate-800 select-none">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50">
              {language === "bn" ? "স্মার্ট ফিচারসমূহ" : "Core Capabilities"}
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t("home.features.title")}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const card = (
                <Card className="h-full border-slate-200/80 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-700/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col justify-between">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {feature.icon}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${feature.badgeColor}`}>
                        {feature.tag}
                      </span>
                    </div>

                    <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>

                    <div className="pt-2 flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                      <span>{language === "bn" ? "ব্যবহার করুন" : "Get Started"}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  {feature.href ? (
                    <Link
                      href={feature.href}
                      className="block h-full cursor-pointer"
                    >
                      {card}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={openChatbot}
                      className="block h-full w-full text-left cursor-pointer"
                    >
                      {card}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Student Hub Additional Quick Access Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
                <GraduationCap className="w-4 h-4" />
                <span>{language === "bn" ? "বিশেষ শিক্ষার্থী সেবা" : "Career Boost for Students"}</span>
              </div>
              <h3 className="text-2xl font-bold">
                {language === "bn"
                  ? "ইন্টারভিউ ও কভার লেটার প্রস্তুত তো?"
                  : "Need Cover Letters & Interview Practice?"}
              </h3>
              <p className="text-blue-100 text-sm max-w-xl">
                {language === "bn"
                  ? "আমাদের এআই কভার লেটার জেনারেটর ও ফ্ল্যাশকার্ড ব্যাংক ব্যবহার করে বিশ্বমানের প্রিপারেশন নিন।"
                  : "Generate customized Word cover letters and test yourself with interactive interview flashcards."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <Link href="/cover-letter">
                <Button className="rounded-full bg-white text-blue-700 hover:bg-blue-50 shadow-md font-semibold">
                  {language === "bn" ? "কভার লেটার তৈরি করুন" : "Build Cover Letter"}
                </Button>
              </Link>
              <Link href="/learning">
                <Button variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/15">
                  {language === "bn" ? "ইন্টারভিউ ফ্ল্যাশকার্ড" : "Practice Flashcards"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
