"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

type ProfileData = {
  id?: string | number;
  email?: string;
  role?: "admin" | "adminstaff" | "user";
  is_active?: boolean;
  deleted_at?: string | null;
  created_at?: string;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
  } | null;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError(t("profile.noToken"));
          return;
        }

        const res = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || t("profile.failedLoad"));
        }

        setProfile(data.user);
      } catch (err: any) {
        setError(err.message || t("profile.failedLoad"));
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [token, isLoading, t]);

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("profile.loading")}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {t("profile.loginRequired")}
          </div>
        </div>
      </main>
    );
  }

  const displayName = `${profile?.profile?.first_name || ""} ${profile?.profile?.last_name || ""}`.trim() || user?.email || "Student";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-[calc(100vh-140px)] px-4 py-10 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Profile Avatar Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20">
              {userInitial}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {displayName}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 uppercase">
                  {profile?.role || user?.role || "user"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {profile?.email || user?.email}
              </p>
            </div>
          </div>

          <Link
            href="/profile/edit"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            {t("profile.editProfile")}
          </Link>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300 mb-6">
            {error}
          </div>
        )}

        {!error && (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("profile.email")}
              </p>
              <p className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">
                {profile?.email || user?.email || t("profile.notSet")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.firstName")}
                </p>
                <p className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">
                  {profile?.profile?.first_name || t("profile.notSet")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.lastName")}
                </p>
                <p className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">
                  {profile?.profile?.last_name || t("profile.notSet")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.phone")}
                </p>
                <p className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">
                  {profile?.profile?.phone || t("profile.notSet")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.dateOfBirth")}
                </p>
                <p className="mt-1.5 text-base font-medium text-slate-900 dark:text-slate-100">
                  {profile?.profile?.date_of_birth || t("profile.notSet")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.accountStatus")}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${profile?.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  <span className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">
                    {profile?.is_active
                      ? t("profile.active")
                      : t("profile.deactivated")}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("profile.createdAt")}
                </p>
                <p className="mt-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : t("profile.notAvailable")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}