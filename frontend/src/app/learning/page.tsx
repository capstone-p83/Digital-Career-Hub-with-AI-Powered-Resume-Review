"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Layers,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shuffle,
} from "lucide-react";

type PracticeModeId = "flashcards" | "bank";

type SupportedLanguage = "en" | "bn";

type LocalizedText = {
  en: string;
  bn: string;
};

type Difficulty = "Easy" | "Medium" | "Hard";

const PRACTICE_MODES: {
  id: PracticeModeId;
  label: LocalizedText;
  description: LocalizedText;
  icon: typeof Layers;
  accent: "blue" | "emerald";
}[] = [
  {
    id: "flashcards",
    label: {
      en: "Flashcards",
      bn: "ফ্ল্যাশকার্ড",
    },
    description: {
      en: "Flip through interview questions and sample answers",
      bn: "ইন্টারভিউ প্রশ্ন এবং নমুনা উত্তর অনুশীলন করুন",
    },
    icon: Layers,
    accent: "blue",
  },
  {
    id: "bank",
    label: {
      en: "Question Bank",
      bn: "প্রশ্ন ব্যাংক",
    },
    description: {
      en: "Browse common interview questions and answers",
      bn: "সাধারণ ইন্টারভিউ প্রশ্ন এবং উত্তর দেখুন",
    },
    icon: BookOpen,
    accent: "emerald",
  },
];

const ACCENT_STYLES: Record<
  string,
  {
    bg: string;
    border: string;
    softBg: string;
  }
> = {
  blue: {
    bg: "bg-blue-600",
    border: "border-blue-200 dark:border-blue-900",
    softBg: "bg-blue-50 dark:bg-slate-800",
  },
  emerald: {
    bg: "bg-emerald-600",
    border: "border-emerald-200 dark:border-emerald-900",
    softBg: "bg-emerald-50 dark:bg-slate-800",
  },
};

