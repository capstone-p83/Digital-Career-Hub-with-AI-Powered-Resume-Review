"use client";

import Link from "next/link";
import { Mail, Briefcase, Sparkles, ArrowUpRight, GraduationCap } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, language } = useLanguage();

  return (
    <footer className="mt-auto w-full border-t border-slate-200/80 bg-white/70 dark:border-slate-800/80 dark:bg-slate-950/70 backdrop-blur-md pt-16 pb-10 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-slate-200/60 dark:border-slate-800/60">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 text-white shadow-md shadow-blue-500/20 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t("footer.brand")}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm text-slate-500 dark:text-slate-400">
              {t("footer.description")}
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>
                  {language === "bn"
                    ? "বাংলাদেশি গ্র্যাজুয়েট ও তরুণ পেশাদারদের সহায়ক প্ল্যাটফর্ম"
                    : "Empowering Students & Recent Graduates in Bangladesh"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 md:pl-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t("footer.resources")}
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="group flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{t("footer.careerAdvice")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                </Link>
              </li>

              <li>
                <Link
                  href="/resume"
                  className="group flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{t("nav.resume")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                </Link>
              </li>

              <li>
                <Link
                  href="/cover-letter"
                  className="group flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <span>{t("footer.coverLetterBuilder")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="md:col-span-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {t("footer.contactUs")}
            </h3>

            <div className="space-y-4 text-sm">
              <a
                href="mailto:support@digitalcareerhub.com"
                className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="font-medium text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                  support@digitalcareerhub.com
                </span>
              </a>

              <a
                href="mailto:support@digitalcareerhub.com"
                className="block w-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-center text-xs font-semibold text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                {t("footer.sendMessage")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {currentYear} {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}