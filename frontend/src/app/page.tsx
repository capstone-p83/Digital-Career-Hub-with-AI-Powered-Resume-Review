"use client";

import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { ArrowRight, BookOpen, FileText, Bot, Briefcase } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    {
      title: "AI Resume Review",
      description: "Get instant, actionable feedback on your resume powered by advanced AI.",
      icon: <FileText className="w-10 h-10 text-blue-600 mb-4" />,
      href: "/resume"
    },
    {
      title: "Career Resources",
      description: "Access a curated library of interview guides, skillset roadmaps, and more.",
      icon: <BookOpen className="w-10 h-10 text-blue-600 mb-4" />,
      href: "/resources"
    },
    {
      title: "AI Assistant",
      description: "Chat with our intelligent career bot for personalized advice and answers.",
      icon: <Bot className="w-10 h-10 text-blue-600 mb-4" />,
      href: "/chatbot"
    }
  ];

  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden bg-cover bg-center" 
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 drop-shadow-md">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link href="/resume">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base group">
                  {t("cta.upload")}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/chatbot">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base">
                  {t("cta.askAI")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Everything you need to land your dream job
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Our platform provides the modern tools necessary for today's competitive job market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={feature.href} className="block h-full transition-transform hover:-translate-y-2">
                  <Card className="h-full border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                    <CardHeader>
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}