const CATEGORY_LABELS: Record<string, LocalizedText> = {
  All: {
    en: "All",
    bn: "সব",
  },
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

const DIFFICULTY_LABELS: Record<Difficulty, LocalizedText> = {
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

const FLASHCARD_DECK = [
  {
    id: 1,
    category: "Behavioral",
    difficulty: "Easy" as Difficulty,
    question: {
      en: "Tell me about yourself.",
      bn: "আপনার সম্পর্কে কিছু বলুন।",
    },
    answer: {
      en: "Give a 60–90 second overview of your current role, one or two relevant achievements, and why you are interested in this opportunity. Keep the answer focused on your career rather than reading your entire resume.",
      bn: "৬০–৯০ সেকেন্ডের মধ্যে আপনার বর্তমান ভূমিকা, এক বা দুটি প্রাসঙ্গিক অর্জন এবং কেন আপনি এই সুযোগে আগ্রহী তা সংক্ষেপে বলুন। পুরো রিজিউম পড়ে শোনানোর পরিবর্তে আপনার ক্যারিয়ারের গুরুত্বপূর্ণ বিষয়গুলোর ওপর গুরুত্ব দিন।",
    },
  },
  {
    id: 2,
    category: "Behavioral",
    difficulty: "Medium" as Difficulty,
    question: {
      en: "Describe a time you disagreed with a manager. What did you do?",
      bn: "এমন একটি সময়ের কথা বলুন যখন আপনি একজন ম্যানেজারের সঙ্গে একমত ছিলেন না। আপনি কী করেছিলেন?",
    },
    answer: {
      en: "Use the STAR method. Explain the situation, how you respectfully communicated your different opinion, the evidence or reasoning you provided, and the final outcome.",
      bn: "STAR পদ্ধতি ব্যবহার করুন। পরিস্থিতি ব্যাখ্যা করুন, কীভাবে সম্মানের সঙ্গে আপনার ভিন্ন মতামত জানিয়েছিলেন, কী যুক্তি বা প্রমাণ দিয়েছিলেন এবং শেষ পর্যন্ত কী ফল হয়েছিল তা বলুন।",
    },
  },
  {
    id: 3,
    category: "Technical",
    difficulty: "Medium" as Difficulty,
    question: {
      en: "How would you explain an API to a non-technical person?",
      bn: "একজন প্রযুক্তিগত জ্ঞান নেই এমন ব্যক্তিকে আপনি কীভাবে API ব্যাখ্যা করবেন?",
    },
    answer: {
      en: "Use a simple everyday analogy. For example, a restaurant menu can represent an API: you choose what you want from the menu without needing to understand how the kitchen prepares it.",
      bn: "সহজ দৈনন্দিন একটি উদাহরণ ব্যবহার করুন। যেমন, রেস্টুরেন্টের মেনুকে API হিসেবে ভাবা যায়। আপনি মেনু থেকে প্রয়োজনীয় জিনিস অর্ডার করেন, কিন্তু রান্নাঘর কীভাবে সেটি তৈরি করছে তা জানার প্রয়োজন হয় না।",
    },
  },
  {
    id: 4,
    category: "Situational",
    difficulty: "Hard" as Difficulty,
    question: {
      en: "A project is behind schedule and the client is unhappy. What's your first move?",
      bn: "একটি প্রকল্প নির্ধারিত সময়ের পিছিয়ে গেছে এবং ক্লায়েন্ট অসন্তুষ্ট। আপনার প্রথম পদক্ষেপ কী হবে?",
    },
    answer: {
      en: "First identify the real cause of the delay and confirm the remaining work with the team. Then give the client a clear and honest update together with realistic options for moving forward.",
      bn: "প্রথমে বিলম্বের প্রকৃত কারণ খুঁজে বের করুন এবং দলের সঙ্গে বাকি কাজ নিশ্চিত করুন। এরপর ক্লায়েন্টকে পরিষ্কার ও সৎ আপডেট দিন এবং সামনে এগিয়ে যাওয়ার বাস্তবসম্মত বিকল্প উপস্থাপন করুন।",
    },
  },
  {
    id: 5,
    category: "Leadership",
    difficulty: "Medium" as Difficulty,
    question: {
      en: "How do you handle an underperforming team member?",
      bn: "দলের কোনো সদস্য প্রত্যাশা অনুযায়ী কাজ না করলে আপনি কীভাবে পরিস্থিতি সামলাবেন?",
    },
    answer: {
      en: "Have a private and respectful conversation about the performance gap, agree on clear expectations, and offer appropriate support. Review their progress and escalate only if the situation does not improve.",
      bn: "কর্মদক্ষতার ঘাটতি নিয়ে ব্যক্তিগত ও সম্মানজনকভাবে আলোচনা করুন, পরিষ্কার প্রত্যাশা নির্ধারণ করুন এবং প্রয়োজনীয় সহায়তা দিন। তাদের অগ্রগতি পর্যালোচনা করুন এবং উন্নতি না হলে পরবর্তী পদক্ষেপ নিন।",
    },
  },
  {
    id: 6,
    category: "HR / General",
    difficulty: "Easy" as Difficulty,
    question: {
      en: "Why do you want to work here?",
      bn: "আপনি কেন এখানে কাজ করতে চান?",
    },
    answer: {
      en: "Connect something specific about the company, role, or mission with your own skills, experience, or career goals. Avoid giving an answer that could apply to any company.",
      bn: "কোম্পানি, পদের দায়িত্ব বা প্রতিষ্ঠানের লক্ষ্য সম্পর্কে নির্দিষ্ট কোনো বিষয়ের সঙ্গে আপনার দক্ষতা, অভিজ্ঞতা বা ক্যারিয়ার লক্ষ্যের সম্পর্ক দেখান। এমন সাধারণ উত্তর এড়িয়ে চলুন যা যেকোনো কোম্পানির জন্য ব্যবহার করা যায়।",
    },
  },
  {
    id: 7,
    category: "Technical",
    difficulty: "Hard" as Difficulty,
    question: {
      en: "How do you decide when to optimize for speed versus code quality?",
      bn: "কখন দ্রুত কাজ শেষ করা এবং কখন কোডের গুণগত মানকে অগ্রাধিকার দেওয়া উচিত তা আপনি কীভাবে সিদ্ধান্ত নেন?",
    },
    answer: {
      en: "Consider the risk and long-term impact. Moving quickly can be appropriate for low-risk and easily reversible work, while important or difficult-to-reverse systems usually require more attention to code quality.",
      bn: "ঝুঁকি এবং দীর্ঘমেয়াদি প্রভাব বিবেচনা করুন। কম ঝুঁকিপূর্ণ এবং সহজে পরিবর্তনযোগ্য কাজে দ্রুত এগোনো যেতে পারে, কিন্তু গুরুত্বপূর্ণ বা পরে পরিবর্তন করা কঠিন এমন সিস্টেমে কোডের গুণগত মানকে বেশি গুরুত্ব দেওয়া উচিত।",
    },
  },
  {
    id: 8,
    category: "Situational",
    difficulty: "Medium" as Difficulty,
    question: {
      en: "You realize you made a mistake that affected a colleague's work. What do you do?",
      bn: "আপনি বুঝতে পারলেন যে আপনার একটি ভুল সহকর্মীর কাজে প্রভাব ফেলেছে। আপনি কী করবেন?",
    },
    answer: {
      en: "Take responsibility immediately, inform the affected colleague, explain what happened clearly, and focus on correcting the problem. Show what you will do to prevent the same mistake in the future.",
      bn: "তাৎক্ষণিকভাবে দায়িত্ব স্বীকার করুন, প্রভাবিত সহকর্মীকে জানান, কী ঘটেছে তা পরিষ্কারভাবে ব্যাখ্যা করুন এবং সমস্যাটি সমাধানে মনোযোগ দিন। একই ভুল ভবিষ্যতে যেন না ঘটে সে জন্য কী করবেন তাও জানান।",
    },
  },
];

const QUESTION_BANK = [
  ...FLASHCARD_DECK.map((card) => ({
    id: `q-${card.id}`,
    question: card.question,
    category: card.category,
    difficulty: card.difficulty,
    answer: card.answer,
  })),
  {
    id: "q-9",
    question: {
      en: "What's your greatest professional weakness?",
      bn: "আপনার সবচেয়ে বড় পেশাগত দুর্বলতা কী?",
    },
    category: "HR / General",
    difficulty: "Easy" as Difficulty,
    answer: {
      en: "Choose a genuine weakness that does not prevent you from performing the core responsibilities of the role. Show self-awareness and explain the specific steps you are taking to improve.",
      bn: "এমন একটি বাস্তব দুর্বলতা বেছে নিন যা পদের প্রধান দায়িত্ব পালনে বাধা সৃষ্টি করে না। নিজের দুর্বলতা সম্পর্কে সচেতনতা দেখান এবং উন্নতির জন্য আপনি কী নির্দিষ্ট পদক্ষেপ নিচ্ছেন তা ব্যাখ্যা করুন।",
    },
  },
  {
    id: "q-10",
    question: {
      en: "Walk me through how you'd design a URL shortener.",
      bn: "আপনি কীভাবে একটি URL shortener ডিজাইন করবেন তা ব্যাখ্যা করুন।",
    },
    category: "Technical",
    difficulty: "Hard" as Difficulty,
    answer: {
      en: "Start by defining the requirements. Then discuss the data model, how short URLs would be generated, how collisions would be handled, and how the system could scale for a large number of reads and writes.",
      bn: "প্রথমে সিস্টেমের প্রয়োজনীয়তা নির্ধারণ করুন। এরপর ডেটা মডেল, কীভাবে ছোট URL তৈরি হবে, একই URL তৈরি হওয়ার সমস্যা কীভাবে সামলানো হবে এবং অনেক read ও write request পরিচালনার জন্য সিস্টেম কীভাবে scale করবে তা আলোচনা করুন।",
    },
  },
  {
    id: "q-11",
    question: {
      en: "Tell me about a time you had to influence someone without authority.",
      bn: "এমন একটি সময়ের কথা বলুন যখন আনুষ্ঠানিক কর্তৃত্ব ছাড়াই আপনাকে কাউকে প্রভাবিত করতে হয়েছিল।",
    },
    category: "Leadership",
    difficulty: "Medium" as Difficulty,
    answer: {
      en: "Explain how you understood the other person's perspective, built trust, and used evidence or communication to gain support. Focus on how you influenced the decision rather than relying on authority.",
      bn: "অন্য ব্যক্তির দৃষ্টিভঙ্গি কীভাবে বুঝেছিলেন, বিশ্বাস তৈরি করেছিলেন এবং যুক্তি, প্রমাণ বা যোগাযোগের মাধ্যমে সমর্থন অর্জন করেছিলেন তা ব্যাখ্যা করুন। কর্তৃত্বের পরিবর্তে আপনি কীভাবে সিদ্ধান্তকে প্রভাবিত করেছিলেন সেটির ওপর গুরুত্ব দিন।",
    },
  },
];

function getLocalizedText(
  value: LocalizedText,
  language: SupportedLanguage
) {
  return language === "bn" ? value.bn : value.en;
}

function getCategoryLabel(
  category: string,
  language: SupportedLanguage
) {
  const translation = CATEGORY_LABELS[category];

  if (!translation) {
    return category;
  }

  return getLocalizedText(translation, language);
}

function DifficultyPill({
  difficulty,
  language,
}: {
  difficulty: Difficulty;
  language: SupportedLanguage;
}) {
  const styles: Record<Difficulty, string> = {
    Easy: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    Medium:
      "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    Hard: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  };

  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${styles[difficulty]}`}
    >
      {getLocalizedText(DIFFICULTY_LABELS[difficulty], language)}
    </span>
  );
}

function FlashcardsPanel({
  language,
}: {
  language: SupportedLanguage;
}) {
  const categories = [
    "All",
    ...Array.from(
      new Set(FLASHCARD_DECK.map((card) => card.category))
    ),
  ];

  const [categoryFilter, setCategoryFilter] = useState("All");

  const deck =
    categoryFilter === "All"
      ? FLASHCARD_DECK
      : FLASHCARD_DECK.filter(
          (card) => card.category === categoryFilter
        );

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [categoryFilter]);

  const card = deck[index] ?? deck[0];

  const goNext = () => {
    setFlipped(false);

    setIndex((current) => (current + 1) % deck.length);
  };

  const goPrev = () => {
    setFlipped(false);

    setIndex(
      (current) => (current - 1 + deck.length) % deck.length
    );
  };

  const goShuffle = () => {
    setFlipped(false);

    setIndex(Math.floor(Math.random() * deck.length));
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {language === "bn" ? "ফ্ল্যাশকার্ড" : "Flashcards"}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === "bn"
              ? "প্রশ্নটি পড়ুন, নিজের উত্তর নিয়ে ভাবুন, তারপর কার্ডটি উল্টে নমুনা উত্তর দেখুন।"
              : "Read the question, think about your answer, then flip the card to view a sample answer."}
          </p>
        </div>

        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {index + 1} / {deck.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => (
          <Button
            key={category}
            variant={
              categoryFilter === category
                ? "default"
                : "outline"
            }
            size="sm"
            className="h-8 text-sm whitespace-nowrap"
            onClick={() => setCategoryFilter(category)}
          >
            {getCategoryLabel(category, language)}
          </Button>
        ))}
      </div>

      <div className="max-w-xl mx-auto [perspective:1400px]">
        <button
          onClick={() => setFlipped((current) => !current)}
          aria-label={
            language === "bn"
              ? "ফ্ল্যাশকার্ড উল্টান"
              : "Flip flashcard"
          }
          className="relative w-full h-72 sm:h-80 rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <div
            className="absolute inset-0 h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
            style={{
              transform: flipped
                ? "rotateY(180deg)"
                : "rotateY(0deg)",
            }}
          >
            <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400">
                  {getCategoryLabel(card.category, language)}
                </span>

                <DifficultyPill
                  difficulty={card.difficulty}
                  language={language}
                />
              </div>

              <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white text-center px-2">
                {getLocalizedText(card.question, language)}
              </p>

              <p className="text-xs text-slate-400 text-center">
                {language === "bn"
                  ? "নমুনা উত্তর দেখতে কার্ডে ক্লিক করুন"
                  : "Click the card to view the sample answer"}
              </p>
            </div>

            <div
              className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-slate-800 p-8 flex flex-col justify-center gap-3"
              style={{
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 text-center">
                {language === "bn"
                  ? "নমুনা উত্তর"
                  : "Sample Answer"}
              </p>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 text-center leading-relaxed overflow-y-auto max-h-44">
                {getLocalizedText(card.answer, language)}
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={goPrev}
            aria-label={
              language === "bn"
                ? "আগের প্রশ্ন"
                : "Previous question"
            }
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4"
            onClick={goShuffle}
          >
            <Shuffle className="w-4 h-4 mr-2" />

            {language === "bn"
              ? "এলোমেলো"
              : "Shuffle"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 p-0"
            onClick={goNext}
            aria-label={
              language === "bn"
                ? "পরবর্তী প্রশ্ন"
                : "Next question"
            }
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionBankPanel({
  language,
}: {
  language: SupportedLanguage;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    ...Array.from(
      new Set(
        QUESTION_BANK.map(
          (question) => question.category
        )
      )
    ),
  ];

  const filtered = QUESTION_BANK.filter((question) => {
    const search = searchTerm.trim().toLowerCase();

    const questionText = getLocalizedText(
      question.question,
      language
    ).toLowerCase();

    const answerText = getLocalizedText(
      question.answer,
      language
    ).toLowerCase();

    const matchesSearch =
      !search ||
      questionText.includes(search) ||
      answerText.includes(search);

    const matchesCategory =
      categoryFilter === "All" ||
      question.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === "bn"
            ? "প্রশ্ন ব্যাংক"
            : "Question Bank"}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          {language === "bn"
            ? "সাধারণ ইন্টারভিউ প্রশ্ন এবং নমুনা উত্তর দেখুন।"
            : "Browse common interview questions and sample answers."}
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

        <Input
          placeholder={
            language === "bn"
              ? "প্রশ্ন খুঁজুন..."
              : "Search questions..."
          }
          className="pl-10 h-10"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={
              categoryFilter === category
                ? "default"
                : "outline"
            }
            size="sm"
            className="h-8 text-sm whitespace-nowrap"
            onClick={() =>
              setCategoryFilter(category)
            }
          >
            {getCategoryLabel(category, language)}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((question) => (
            <Card
              key={question.id}
              className="border-slate-200 dark:border-slate-800"
            >
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-emerald-600 bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400">
                    {getCategoryLabel(
                      question.category,
                      language
                    )}
                  </span>

                  <DifficultyPill
                    difficulty={question.difficulty}
                    language={language}
                  />
                </div>

                <h3 className="font-semibold text-slate-900 dark:text-white leading-snug mb-4">
                  {getLocalizedText(
                    question.question,
                    language
                  )}
                </h3>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    {language === "bn"
                      ? "নমুনা উত্তর"
                      : "Sample Answer"}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {getLocalizedText(
                      question.answer,
                      language
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />

          <p className="text-slate-500">
            {language === "bn"
              ? "আপনার অনুসন্ধানের সঙ্গে কোনো প্রশ্ন মেলেনি।"
              : "No questions match your search."}
          </p>
        </div>
      )}
    </div>
  );
}

export default function InterviewPracticePage() {
  const { language } = useLanguage();

  const currentLanguage: SupportedLanguage =
    language === "bn" ? "bn" : "en";

  const [activeMode, setActiveMode] =
    useState<PracticeModeId>("flashcards");

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          {currentLanguage === "bn"
            ? "ইন্টারভিউ অনুশীলন"
            : "Interview Practice"}
        </h1>

        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {currentLanguage === "bn"
            ? "ফ্ল্যাশকার্ড ব্যবহার করে সাধারণ ইন্টারভিউ প্রশ্ন অনুশীলন করুন অথবা প্রশ্ন ব্যাংক দেখুন।"
            : "Practice common interview questions using flashcards or browse the question bank."}
        </p>
      </div>

      <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4">
        {PRACTICE_MODES.map((mode) => {
          const Icon = mode.icon;
          const active = mode.id === activeMode;
          const accent =
            ACCENT_STYLES[mode.accent];

          return (
            <button
              key={mode.id}
              onClick={() =>
                setActiveMode(mode.id)
              }
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition flex-shrink-0 ${
                active
                  ? `${accent.bg} text-white border-transparent`
                  : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />

              {getLocalizedText(
                mode.label,
                currentLanguage
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block lg:w-72 flex-shrink-0">
          <nav className="sticky top-8 flex flex-col gap-2">
            {PRACTICE_MODES.map((mode) => {
              const Icon = mode.icon;
              const active =
                mode.id === activeMode;
              const accent =
                ACCENT_STYLES[mode.accent];

              return (
                <button
                  key={mode.id}
                  onClick={() =>
                    setActiveMode(mode.id)
                  }
                  className={`text-left rounded-xl border p-4 transition ${
                    active
                      ? `${accent.border} ${accent.softBg}`
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        active
                          ? accent.bg
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          active
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                    </div>

                    <p className="font-semibold text-sm text-slate-900 dark:text-white">
                      {getLocalizedText(
                        mode.label,
                        currentLanguage
                      )}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {getLocalizedText(
                      mode.description,
                      currentLanguage
                    )}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.2,
              }}
            >
              {activeMode === "flashcards" && (
                <FlashcardsPanel
                  language={currentLanguage}
                />
              )}

              {activeMode === "bank" && (
                <QuestionBankPanel
                  language={currentLanguage}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}