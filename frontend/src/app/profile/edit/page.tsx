"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Lock, AlertTriangle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";

type ProfileFormData = {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
};

type PasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function EditProfilePage() {
  const { t } = useLanguage();
  const router = useRouter();

  const {
    token,
    user,
    isAuthenticated,
    isLoading,
    fetchCurrentUser,
    updateAuthState,
    deactivateOwnAccount,
  } = useAuth();

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [deactivateSubmitting, setDeactivateSubmitting] = useState(false);

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setProfileError("");

        if (!token) {
          setProfileError(t("editProfile.noToken"));
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
          throw new Error(data.message || t("editProfile.failedLoadProfile"));
        }

        setProfileForm({
          email: data.user?.email || "",
          first_name: data.user?.profile?.first_name || "",
          last_name: data.user?.profile?.last_name || "",
          phone: data.user?.profile?.phone || "",
          date_of_birth: data.user?.profile?.date_of_birth || "",
        });
      } catch (err: any) {
        setProfileError(err.message || t("editProfile.failedLoadProfile"));
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [token, isLoading, t]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setProfileSubmitting(true);
      setProfileError("");
      setProfileSuccess("");

      if (!token) {
        throw new Error(t("editProfile.noToken"));
      }

      const trimmedEmail = profileForm.email.trim();

      if (!trimmedEmail) {
        throw new Error(t("editProfile.emailRequired"));
      }

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: trimmedEmail,
          first_name: profileForm.first_name.trim() || null,
          last_name: profileForm.last_name.trim() || null,
          phone: profileForm.phone.trim() || null,
          date_of_birth: profileForm.date_of_birth || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("editProfile.failedUpdateProfile"));
      }

      if (data.user && data.token) {
        updateAuthState(data.user, data.token);
      } else {
        await fetchCurrentUser();
      }

      setProfileSuccess(t("editProfile.profileUpdated"));
    } catch (err: any) {
      setProfileError(err.message || t("editProfile.failedUpdateProfile"));
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setPasswordSubmitting(true);
      setPasswordError("");
      setPasswordSuccess("");

      if (!token) {
        throw new Error(t("editProfile.noToken"));
      }

      if (
        !passwordForm.oldPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        throw new Error(t("editProfile.fillPasswordFields"));
      }

      if (passwordForm.newPassword.length < 8) {
        throw new Error(t("editProfile.passwordMinLength"));
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error(t("editProfile.passwordsDoNotMatch"));
      }

      const res = await fetch(`${API_BASE_URL}/users/update-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("editProfile.failedUpdatePassword"));
      }

      setPasswordSuccess(t("editProfile.passwordUpdated"));
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message || t("editProfile.failedUpdatePassword"));
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(t("editProfile.confirmDeactivate"));

    if (!confirmed) {
      return;
    }

    try {
      setDeactivateSubmitting(true);
      await deactivateOwnAccount();
      router.replace("/login");
    } catch (err: any) {
      setProfileError(err.message || t("editProfile.failedDeactivate"));
    } finally {
      setDeactivateSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("editProfile.loading")}
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {t("editProfile.loginRequired")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-140px)] px-4 py-10 text-slate-900 dark:text-slate-50 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-2xl space-y-8 relative z-10">
        {/* Back navigation */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-4 py-2 rounded-full transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("editProfile.back")}</span>
        </Link>

        {/* Profile Details Form Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("editProfile.title")}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t("editProfile.subtitle")}
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("editProfile.email")}
              </label>
              <input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("editProfile.firstName")}
                </label>
                <input
                  name="first_name"
                  type="text"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("editProfile.lastName")}
                </label>
                <input
                  name="last_name"
                  type="text"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("editProfile.phone")}
                </label>
                <input
                  name="phone"
                  type="text"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("editProfile.dateOfBirth")}
                </label>
                <input
                  name="date_of_birth"
                  type="date"
                  value={profileForm.date_of_birth}
                  onChange={handleProfileChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {t("editProfile.role")}
              </label>
              <input
                type="text"
                value={user?.role || "user"}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 capitalize cursor-not-allowed"
              />
            </div>

            {profileError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {profileSuccess}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              >
                {profileSubmitting
                  ? t("editProfile.saving")
                  : t("editProfile.saveProfile")}
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {t("editProfile.back")}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-10 shadow-xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{t("editProfile.changePassword")}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("editProfile.changePasswordDesc")}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.currentPassword")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.newPassword")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.confirmNewPassword")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            {passwordError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {passwordSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
            >
              {passwordSubmitting
                ? t("editProfile.updating")
                : t("editProfile.updatePassword")}
            </button>
          </form>
        </div>

        {/* Danger Zone Deactivate Account */}
        <div className="rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-10 shadow-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>{t("editProfile.deactivateAccount")}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t("editProfile.deactivateDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleDeactivateAccount}
            disabled={deactivateSubmitting}
            className="rounded-full bg-rose-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-rose-700 shadow-md shadow-rose-600/20 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
          >
            {deactivateSubmitting
              ? t("editProfile.deactivating")
              : t("editProfile.deactivateMyAccount")}
          </button>
        </div>
      </div>
    </main>
  );
}