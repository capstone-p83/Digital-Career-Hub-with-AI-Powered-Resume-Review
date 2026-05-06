"use client";

import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  FileText,
  Clock,
  ArrowRight,
  Calendar,
  Briefcase,
  PlayCircle,
  BarChart2,
  Edit3,
  Shield,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin, isAdminStaff, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const isPrivileged = isAdmin || isAdminStaff;

  const displayName =
    user?.profile?.first_name?.trim() ||
    user?.email ||
    "User";

  const upcomingInterviews = [
    { company: "TechNova Corp", role: "Frontend Dev", date: "Tomorrow, 10:00 AM" },
    { company: "FinServe Inc", role: "UI Engineer", date: "Apr 12, 2:30 PM" },
  ];

  const careerTools = [
    {
      name: "Mock Interview",
      icon: <PlayCircle className="w-6 h-6 mb-2" />,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    {
      name: "Cover Letter",
      icon: <Edit3 className="w-6 h-6 mb-2" />,
      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      name: "Salary Insights",
      icon: <BarChart2 className="w-6 h-6 mb-2" />,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      name: "Job Tracker",
      icon: <Briefcase className="w-6 h-6 mb-2" />,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back, {displayName}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Let&apos;s keep your career momentum going today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="shrink-0">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}

          {isPrivileged && (
            <Link href="/learningresources">
              <Button variant="outline" className="shrink-0">
                <BookOpen className="w-4 h-4 mr-2" />
                Learning Resources
              </Button>
            </Link>
          )}

          <Link href="/profile">
            <Button variant="outline" className="shrink-0">
              <Edit3 className="w-4 h-4 mr-2" />
              My Profile
            </Button>
          </Link>
        </div>
      </div>

      {isAdmin && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Administrator Access Enabled
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You can manage registered users from the admin panel.
                </p>
              </div>
              <Link href="/admin">
                <Button>
                  Open Admin Panel
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {isPrivileged && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-emerald-200 dark:border-emerald-900/40 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-900">
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  Learning Resource Management
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Create, edit and manage articles and resume examples for users.
                </p>
              </div>
              <Link href="/learningresources">
                <Button>
                  Manage Resources
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-blue-600 text-white border-none h-full shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Resume Score <FileText className="w-5 h-5 text-blue-200" />
              </CardTitle>
              <CardDescription className="text-blue-200">
                Based on your latest upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold mb-4">
                85<span className="text-2xl text-blue-300">/100</span>
              </div>
              <Link href="/resume/feedback">
                <Button
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white border-none"
                >
                  View Full Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Upcoming Interviews <Calendar className="w-5 h-5 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {upcomingInterviews.length > 0 ? (
                <ul className="space-y-3">
                  {upcomingInterviews.map((interview, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                          {interview.company}
                        </p>
                        <p className="text-xs text-slate-500">{interview.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full whitespace-nowrap">
                          {interview.date}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No upcoming interviews scheduled.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Career Tools</CardTitle>
              <CardDescription>Quick access to your favorite tools.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {careerTools.map((tool) => (
                <div
                  key={tool.name}
                  className={`rounded-xl p-4 ${tool.color} flex flex-col items-center justify-center text-center`}
                >
                  {tool.icon}
                  <span className="text-sm font-semibold">{tool.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Your current access state from the backend.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="font-medium">Role:</span>{" "}
            <span className="capitalize">{user?.role}</span>
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <span>{user?.is_active ? "Active" : "Deactivated"}</span>
          </div>
          <div>
            <span className="font-medium">Created At:</span>{" "}
            <span>
              {user?.created_at ? new Date(user.created_at).toLocaleString() : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}