"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useLanguage,
  type Language,
} from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  X,
  User as UserIcon,
  Languages,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../lib/utils";

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const nextLanguage: Language = language === "en" ? "bn" : "en";
    setLanguage(nextLanguage);
  };

  const handleLogout = async () => {
    await logout();

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("reset-chatbot"));
    }

    setMobileMenuOpen(false);
    router.replace("/login");
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/resources", label: t("nav.resources") },
    { href: "/resume", label: t("nav.resume") },
  ];

  if (isAuthenticated) {
    navLinks.push({ href: "/dashboard", label: t("nav.dashboard") });
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="font-bold text-xl text-blue-600 dark:text-blue-400"
            >
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
            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              aria-label="Toggle language"
            >
              {language === "en" ? "বাংলা" : "English"}
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    title={t("nav.adminPanel")}
                  >
                    <Shield size={18} />
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={user?.email || t("nav.profile")}
                >
                  <UserIcon size={18} />
                </Link>

                <button
                  type="button"
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

          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
              aria-label="Toggle language"
            >
              <Languages size={15} />
              {language === "en" ? "বাংলা" : "EN"}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
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
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t("nav.profile")}
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    {t("nav.adminPanel")}
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-600"
              >
                {t("nav.login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}