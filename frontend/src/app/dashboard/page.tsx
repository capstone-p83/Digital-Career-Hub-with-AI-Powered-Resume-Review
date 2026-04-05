"use client";

import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { 
  FileText, Bookmark, Clock, ArrowRight, 
  Calendar, Briefcase, PlayCircle, BarChart2, Edit3 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
        <h2 className="text-2xl font-bold">Please log in to view your dashboard</h2>
        <Link href="/login">
          <Button>Log In</Button>
        </Link>
      </div>
    );
  }

  const activities = [
    { title: "Uploaded Software Engineer Resume", date: "2 days ago", icon: <FileText className="text-blue-500 w-5 h-5" /> },
    { title: "Viewed 'Top 10 React Interview Questions'", date: "3 days ago", icon: <Clock className="text-slate-500 w-5 h-5" /> }
  ];

  const savedResources = [
    { title: "Ultimate Guide to System Design", category: "Interview Prep" },
    { title: "Cold Email Templates that Work", category: "Networking" },
    { title: "Navigating Tech Layoffs", category: "Job Search" }
  ];

  const upcomingInterviews = [
    { company: "TechNova Corp", role: "Frontend Dev", date: "Tomorrow, 10:00 AM" },
    { company: "FinServe Inc", role: "UI Engineer", date: "Apr 12, 2:30 PM" }
  ];

  const careerTools = [
    { name: "Mock Interview", icon: <PlayCircle className="w-6 h-6 mb-2" />, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { name: "Cover Letter", icon: <Edit3 className="w-6 h-6 mb-2" />, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { name: "Salary Insights", icon: <BarChart2 className="w-6 h-6 mb-2" />, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    { name: "Job Tracker", icon: <Briefcase className="w-6 h-6 mb-2" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" }
  ];

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Let's keep your career momentum going today.
          </p>
        </div>
        <Button variant="outline" className="shrink-0">
          <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-blue-600 text-white border-none h-full shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                Resume Score <FileText className="w-5 h-5 text-blue-200" />
              </CardTitle>
              <CardDescription className="text-blue-200">Based on your latest upload</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold mb-4">85<span className="text-2xl text-blue-300">/100</span></div>
              <Link href="/resume/feedback">
                <Button variant="outline" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white border-none">
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
                    <li key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{interview.company}</p>
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
                <p className="text-sm text-slate-500 py-4 text-center">No upcoming interviews scheduled.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full border-blue-200 dark:border-blue-900/40 bg-gradient-to-b from-white to-blue-50/50 dark:from-slate-950 dark:to-blue-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Need Advice?</CardTitle>
              <CardDescription>Chat instantly with our AI</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 flex flex-col justify-between h-[calc(100%-70px)]">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Practice interview questions or get quick tips on negotiating your salary!
              </p>
              <Link href="/chatbot" className="mt-auto">
                <Button className="w-full">
                  Start Chatting <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Career Tools */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Premium Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {careerTools.map((tool, idx) => (
            <motion.div key={idx} whileHover={{ y: -3 }}>
              <button className="w-full flex flex-col items-center justify-center p-4 h-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all group">
                <div className={`p-2 rounded-full mb-2 transition-transform group-hover:scale-110 ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{tool.name}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Row: Activity & Bookmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {activities.map((activity, idx) => (
                <li key={idx} className="flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.date}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bookmark className="mr-2 w-5 h-5 text-blue-600" /> Saved Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedResources.length > 0 ? (
              <ul className="space-y-3">
                {savedResources.map((res, idx) => (
                  <li key={idx} className="group flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-slate-800 transition">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider mb-0.5">{res.category}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:underline">{res.title}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p>No saved resources yet.</p>
                <Link href="/resources" className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-block">
                  Browse Resources
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
