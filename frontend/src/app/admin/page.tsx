"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  Users,
  RefreshCw,
  Search,
  Shield,
  User as UserIcon,
  Pencil,
  Save,
  X,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const MAX_SCANS = 1000;

type AdminUser = {
  id: number;
  email: string;
  role: "admin" | "adminstaff" | "user";
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  subscription_tier?: string | null;
  scans_remaining?: number | null;
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
  } | null;
};

type EditingUserState = {
  id: number;
  email: string;
  role: "admin" | "adminstaff" | "user";
  is_active: boolean;
} | null;

type EditingScansState = {
  id: number;
  value: string;
} | null;

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, token, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [pageSuccess, setPageSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [editingUser, setEditingUser] = useState<EditingUserState>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [restoringUserId, setRestoringUserId] = useState<number | null>(null);
  const [editingScans, setEditingScans] = useState<EditingScansState>(null);
  const [savingScansId, setSavingScansId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isLoading && isAuthenticated && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setPageError("");
      setPageSuccess("");

      if (!token) {
        throw new Error(t("admin.noToken"));
      }

      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("admin.failedFetchUsers"));
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setPageError(err.message || t("admin.failedFetchUsers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      fetchUsers();
    }

    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  const startEditingUser = (selectedUser: AdminUser) => {
    setPageError("");
    setPageSuccess("");
    setEditingScans(null);
    setEditingUser({
      id: selectedUser.id,
      email: selectedUser.email,
      role: selectedUser.role,
      is_active: selectedUser.is_active,
    });
  };

  const cancelEditingUser = () => {
    setEditingUser(null);
  };

  const handleEditingFieldChange = (
    field: "email" | "role" | "is_active",
    value: string | boolean
  ) => {
    setEditingUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser || !token) return;

    const trimmedEmail = editingUser.email.trim();

    if (!trimmedEmail) {
      setPageError(t("admin.emailRequired"));
      return;
    }

    try {
      setSavingUserId(editingUser.id);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(`${API_BASE_URL}/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: trimmedEmail,
          role: editingUser.role,
          is_active: editingUser.is_active,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("admin.failedUpdateUser"));
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                ...data.user,
              }
            : item
        )
      );

      setPageSuccess(t("admin.userUpdated"));
      setEditingUser(null);
    } catch (err: any) {
      setPageError(err.message || t("admin.failedUpdateUser"));
    } finally {
      setSavingUserId(null);
    }
  };

  const startEditingScans = (selectedUser: AdminUser) => {
    setPageError("");
    setPageSuccess("");
    setEditingUser(null);
    setEditingScans({
      id: selectedUser.id,
      value: String(selectedUser.scans_remaining ?? 0),
    });
  };

  const cancelEditingScans = () => {
    setEditingScans(null);
  };

  const handleSaveScans = async () => {
    if (!editingScans || !token) return;

    const targetId = editingScans.id;
    const trimmed = editingScans.value.trim();
    const parsed = Number(trimmed);

    if (
      trimmed === "" ||
      !Number.isInteger(parsed) ||
      parsed < 0 ||
      parsed > MAX_SCANS
    ) {
      setPageError(t("admin.invalidScans"));
      return;
    }

    try {
      setSavingScansId(targetId);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(
        `${API_BASE_URL}/admin/users/${targetId}/scans`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ scans_remaining: parsed }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || t("admin.failedUpdateScans")
        );
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetId
            ? {
                ...item,
                scans_remaining: data.user.scans_remaining,
              }
            : item
        )
      );

      setPageSuccess(t("admin.scansUpdated"));
      setEditingScans(null);
    } catch (err: any) {
      setPageError(
        err.message || t("admin.failedUpdateScans")
      );
    } finally {
      setSavingScansId(null);
    }
  };

  const handleDeactivateUser = async (userId: number) => {
    if (!token) return;

    if (user?.id === userId) {
      setPageError(t("admin.cannotDeactivateSelf"));
      return;
    }

    const confirmed = window.confirm(t("admin.confirmDeactivateUser"));
    if (!confirmed) return;

    try {
      setDeletingUserId(userId);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("admin.failedDeactivateUser"));
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId
            ? {
                ...item,
                is_active: false,
                deleted_at: data.user?.deleted_at ?? new Date().toISOString(),
              }
            : item
        )
      );

      if (editingUser?.id === userId) {
        setEditingUser(null);
      }

      setPageSuccess(t("admin.userDeactivated"));
    } catch (err: any) {
      setPageError(err.message || t("admin.failedDeactivateUser"));
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRestoreUser = async (userId: number) => {
    if (!token) return;

    try {
      setRestoringUserId(userId);
      setPageError("");
      setPageSuccess("");

      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/restore`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("admin.failedRestoreUser"));
      }

      setUsers((prev) =>
        prev.map((item) =>
          item.id === userId
            ? {
                ...item,
                is_active: true,
                deleted_at: null,
              }
            : item
        )
      );

      setPageSuccess(t("admin.userRestored"));
    } catch (err: any) {
      setPageError(err.message || t("admin.failedRestoreUser"));
    } finally {
      setRestoringUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((item) => {
      return (
        item.email.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword) ||
        item.role.includes(keyword) ||
        (item.is_active ? "active" : "deactivated").includes(keyword)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((item) => item.role === "admin").length;
  const totalRegularUsers = users.filter((item) => item.role === "user").length;

  if (isLoading || !isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100/80 text-purple-700 border border-purple-200/60 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("admin.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t("admin.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full shadow-xs"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("admin.backToDashboard")}
          </Button>
          <Button
            className="rounded-full shadow-md shadow-blue-500/20"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {t("admin.refresh")}
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 ring-4 ring-blue-50/50 dark:ring-blue-950/20">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("admin.totalUsers")}
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalUsers}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 ring-4 ring-purple-50/50 dark:ring-purple-950/20">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("admin.adminUsers")}
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalAdmins}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-4 ring-emerald-50/50 dark:ring-emerald-950/20">
              <UserIcon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("admin.regularUsers")}
              </p>
              <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {totalRegularUsers}
              </h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-4 space-y-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">{t("admin.allUsers")}</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage accounts, grant administrative privileges, and control access.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                className="w-full rounded-full border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
              />
            </div>
          </div>

          {pageError && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pageError}</span>
            </div>
          )}

          {pageSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{pageSuccess}</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-sm text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" />
              <span>{t("admin.loadingUsers")}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12 text-sm text-slate-500 dark:text-slate-400">
              {t("admin.noUsersFound")}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-sm text-left">
                <thead className="border-b border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/50">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">{t("admin.email")}</th>
                    <th className="px-6 py-3.5">{t("admin.role")}</th>
                    <th className="px-6 py-3.5">{t("admin.status")}</th>
                    <th className="px-6 py-3.5">{t("admin.resumeReviews")}</th>
                    <th className="px-6 py-3.5">{t("admin.createdAt")}</th>
                    <th className="px-6 py-3.5 text-right">{t("admin.actions")}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredUsers.map((item) => {
                    const isEditing = editingUser?.id === item.id;
                    const isEditingScans = editingScans?.id === item.id;
                    const isCurrentUser = user?.id === item.id;
                    const userInitial = (item.email.charAt(0) || "U").toUpperCase();
                    const scansCount = item.scans_remaining ?? 0;
                    const isFreeUser =
                      item.role === "user" &&
                      (!item.subscription_tier ||
                        item.subscription_tier === "free");

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                          #{item.id}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                              {userInitial}
                            </div>
                            {isEditing ? (
                              <input
                                type="email"
                                value={editingUser.email}
                                onChange={(e) =>
                                  handleEditingFieldChange("email", e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              />
                            ) : (
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {item.email}
                                </p>
                                {isCurrentUser && (
                                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                                    (Current Session)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editingUser.role}
                              onChange={(e) =>
                                handleEditingFieldChange("role", e.target.value)
                              }
                              disabled={isCurrentUser}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                              <option value="user">user</option>
                              <option value="adminstaff">adminstaff</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                                item.role === "admin"
                                  ? "bg-purple-100 text-purple-700 border border-purple-200/60 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60"
                                  : item.role === "adminstaff"
                                  ? "bg-indigo-100 text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60"
                                  : "bg-slate-100 text-slate-700 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {item.role}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <select
                              value={editingUser.is_active ? "active" : "deactivated"}
                              onChange={(e) =>
                                handleEditingFieldChange(
                                  "is_active",
                                  e.target.value === "active"
                                )
                              }
                              disabled={isCurrentUser}
                              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                              <option value="active">{t("admin.active")}</option>
                              <option value="deactivated">
                                {t("admin.deactivated")}
                              </option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                item.is_active
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                                  : "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  item.is_active ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                              />
                              {item.is_active
                                ? t("admin.active")
                                : t("admin.deactivated")}
                            </span>
                          )}
                        </td>

                        {/* Resume Review Attempts */}
                        <td className="px-6 py-4">
                          {!isFreeUser ? (
                            <span className="inline-flex items-center rounded-full border border-purple-200/80 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/40 dark:text-purple-300">
                              {t("admin.unlimited")}
                            </span>
                          ) : isEditingScans ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={MAX_SCANS}
                                step={1}
                                value={editingScans.value}
                                autoFocus
                                onChange={(e) =>
                                  setEditingScans((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          value: e.target.value,
                                        }
                                      : prev
                                  )
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveScans();
                                  }

                                  if (e.key === "Escape") {
                                    cancelEditingScans();
                                  }
                                }}
                                disabled={savingScansId === item.id}
                                className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              />
                              <button
                                type="button"
                                onClick={handleSaveScans}
                                disabled={savingScansId === item.id}
                                className="inline-flex items-center justify-center rounded-full p-1.5 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                title={t("admin.save")}
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditingScans}
                                disabled={savingScansId === item.id}
                                className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                title={t("admin.cancel")}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                                  scansCount === 0
                                    ? "border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
                                    : "border-blue-200/80 bg-blue-50 text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300"
                                }`}
                              >
                                {scansCount} {t("admin.remaining")}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  startEditingScans(item)
                                }
                                className="inline-flex items-center justify-center rounded-full p-1.5 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                title={t("admin.editScans")}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSaveUser}
                                  disabled={savingUserId === item.id}
                                  className="inline-flex items-center justify-center rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                  title={t("admin.save")}
                                >
                                  <Save className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={cancelEditingUser}
                                  disabled={savingUserId === item.id}
                                  className="inline-flex items-center justify-center rounded-full p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                  title={t("admin.cancel")}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditingUser(item)}
                                  className="inline-flex items-center justify-center rounded-full p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                                  title={t("admin.edit")}
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>

                                {item.is_active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivateUser(item.id)}
                                    disabled={deletingUserId === item.id || isCurrentUser}
                                    className="inline-flex items-center justify-center rounded-full p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                                    title={t("admin.deactivate")}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreUser(item.id)}
                                    disabled={restoringUserId === item.id}
                                    className="inline-flex items-center justify-center rounded-full p-2 text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                    title={t("admin.restore")}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}