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
  Shield,
  Sparkles,
  Briefcase,
  LogOut,
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

  const userInitial = (
    user?.profile?.first_name?.[0] ||
    user?.email?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3 pb-2 transition-all">
      <nav className="max-w-7xl mx-auto rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl shadow-sm px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl sm:rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  CareerHub
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 hidden sm:block -mt-0.5">
                {language === "bn" ? "বাংলাদেশি শিক্ষার্থীদের জন্য" : "For Students & Graduates"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1.5 bg-slate-100/70 dark:bg-slate-800/50 p-1.5 rounded-full border border-slate-200/40 dark:border-slate-700/40">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                    isActive
                      ? "bg-white text-blue-600 shadow-sm font-semibold dark:bg-slate-900 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-900/40"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Language Switcher Pill */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 hover:bg-slate-200/90 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/90 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-xs cursor-pointer"
              title={language === "en" ? "বাংলা ভাষায় দেখুন" : "Switch to English"}
            >
              <span className={cn("px-1.5 py-0.5 rounded-full", language === "en" ? "bg-white dark:bg-slate-900 shadow-2xs font-bold text-blue-600 dark:text-blue-400" : "text-slate-500")}>
                EN
              </span>
              <span className="text-slate-300 dark:text-slate-600 mx-0.5">/</span>
              <span className={cn("px-1.5 py-0.5 rounded-full", language === "bn" ? "bg-white dark:bg-slate-900 shadow-2xs font-bold text-blue-600 dark:text-blue-400" : "text-slate-500")}>
                বাংলা
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={17} className="text-amber-400" />
              ) : (
                <Moon size={17} className="text-slate-600" />
              )}
            </button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-1">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200/60 dark:border-purple-800/40 transition"
                    title={t("nav.adminPanel")}
                  >
                    <Shield size={16} />
                  </Link>
                )}

                <Link
                  href="/profile"
                  className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-200/60 dark:border-slate-700/60"
                  title={user?.email || t("nav.profile")}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userInitial}
                  </div>
                  <span className="text-xs font-semibold max-w-[90px] truncate">
                    {user?.profile?.first_name || user?.email?.split("@")[0] || t("nav.profile")}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Toggle language"
            >
              {language === "en" ? "বাংলা" : "EN"}
            </button>

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {mounted && theme === "dark" ? (
                <Sun size={17} className="text-amber-400" />
              ) : (
                <Moon size={17} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-slate-100 dark:border-slate-800/80 mt-3 space-y-2">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                    pathname === link.href
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-1.5">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <UserIcon size={16} />
                    <span>{t("nav.profile")}</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                    >
                      <Shield size={16} />
                      <span>{t("nav.adminPanel")}</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-left px-4 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={16} />
                    <span>{t("nav.logout")}</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-xs"
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}