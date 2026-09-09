"use client";

import Link from "next/link";
import { Mail, Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-slate-100 py-12 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="rounded-lg bg-blue-600 p-2 text-white shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>

              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t("footer.brand")}
              </span>
            </Link>

            <p className="text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          <div className="md:mx-auto">
            <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
              {t("footer.resources")}
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/resources"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t("footer.careerAdvice")}
                </Link>
              </li>

              <li>
                <Link
                  href="/resume"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t("nav.resume")}
                </Link>
              </li>

              <li>
                <Link
                  href="/cover-letter"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t("footer.coverLetterBuilder")}
                </Link>
              </li>

              <li>
                <Link
                  href="/learning"
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {t("footer.interviewPrep")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:ml-auto">
            <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">
              {t("footer.contactUs")}
            </h3>

            <div className="space-y-4 text-sm">
              <a
                href="mailto:support@digitalcareerhub.com"
                className="flex items-center space-x-3 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>support@digitalcareerhub.com</span>
              </a>

              <a
                href="mailto:support@digitalcareerhub.com"
                className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-xs font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                {t("footer.sendMessage")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-200 pt-8 text-center dark:border-slate-800">
          <p className="text-sm">
            &copy; {currentYear} {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}