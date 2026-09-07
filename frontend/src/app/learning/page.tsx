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
    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
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
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      : difficulty === "Hard"
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";

  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${style}`}
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === "bn"
            ? "ফ্ল্যাশকার্ড"
            : "Flashcards"}
        </h2>

        <span className="text-sm text-slate-500">
          {index + 1} /{" "}
          {questions.length}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          setFlipped(
            (value) => !value
          )
        }
        className="w-full min-h-[300px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm text-left"
      >
        {!flipped ? (
          <div className="min-h-[240px] flex flex-col justify-between">
            <div className="flex justify-between gap-2">
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

            <p className="text-xl sm:text-2xl font-semibold text-center text-slate-900 dark:text-white">
              {question.question}
            </p>

            <p className="text-xs text-center text-slate-400">
              {language === "bn"
                ? "উত্তর দেখতে কার্ডে ক্লিক করুন"
                : "Click the card to view the answer"}
            </p>
          </div>
        ) : (
          <div className="min-h-[240px] flex flex-col justify-center">
            <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 text-center mb-4">
              {language === "bn"
                ? "নমুনা উত্তর"
                : "Sample Answer"}
            </p>

            <p className="text-lg text-slate-700 dark:text-slate-200 text-center leading-relaxed">
              {question.answer}
            </p>
          </div>
        )}
      </button>

      <div className="flex justify-center gap-3 mt-5">
        <Button
          variant="outline"
          onClick={previous}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          onClick={shuffle}
        >
          <Shuffle className="w-4 h-4 mr-2" />

          {language === "bn"
            ? "এলোমেলো"
            : "Shuffle"}
        </Button>

        <Button
          variant="outline"
          onClick={next}
        >
          <ChevronRight className="w-4 h-4" />
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
      <div className="relative mb-5">
        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

        <Input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder={
            language === "bn"
              ? "প্রশ্ন খুঁজুন..."
              : "Search questions..."
          }
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(
          (question, index) => (
            <Card
              key={`${question.question}-${index}`}
            >
              <CardContent className="p-5">
                <div className="flex gap-2 mb-4">
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

                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                  {question.question}
                </h3>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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

      if (
        !selectedJobTitle ||
        title !== selectedJobTitle
      ) {
        setError(
          currentLanguage === "bn"
            ? "অনুগ্রহ করে তালিকা থেকে একটি বৈধ পেশা নির্বাচন করুন।"
            : "Please select a valid job title from the search results."
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
    <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          {currentLanguage ===
          "bn"
            ? "ইন্টারভিউ প্রশ্ন"
            : "Interview Questions"}
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-400">
          {currentLanguage ===
          "bn"
            ? "আপনার পেশা নির্বাচন করুন এবং AI দিয়ে ইন্টারভিউ প্রশ্ন তৈরি করুন।"
            : "Search for a career and generate interview questions with AI."}
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />

          <Input
            value={jobTitle}
            onChange={(event) => {
              const value = event.target.value;

              setJobTitle(value);
              setError("");

              if (value !== selectedJobTitle) {
                setSelectedJobTitle("");
              }
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                selectedJobTitle &&
                jobTitle.trim() === selectedJobTitle &&
                !generating
              ) {
                generateQuestions();
              }
            }}
            placeholder={
              currentLanguage ===
              "bn"
                ? "পেশা খুঁজুন..."
                : "Search job title..."
            }
            className="h-14 pl-12 pr-36 text-base rounded-xl"
          />

          <Button
            onClick={
              generateQuestions
            }
            disabled={
              generating ||
              !selectedJobTitle ||
              jobTitle.trim() !== selectedJobTitle
            }
            className="absolute right-2 top-2 h-10"
          >
            <Sparkles className="w-4 h-4 mr-2" />

            {generating
              ? currentLanguage ===
                "bn"
                ? "তৈরি হচ্ছে..."
                : "Generating..."
              : currentLanguage ===
                "bn"
              ? "প্রশ্ন তৈরি করুন"
              : "Generate"}
          </Button>

          {(searchingJobs ||
            suggestions.length >
              0) && (
            <div className="absolute z-30 left-0 right-0 mt-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
              {searchingJobs ? (
                <div className="px-4 py-3 text-sm text-slate-500">
                  {currentLanguage ===
                  "bn"
                    ? "পেশা খোঁজা হচ্ছে..."
                    : "Searching jobs..."}
                </div>
              ) : (
                suggestions.map(
                  (job) => (
                    <button
                      key={
                        job.uri ||
                        job.title
                      }
                      type="button"
                      onClick={() =>
                        chooseJob(
                          job
                        )
                      }
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">
                        {job.title}
                      </span>
                    </button>
                  )
                )
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
      </div>

      {questions.length >
        0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {generatedJobTitle
                  ? currentLanguage === "bn"
                    ? "প্রশ্ন তৈরি হয়েছে:"
                    : "Questions for:"
                  : currentLanguage === "bn"
                  ? "সাধারণ ইন্টারভিউ প্রস্তুতি"
                  : "General Interview Practice"}
              </p>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {generatedJobTitle ||
                  (currentLanguage === "bn"
                    ? "আচরণগত প্রশ্ন"
                    : "Behavioral Question Bank")}
              </h2>
            </div>

            <div className="flex gap-2">
              <Button
                variant={
                  activeMode ===
                  "flashcards"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setActiveMode(
                    "flashcards"
                  )
                }
              >
                <Layers className="w-4 h-4 mr-2" />

                {currentLanguage ===
                "bn"
                  ? "ফ্ল্যাশকার্ড"
                  : "Flashcards"}
              </Button>

              <Button
                variant={
                  activeMode ===
                  "bank"
                    ? "default"
                    : "outline"
                }
                onClick={() =>
                  setActiveMode(
                    "bank"
                  )
                }
              >
                <BookOpen className="w-4 h-4 mr-2" />

                {currentLanguage ===
                "bn"
                  ? "প্রশ্ন ব্যাংক"
                  : "Question Bank"}
              </Button>
            </div>
          </div>

          {activeMode ===
          "flashcards" ? (
            <Flashcards
              questions={
                questions
              }
              language={
                currentLanguage
              }
            />
          ) : (
            <QuestionBank
              questions={
                questions
              }
              language={
                currentLanguage
              }
            />
          )}
        </>
      )}
    </div>
  );
}