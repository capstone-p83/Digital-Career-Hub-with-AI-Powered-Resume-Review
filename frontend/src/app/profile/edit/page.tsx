"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t("editProfile.title")}
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("editProfile.subtitle")}
          </p>

          <form onSubmit={handleProfileSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("editProfile.email")}
              </label>
              <input
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("editProfile.firstName")}
                </label>
                <input
                  name="first_name"
                  type="text"
                  value={profileForm.first_name}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("editProfile.lastName")}
                </label>
                <input
                  name="last_name"
                  type="text"
                  value={profileForm.last_name}
                  onChange={handleProfileChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("editProfile.phone")}
              </label>
              <input
                name="phone"
                type="text"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("editProfile.dateOfBirth")}
              </label>
              <input
                name="date_of_birth"
                type="date"
                value={profileForm.date_of_birth}
                onChange={handleProfileChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t("editProfile.role")}
              </label>
              <input
                type="text"
                value={user?.role || "user"}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400 capitalize"
              />
            </div>

            {profileError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                {profileError}
              </div>
            )}

            {profileSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {profileSuccess}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={profileSubmitting}
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
              >
                {profileSubmitting
                  ? t("editProfile.saving")
                  : t("editProfile.saveProfile")}
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("editProfile.back")}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("editProfile.changePassword")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("editProfile.changePasswordDesc")}
          </p>

          <form onSubmit={handlePasswordSubmit} className="mt-8 space-y-5">
            <input
              name="oldPassword"
              type="password"
              value={passwordForm.oldPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.currentPassword")}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
            />

            <input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.newPassword")}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
            />

            <input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder={t("editProfile.confirmNewPassword")}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-300"
            />

            {passwordError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                {passwordSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {passwordSubmitting
                ? t("editProfile.updating")
                : t("editProfile.updatePassword")}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm dark:border-red-900/40 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            {t("editProfile.deactivateAccount")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {t("editProfile.deactivateDesc")}
          </p>

          <button
            type="button"
            onClick={handleDeactivateAccount}
            disabled={deactivateSubmitting}
            className="mt-6 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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