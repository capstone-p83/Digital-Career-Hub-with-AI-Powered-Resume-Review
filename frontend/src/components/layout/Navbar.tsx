"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage, type Language, LANGUAGE_NAMES } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, User as UserIcon, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/resources", label: t("nav.resources") },
    { href: "/resume", label: t("nav.resume") },
    { href: "/chatbot", label: t("nav.chatbot") },
  ];

  if (isAuthenticated) {
    navLinks.push({ href: "/dashboard", label: t("nav.dashboard") });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">
              CareerHub
            </Link>
          </div>

          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                  pathname === link.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative group flex items-center bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-2 text-slate-500">
                <Globe size={14} />
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-sm font-medium py-1.5 pr-2 focus:outline-none dark:text-slate-300 hover:cursor-pointer"
              >
                {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([key, name]) => (
                  <option key={key} value={key} className="dark:bg-slate-800">
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                  <UserIcon size={18} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition shadow-sm hover:shadow"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
              <div className="flex space-x-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm font-medium py-1.5 px-2 focus:outline-none dark:text-slate-300"
                >
                  {(Object.entries(LANGUAGE_NAMES) as [Language, string][]).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full border border-slate-200 dark:border-slate-700"
                >
                  {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    router.replace("/login");
                  }}
                  className="text-sm font-medium bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-md"
                >
                  {t("nav.logout")}
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {t("nav.login")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}