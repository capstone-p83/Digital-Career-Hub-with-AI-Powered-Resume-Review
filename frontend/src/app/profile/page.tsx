"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

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
          setError("No token provided");
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
          throw new Error(data.message || "Failed to load profile");
        }

        setProfile(data.user);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
      fetchProfile();
    }
  }, [token, isLoading]);

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Loading profile...
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
            Please log in to view your profile.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              View your account information.
            </p>
          </div>

          <Link
            href="/profile/edit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Edit Profile
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        {!error && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                {profile?.email || user?.email || "Not set"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  First Name
                </p>
                <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                  {profile?.profile?.first_name || "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Last Name
                </p>
                <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                  {profile?.profile?.last_name || "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Phone
                </p>
                <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                  {profile?.profile?.phone || "Not set"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Date of Birth
                </p>
                <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                  {profile?.profile?.date_of_birth || "Not set"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Role
              </p>
              <p className="mt-2 text-base capitalize text-slate-900 dark:text-slate-100">
                {profile?.role || user?.role || "user"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Account Status
              </p>
              <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                {profile?.is_active ? "Active" : "Deactivated"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Created At
              </p>
              <p className="mt-2 text-base text-slate-900 dark:text-slate-100">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleString()
                  : "Not available"}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}