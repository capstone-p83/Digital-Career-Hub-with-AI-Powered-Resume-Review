"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  ShieldAlert,
  Users,
  Trash2,
  RefreshCw,
  Search,
  Shield,
  User as UserIcon
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type AdminUser = {
  id: number;
  email: string;
  is_admin: boolean;
  created_at: string;
};

export default function AdminDashboard() {
  const { user, token, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setPageError("");

      if (!token) {
        throw new Error("No token provided");
      }

      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setPageError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!token) {
      return;
    }

    if (user?.id === userId) {
      setPageError("You cannot delete your own admin account from this page.");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) {
      return;
    }

    try {
      setDeletingUserId(userId);
      setPageError("");

      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((item) => item.id !== userId));
    } catch (err: any) {
      setPageError(err.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((item) => {
      return (
        item.email.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword) ||
        (item.is_admin ? "admin" : "user").includes(keyword)
      );
    });
  }, [users, search]);

  const totalUsers = users.length;
  const totalAdmins = users.filter((item) => item.is_admin).length;
  const totalRegularUsers = users.filter((item) => !item.is_admin).length;

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          You must be logged in as an administrator to view this page.
        </p>
        <Button onClick={() => router.push("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage registered users across the platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Total Users
              </p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalUsers}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full text-purple-600 dark:text-purple-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Admin Users
              </p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalAdmins}
              </h4>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full text-emerald-600 dark:text-emerald-400">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Regular Users
              </p>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalRegularUsers}
              </h4>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Users</CardTitle>

            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by id, email, or role"
                className="w-full rounded-lg border border-slate-300 bg-white px-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-300"
              />
            </div>
          </div>

          {pageError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
              {pageError}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="border-b border-slate-200 dark:border-slate-800">
                  <tr className="text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Created At</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-4 text-slate-900 dark:text-white">
                        {item.id}
                      </td>

                      <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                        {item.email}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.is_admin
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {item.is_admin ? "admin" : "user"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "N/A"}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(item.id)}
                            disabled={deletingUserId === item.id || user?.id === item.id}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                            title={
                              user?.id === item.id
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}