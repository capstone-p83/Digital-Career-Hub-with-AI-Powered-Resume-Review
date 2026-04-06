"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

type ProfileData = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  created_at?: string;
};

const GET_ME_URL = "http://localhost:5001/api/user/me";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

        const res = await fetch(GET_ME_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        setProfile(data.user || data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-2 text-sm text-gray-600">
              View your account information.
            </p>
          </div>

          <Link
            href="/profile/edit"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
          >
            Edit Profile
          </Link>
        </div>

        {loading && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            Loading profile...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Name
              </p>
              <p className="mt-2 text-base text-gray-900">
                {profile?.name || user?.name || "Not set"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Email
              </p>
              <p className="mt-2 text-base text-gray-900">
                {profile?.email || user?.email || "Not set"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Role
              </p>
              <p className="mt-2 text-base capitalize text-gray-900">
                {profile?.role || user?.role || "user"}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Created At
              </p>
              <p className="mt-2 text-base text-gray-900">
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