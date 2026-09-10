"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import {
  searchJobTitles,
  type JobSuggestion,
} from "../../lib/jobSearch";

import {
  Search,
  Sparkles,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Lightbulb,
  CheckCircle2,
  RotateCw,
  Target,
  GraduationCap,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

type SupportedLanguage = "en" | "bn";

type PracticeMode =
  | "flashcards"
  | "bank";

type InterviewQuestion = {
  category: string;
  difficulty: string;
  question: string;
  answer: string;
};

const DEFAULT_QUESTIONS_EN: InterviewQuestion[] = [
  {
    category: "Behavioral",
    difficulty: "Easy",
    question: "Tell me about yourself.",
    answer:
      "Give a short summary of your background, relevant experience, key strengths, and why you are interested in the role. Keep your answer focused on your professional journey rather than personal details.",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "Tell me about a time you faced a difficult challenge.",
    answer:
      "Use the STAR method. Explain the situation, the challenge you needed to solve, the actions you personally took, and the positive result or lesson you gained.",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "Tell me about a time you worked successfully in a team.",
    answer:
      "Describe the team goal, your specific responsibility, how you communicated or collaborated with others, and how your contribution helped the team achieve the outcome.",
  },
  {
    category: "Situational",
    difficulty: "Medium",
    question: "How would you handle a disagreement with a colleague?",
    answer:
      "Explain that you would stay professional, listen to their point of view, discuss the issue based on facts, look for common ground, and focus on reaching a solution that supports the team.",
  },
  {
    category: "Leadership",
    difficulty: "Medium",
    question: "Tell me about a time you took initiative.",
    answer:
      "Choose an example where you noticed a problem or opportunity without being asked. Explain what you did, why you acted, and what improvement or result came from your initiative.",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "Tell me about a mistake you made and what you learned from it.",
    answer:
      "Choose a genuine but manageable mistake. Take responsibility, explain how you corrected it, and focus on what you changed afterward to avoid repeating the same issue.",
  },
  {
    category: "HR / General",
    difficulty: "Easy",
    question: "What are your greatest strengths?",
    answer:
      "Choose two or three strengths that are relevant to the role and support each one with a short example showing how you have demonstrated it in work, study, or projects.",
  },
  {
    category: "HR / General",
    difficulty: "Medium",
    question: "What is one weakness you are currently working on?",
    answer:
      "Choose a real weakness that is not essential to the role. Explain what you are doing to improve it and show that you are actively making progress.",
  },
  {
    category: "Situational",
    difficulty: "Medium",
    question: "How do you manage multiple deadlines?",
    answer:
      "Explain how you prioritise tasks by urgency and importance, break larger work into smaller steps, track progress, communicate early if risks arise, and adjust priorities when necessary.",
  },
  {
    category: "HR / General",
    difficulty: "Easy",
    question: "Why do you want to work for this company?",
    answer:
      "Mention something specific about the company, role, products, values, or industry. Then connect it to your skills, interests, and career goals.",
  },
];

const DEFAULT_QUESTIONS_BN: InterviewQuestion[] = [
  {
    category: "Behavioral",
    difficulty: "Easy",
    question: "নিজের সম্পর্কে সংক্ষেপে বলুন।",
    answer:
      "আপনার শিক্ষা বা পেশাগত পটভূমি, প্রাসঙ্গিক অভিজ্ঞতা, প্রধান দক্ষতা এবং এই পদের প্রতি আগ্রহ সংক্ষেপে তুলে ধরুন। ব্যক্তিগত তথ্যের বদলে পেশাগত যাত্রায় গুরুত্ব দিন।",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "কঠিন কোনো চ্যালেঞ্জ মোকাবিলা করার একটি উদাহরণ বলুন।",
    answer:
      "STAR পদ্ধতি ব্যবহার করুন। পরিস্থিতি, আপনার কাজ, আপনি কী পদক্ষেপ নিয়েছিলেন এবং ফলাফল বা শেখার বিষয়টি ব্যাখ্যা করুন।",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "দলে সফলভাবে কাজ করার একটি অভিজ্ঞতা বলুন।",
    answer:
      "দলের লক্ষ্য, আপনার দায়িত্ব, কীভাবে অন্যদের সঙ্গে যোগাযোগ ও সহযোগিতা করেছেন এবং আপনার অবদান কীভাবে ফলাফলে সাহায্য করেছে তা ব্যাখ্যা করুন।",
  },
  {
    category: "Situational",
    difficulty: "Medium",
    question: "সহকর্মীর সঙ্গে মতবিরোধ হলে আপনি কীভাবে সামলাবেন?",
    answer:
      "পেশাদার আচরণ বজায় রাখুন, অন্য ব্যক্তির মতামত শুনুন, তথ্যভিত্তিক আলোচনা করুন, মিল খুঁজুন এবং দলের জন্য কার্যকর সমাধানের দিকে মনোযোগ দিন।",
  },
  {
    category: "Leadership",
    difficulty: "Medium",
    question: "আপনি উদ্যোগ নিয়েছিলেন এমন একটি অভিজ্ঞতা বলুন।",
    answer:
      "এমন একটি উদাহরণ দিন যেখানে আপনাকে বলা না হলেও আপনি একটি সমস্যা বা উন্নতির সুযোগ শনাক্ত করেছিলেন। আপনি কী করেছিলেন এবং কী ফলাফল এসেছিল তা ব্যাখ্যা করুন।",
  },
  {
    category: "Behavioral",
    difficulty: "Medium",
    question: "আপনি করা কোনো ভুল এবং সেখান থেকে কী শিখেছেন তা বলুন।",
    answer:
      "একটি বাস্তব কিন্তু নিয়ন্ত্রণযোগ্য ভুল বেছে নিন। দায়িত্ব স্বীকার করুন, কীভাবে ঠিক করেছিলেন এবং ভবিষ্যতে একই ভুল এড়াতে কী পরিবর্তন করেছেন তা বলুন।",
  },
  {
    category: "HR / General",
    difficulty: "Easy",
    question: "আপনার প্রধান শক্তিগুলো কী?",
    answer:
      "পদের সঙ্গে সম্পর্কিত দুই বা তিনটি শক্তি বেছে নিন এবং কাজ, পড়াশোনা বা প্রকল্পের ছোট উদাহরণ দিয়ে তা সমর্থন করুন।",
  },
  {
    category: "HR / General",
    difficulty: "Medium",
    question: "আপনার এমন একটি দুর্বলতা কী যা আপনি উন্নত করছেন?",
    answer:
      "এমন একটি বাস্তব দুর্বলতা বেছে নিন যা পদের জন্য অত্যন্ত গুরুত্বপূর্ণ নয়। কীভাবে উন্নতি করছেন এবং কী অগ্রগতি হয়েছে তা ব্যাখ্যা করুন।",
  },
  {
    category: "Situational",
    difficulty: "Medium",
    question: "একাধিক ডেডলাইন কীভাবে সামলান?",
    answer:
      "গুরুত্ব ও জরুরিতার ভিত্তিতে অগ্রাধিকার ঠিক করুন, বড় কাজ ছোট ধাপে ভাগ করুন, অগ্রগতি পর্যবেক্ষণ করুন এবং ঝুঁকি দেখা দিলে আগেই যোগাযোগ করুন।",
  },
  {
    category: "HR / General",
    difficulty: "Easy",
    question: "আপনি এই প্রতিষ্ঠানে কাজ করতে চান কেন?",
    answer:
      "প্রতিষ্ঠান, ভূমিকা, পণ্য, মূল্যবোধ বা শিল্প সম্পর্কে নির্দিষ্ট কিছু উল্লেখ করুন এবং তা আপনার দক্ষতা, আগ্রহ ও ক্যারিয়ার লক্ষ্যগুলোর সঙ্গে যুক্ত করুন।",
  },
];

const CATEGORY_LABELS: Record<
  string,
  { en: string; bn: string }
> = {
  Behavioral: {
    en: "Behavioral",
    bn: "আচরণগত",
  },

  Technical: {
    en: "Technical",
    bn: "প্রযুক্তিগত",
  },

  Situational: {
    en: "Situational",
    bn: "পরিস্থিতিভিত্তিক",
  },

  Leadership: {
    en: "Leadership",
    bn: "নেতৃত্ব",
  },

  "HR / General": {
    en: "HR / General",
    bn: "এইচআর / সাধারণ",
  },
};

const DIFFICULTY_LABELS: Record<
  string,
  { en: string; bn: string }
> = {
  Easy: {
    en: "Easy",
    bn: "সহজ",
  },

  Medium: {
    en: "Medium",
    bn: "মাঝারি",
  },

  Hard: {
    en: "Hard",
    bn: "কঠিন",
  },
};

function CategoryPill({
  category,
  language,
}: {
  category: string;
  language: SupportedLanguage;
}) {
  const label =
    CATEGORY_LABELS[category]?.[language] ||
    category;

  return (
    <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 shadow-xs">
      {label}
    </span>
  );
}

function DifficultyPill({
  difficulty,
  language,
}: {
  difficulty: string;
  language: SupportedLanguage;
}) {
  const label =
    DIFFICULTY_LABELS[difficulty]?.[
      language
    ] || difficulty;

  const style =
    difficulty === "Easy"
      ? "border-emerald-200 text-emerald-700 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300"
      : difficulty === "Hard"
      ? "border-rose-200 text-rose-700 bg-rose-50/80 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300"
      : "border-amber-200 text-amber-700 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300";

  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full border shadow-xs ${style}`}
    >
      {label}
    </span>
  );
}

function Flashcards({
  questions,
  language,
}: {
  questions: InterviewQuestion[];
  language: SupportedLanguage;
}) {
  const [index, setIndex] =
    useState(0);

  const [flipped, setFlipped] =
    useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [questions]);

  const question =
    questions[index];

  if (!question) {
    return null;
  }

  const previous = () => {
    setFlipped(false);

    setIndex(
      (current) =>
        (current - 1 + questions.length) %
        questions.length
    );
  };

  const next = () => {
    setFlipped(false);

    setIndex(
      (current) =>
        (current + 1) %
        questions.length
    );
  };

  const shuffle = () => {
    setFlipped(false);

    setIndex(
      Math.floor(
        Math.random() *
          questions.length
      )
    );
  };

  const progressPercent = Math.round(((index + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header & Progress Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === "bn"
              ? "ইন্টারেক্টিভ ফ্ল্যাশকার্ড"
              : "Interactive Flashcard"}
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
            {index + 1} / {questions.length}
          </span>
        </div>

        {/* Mini progress bar bubble */}
        <div className="w-full sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Interactive Card */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-teal-500/20 blur-xl opacity-70 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        <button
          type="button"
          onClick={() =>
            setFlipped(
              (value) => !value
            )
          }
          className="relative w-full min-h-[340px] rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 sm:p-10 shadow-xl text-left transition-all duration-300 hover:scale-[1.008] hover:border-blue-300 dark:hover:border-blue-700 active:scale-[0.995]"
        >
          {!flipped ? (
            <div className="min-h-[260px] flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <CategoryPill
                    category={
                      question.category
                    }
                    language={language}
                  />

                  <DifficultyPill
                    difficulty={
                      question.difficulty
                    }
                    language={language}
                  />
                </div>

                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  {language === "bn"
                    ? "ফ্লিপ করতে ক্লিক করুন"
                    : "Click to flip"}
                </span>
              </div>

              <div className="py-6">
                <p className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white leading-relaxed">
                  &ldquo;{question.question}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-center pt-2">
                <p className="text-xs font-medium text-center text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                  {language === "bn"
                    ? "নমুনা উত্তর ও কাঠামোগত কৌশল দেখতে ক্লিক করুন"
                    : "Click anywhere to reveal model answer & tips"}
                </p>
              </div>
            </div>
          ) : (
            <div className="min-h-[260px] flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {language === "bn"
                    ? "নমুনা উত্তর (STAR স্ট্রাকচার)"
                    : "Sample Answer (STAR Method)"}
                </span>

                <span className="text-xs text-slate-400">
                  {language === "bn" ? "প্রশ্নে ফিরতে ক্লিক করুন" : "Click to view question"}
                </span>
              </div>

              <div className="my-auto py-4">
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 text-left sm:text-center leading-relaxed font-normal">
                  {question.answer}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  💡 {language === "bn"
                    ? "পরামর্শ: স্পষ্ট উদাহরণ এবং পরিমাপযোগ্য ফলাফল উল্লেখ করুন।"
                    : "Tip: Highlight specific results, actions, and quantifiable achievements."}
                </p>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button
          variant="outline"
          onClick={previous}
          className="rounded-full px-5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4 mr-1.5" />
          {language === "bn" ? "আগেরটি" : "Previous"}
        </Button>

        <Button
          variant="outline"
          onClick={shuffle}
          className="rounded-full px-5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          <Shuffle className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" />
          {language === "bn"
            ? "এলোমেলো"
            : "Shuffle"}
        </Button>

        <Button
          variant="outline"
          onClick={next}
          className="rounded-full px-5 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs"
        >
          {language === "bn" ? "পরেরটি" : "Next"}
          <ChevronRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}

function QuestionBank({
  questions,
  language,
}: {
  questions: InterviewQuestion[];
  language: SupportedLanguage;
}) {
  const [search, setSearch] =
    useState("");

  const filtered =
    questions.filter((item) => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return true;
      }

      return (
        item.question
          .toLowerCase()
          .includes(value) ||
        item.answer
          .toLowerCase()
          .includes(value)
      );
    });

  return (
    <div>
      <div className="relative mb-6 max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder={
            language === "bn"
              ? "প্রশ্ন বা উত্তর খুঁজুন..."
              : "Search questions or answers..."
          }
          className="pl-11 h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm focus:ring-2 focus:ring-blue-500/20"
        />

        {search && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {filtered.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map(
          (question, index) => (
            <Card
              key={`${question.question}-${index}`}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-800 transition-all duration-200 flex flex-col justify-between"
            >
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <CategoryPill
                    category={
                      question.category
                    }
                    language={
                      language
                    }
                  />

                  <DifficultyPill
                    difficulty={
                      question.difficulty
                    }
                    language={
                      language
                    }
                  />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                  {question.question}
                </h3>

                <div className="rounded-xl bg-slate-50/80 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-800/80 mt-auto">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {language === "bn"
                      ? "নমুনা উত্তর"
                      : "Sample Answer"}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {question.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

export default function InterviewQuestionsPage() {
  const { language } =
    useLanguage();

  const { token } =
    useAuth();

  const currentLanguage: SupportedLanguage =
    language === "bn"
      ? "bn"
      : "en";

  const defaultQuestions =
    currentLanguage === "bn"
      ? DEFAULT_QUESTIONS_BN
      : DEFAULT_QUESTIONS_EN;

  const [jobTitle, setJobTitle] =
    useState("");

  const [
    selectedJobTitle,
    setSelectedJobTitle,
  ] = useState("");

  const [
    suggestions,
    setSuggestions,
  ] = useState<JobSuggestion[]>([]);

  const [
    searchingJobs,
    setSearchingJobs,
  ] = useState(false);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    questions,
    setQuestions,
  ] = useState<
    InterviewQuestion[]
  >(DEFAULT_QUESTIONS_EN);

  const [
    generatedJobTitle,
    setGeneratedJobTitle,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [
    activeMode,
    setActiveMode,
  ] =
    useState<PracticeMode>(
      "flashcards"
    );

  useEffect(() => {
    if (!generatedJobTitle) {
      setQuestions(defaultQuestions);
    }
  }, [
    currentLanguage,
    generatedJobTitle,
  ]);

  useEffect(() => {
    const query =
      jobTitle.trim();

    if (
      query.length < 2 ||
      query === selectedJobTitle
    ) {
      setSuggestions([]);
      setSearchingJobs(false);
      return;
    }

    const timer =
      setTimeout(async () => {
        try {
          setSearchingJobs(true);

          const results =
            await searchJobTitles(
              query,
              token
            );

          setSuggestions(
            results.slice(0, 6)
          );
        } catch {
          setSuggestions([]);
        } finally {
          setSearchingJobs(false);
        }
      }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    jobTitle,
    token,
    selectedJobTitle,
  ]);

  const chooseJob = (
    job: JobSuggestion
  ) => {
    setJobTitle(job.title);
    setSelectedJobTitle(
      job.title
    );
    setSuggestions([]);
    setError("");
  };

  const generateQuestions =
    async () => {
      const title =
        jobTitle.trim();

      if (!title) {
        setError(
          currentLanguage === "bn"
            ? "অনুগ্রহ করে একটি চাকরির পদ নির্বাচন করুন।"
            : "Please select a job title."
        );

        return;
      }

      if (!token) {
        setError(
          currentLanguage === "bn"
            ? "প্রশ্ন তৈরি করতে লগ ইন করুন।"
            : "Please log in to generate questions."
        );

        return;
      }

      try {
        setGenerating(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE_URL}/interview/questions`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  jobTitle:
                    title,

                  language:
                    currentLanguage,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to generate questions."
          );
        }

        setQuestions(
          Array.isArray(
            data.questions
          )
            ? data.questions
            : []
        );

        setGeneratedJobTitle(
          title
        );

        setActiveMode(
          "flashcards"
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate questions."
        );
      } finally {
        setGenerating(false);
      }
    };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Background Ambient Glows */}
      <div className="relative mb-10 text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          {currentLanguage === "bn"
            ? "শিক্ষার্থীদের ইন্টারভিউ প্রস্তুতি স্টুডিও"
            : "Student Interview Prep Studio"}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {currentLanguage === "bn"
            ? "ইন্টারভিউ প্রশ্ন ও মডেল উত্তর"
            : "AI Interview Practice & Flashcards"}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {currentLanguage === "bn"
            ? "আপনার লক্ষ্য পেশা নির্বাচন করুন এবং শীর্ষস্থানীয় নিয়োগকারী প্রতিষ্ঠানের বাস্তব প্রশ্ন ও STAR কাঠামোর নমুনা উত্তর অনুশীলন করুন।"
            : "Search your target role to generate tailored interview questions and master the STAR response technique."}
        </p>
      </div>

      {/* Search & AI Generation Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 p-2 shadow-xl shadow-blue-950/5 transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
          <div className="relative flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

            <Input
              value={jobTitle}
              onChange={(event) => {
                const value = event.target.value;
                setJobTitle(value);
                if (value !== selectedJobTitle) {
                  setSelectedJobTitle("");
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  generateQuestions();
                }
              }}
              placeholder={
                currentLanguage === "bn"
                  ? "পেশা খুঁজুন (যেমন: Software Engineer, Marketing)..."
                  : "Search job title (e.g. Software Engineer, Marketing)..."
              }
              className="h-13 pl-12 pr-36 text-base rounded-xl border-0 shadow-none focus-visible:ring-0 bg-transparent"
            />

            <Button
              onClick={generateQuestions}
              disabled={generating || !jobTitle.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-10 px-5 rounded-xl font-medium shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {generating
                ? currentLanguage === "bn"
                  ? "তৈরি হচ্ছে..."
                  : "Generating..."
                : currentLanguage === "bn"
                ? "প্রশ্ন তৈরি করুন"
                : "Generate"}
            </Button>
          </div>

          {/* Autocomplete Dropdown */}
          {(searchingJobs || suggestions.length > 0) && (
            <div className="absolute z-30 left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
              {searchingJobs ? (
                <div className="flex items-center gap-2 px-5 py-4 text-sm text-slate-500">
                  <RotateCw className="w-4 h-4 animate-spin text-blue-500" />
                  {currentLanguage === "bn"
                    ? "পেশা খোঁজা হচ্ছে..."
                    : "Searching matching occupations..."}
                </div>
              ) : (
                suggestions.map((job) => (
                  <button
                    key={job.uri || job.title}
                    type="button"
                    onClick={() => chooseJob(job)}
                    className="w-full text-left px-5 py-3.5 hover:bg-blue-50/60 dark:hover:bg-slate-800/80 border-b last:border-b-0 border-slate-100 dark:border-slate-800 flex items-center justify-between group transition-colors"
                  >
                    <span className="font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {job.title}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-xs text-slate-400 font-medium">
            {currentLanguage === "bn" ? "জনপ্রিয় পেশা:" : "Popular:"}
          </span>
          {[
            "Software Engineer",
            "Data Analyst",
            "Business Analyst",
            "Marketing Specialist",
          ].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => {
                setJobTitle(role);
                setSelectedJobTitle(role);
              }}
              className="text-xs px-3 py-1 rounded-full bg-slate-100/80 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800/80 dark:hover:bg-blue-950/40 dark:hover:text-blue-300 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            >
              {role}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-sm text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}
      </div>

      {/* STAR Framework Student Helper Banner */}
      <div className="mb-10 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {currentLanguage === "bn"
              ? "STAR মেথড - বিশ্বমানের ইন্টারভিউ উত্তর কাঠামো"
              : "Mastering the STAR Method for Behavioral Interviews"}
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              S
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
              {currentLanguage === "bn" ? "Situation" : "Situation"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentLanguage === "bn" ? "প্রেক্ষাপট সংক্ষেপে ব্যাখ্যা করুন" : "Set the scene and context"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              T
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
              {currentLanguage === "bn" ? "Task" : "Task"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentLanguage === "bn" ? "আপনার দায়িত্ব ও লক্ষ্য চিহ্নিত করুন" : "Describe the required goal"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              A
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
              {currentLanguage === "bn" ? "Action" : "Action"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentLanguage === "bn" ? "আপনি নিজে কী পদক্ষেপ নিয়েছিলেন" : "Explain steps you personally took"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              R
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
              {currentLanguage === "bn" ? "Result" : "Result"}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {currentLanguage === "bn" ? "পরিমাপযোগ্য ফলাফল ও কী শিখলেন" : "Share the positive outcome"}
            </p>
          </div>
        </div>
      </div>

      {/* Questions Section */}
      {questions.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                {generatedJobTitle
                  ? currentLanguage === "bn"
                    ? "প্রশ্ন তৈরি হয়েছে"
                    : "Questions for"
                  : currentLanguage === "bn"
                  ? "সাধারণ প্রস্তুতি"
                  : "General Practice"}
              </p>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {generatedJobTitle ||
                  (currentLanguage === "bn"
                    ? "আচরণগত প্রশ্ন ব্যাংক"
                    : "Behavioral Question Bank")}
              </h2>
            </div>

            {/* Mode Switcher Pills */}
            <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setActiveMode("flashcards")}
                className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeMode === "flashcards"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1.5" />
                {currentLanguage === "bn" ? "ফ্ল্যাশকার্ড" : "Flashcards"}
              </button>

              <button
                type="button"
                onClick={() => setActiveMode("bank")}
                className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeMode === "bank"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                {currentLanguage === "bn" ? "প্রশ্ন ব্যাংক" : "Question Bank"}
              </button>
            </div>
          </div>

          {activeMode === "flashcards" ? (
            <Flashcards
              questions={questions}
              language={currentLanguage}
            />
          ) : (
            <QuestionBank
              questions={questions}
              language={currentLanguage}
            />
          )}
        </>
      )}
    </div>
  );
}