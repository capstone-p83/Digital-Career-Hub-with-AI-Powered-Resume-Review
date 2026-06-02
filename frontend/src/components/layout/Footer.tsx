"use client";

import Link from "next/link";
import { Mail, Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 py-12 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
                {t("footer.brand")}
              </span>
            </Link>

            <p className="text-sm mt-4 leading-relaxed">
              {t("footer.description")}
            </p>

            <div className="flex items-center space-x-4 mt-6">
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs shadow-sm border border-slate-200 dark:border-slate-700">
                Twitter
              </Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs shadow-sm border border-slate-200 dark:border-slate-700">
                LinkedIn
              </Link>
              <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-xs shadow-sm border border-slate-200 dark:border-slate-700">
                GitHub
              </Link>
            </div>
          </div>

          <div className="md:ml-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">
              {t("footer.resources")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/resume" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.resumeTemplates")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.coverLetterBuilder")}
                </Link>
              </li>
              <li>
                <Link href="/chatbot" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.interviewPrep")}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.careerAdvice")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:ml-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">
              {t("footer.company")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.careers")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {t("footer.termsOfService")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:ml-auto">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 text-lg">
              {t("footer.contactUs")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>support@digitalcareerhub.com</span>
              </li>
              <li className="flex items-center space-x-3 mt-4">
                <div className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 w-full text-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-sm">
                  {t("footer.sendMessage")}
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm">
            &copy; {currentYear} {t("footer.rights")}
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {t("footer.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}