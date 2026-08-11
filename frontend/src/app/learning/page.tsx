"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bookmark,
  Layers,
  ClipboardList,
  Bot,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Clock,
  Sparkles,
  Send,
  Mic,
  ListChecks,
  Timer,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  NOTE FOR ENGINEERING                                              */
/*  This page is a frontend-only mock. Nothing here calls the API —   */
/*  all data below is placeholder content so the layout, states, and  */
/*  interactions can be reviewed before we wire up:                   */
/*    - GET /interview/flashcards, /interview/exams, /interview/bank  */
/*    - the AI roleplay session (websocket or streaming endpoint)     */
/*  Anywhere a real feature isn't built yet, the control is disabled  */
/*  and labeled "Coming soon".                                        */
/* ------------------------------------------------------------------ */

type PracticeModeId = "flashcards" | "exam" | "roleplay" | "bank";

const PRACTICE_MODES: {
  id: PracticeModeId;
  label: string;
  description: string;
  icon: typeof Layers;
  accent: "blue" | "amber" | "violet" | "emerald";
}[] = [
  {
    id: "flashcards",
    label: "Flashcards",
    description: "Flip through Q&A cards, one question at a time",
    icon: Layers,
    accent: "blue",
  },
  {
    id: "exam",
    label: "Exam Mode",
    description: "Timed, exam-style question sets",
    icon: ClipboardList,
    accent: "amber",
  },
  {
    id: "roleplay",
    label: "AI Roleplay",
    description: "Practice out loud with an AI interviewer",
    icon: Bot,
    accent: "violet",
  },
  {
    id: "bank",
    label: "Question Bank",
    description: "Search and browse every practice question",
    icon: BookOpen,
    accent: "emerald",
  },
];

const ACCENT_STYLES: Record<
  string,
  { text: string; bg: string; border: string; softBg: string; ring: string; dot: string }
> = {
  blue: {
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-600",
    border: "border-blue-200 dark:border-blue-900",
    softBg: "bg-blue-50 dark:bg-slate-800",
    ring: "ring-blue-500",
    dot: "bg-blue-500",
  },
  amber: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-900",
    softBg: "bg-amber-50 dark:bg-slate-800",
    ring: "ring-amber-500",
    dot: "bg-amber-500",
  },
  violet: {
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-600",
    border: "border-violet-200 dark:border-violet-900",
    softBg: "bg-violet-50 dark:bg-slate-800",
    ring: "ring-violet-500",
    dot: "bg-violet-500",
  },
  emerald: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-600",
    border: "border-emerald-200 dark:border-emerald-900",
    softBg: "bg-emerald-50 dark:bg-slate-800",
    ring: "ring-emerald-500",
    dot: "bg-emerald-500",
  },
};

/* ------------------------------- Mock data ------------------------------- */

const FLASHCARD_DECK = [
  {
    id: 1,
    category: "Behavioral",
    difficulty: "Easy",
    question: "Tell me about yourself.",
    answer:
      "Give a 60-90 second walkthrough: current role, one or two relevant achievements, then why you're excited about this move. Keep it forward-looking, not a full resume readout.",
  },
  {
    id: 2,
    category: "Behavioral",
    difficulty: "Medium",
    question: "Describe a time you disagreed with a manager. What did you do?",
    answer:
      "Use STAR. Focus on how you raised the disagreement respectfully, what evidence you brought, and the outcome — even if your view didn't win out.",
  },
  {
    id: 3,
    category: "Technical",
    difficulty: "Medium",
    question: "How would you explain an API to a non-technical person?",
    answer:
      "Reach for an everyday analogy — a restaurant menu is a common one: you (the client) order from the menu (the API) without needing to know how the kitchen (the server) works.",
  },
  {
    id: 4,
    category: "Situational",
    difficulty: "Hard",
    question: "A project is behind schedule and the client is unhappy. What's your first move?",
    answer:
      "Diagnose before promising. Confirm the real cause and remaining scope internally first, then bring the client a clear status update with options rather than a vague apology.",
  },
  {
    id: 5,
    category: "Leadership",
    difficulty: "Medium",
    question: "How do you handle an underperforming team member?",
    answer:
      "Start with a private, specific conversation about the gap, agree on measurable expectations, and offer support. Document progress and escalate only if it doesn't improve.",
  },
  {
    id: 6,
    category: "HR / General",
    difficulty: "Easy",
    question: "Why do you want to work here?",
    answer:
      "Connect one thing about the company's mission or work to something specific in your own experience or values — avoid generic praise that could apply to any employer.",
  },
  {
    id: 7,
    category: "Technical",
    difficulty: "Hard",
    question: "How do you decide when to optimize for speed vs. code quality?",
    answer:
      "Frame it around risk and reversibility: ship fast for reversible, low-risk work; slow down and invest in quality where mistakes are costly or hard to undo.",
  },
  {
    id: 8,
    category: "Situational",
    difficulty: "Medium",
    question: "You realize you made a mistake that affected a colleague's work. What do you do?",
    answer:
      "Own it immediately, tell the people affected before they find out another way, and lead with a fix — not just an apology.",
  },
];

const EXAM_TEMPLATES = [
  {
    id: "swe-behavioral",
    title: "Software Engineer — Behavioral",
    category: "Behavioral",
    questionCount: 8,
    duration: 20,
    difficulty: "Medium",
  },
  {
    id: "pm-case",
    title: "Product Manager — Case Study",
    category: "Case Study",
    questionCount: 5,
    duration: 30,
    difficulty: "Hard",
  },
  {
    id: "hr-screen",
    title: "General HR Screening",
    category: "HR / General",
    questionCount: 10,
    duration: 15,
    difficulty: "Easy",
  },
  {
    id: "leadership-panel",
    title: "Leadership Panel Round",
    category: "Leadership",
    questionCount: 6,
    duration: 25,
    difficulty: "Hard",
  },
];

const ROLEPLAY_PERSONAS = [
  {
    id: "friendly-hr",
    name: "Friendly HR Recruiter",
    style: "Warm, conversational",
    description: "Screens for culture fit and motivation. Good for easing into interview practice.",
  },
  {
    id: "technical-lead",
    name: "Tough Technical Lead",
    style: "Direct, probing follow-ups",
    description: "Pushes past your first answer and asks you to justify trade-offs.",
  },
  {
    id: "behavioral-coach",
    name: "Behavioral Coach",
    style: "Structured, STAR-focused",
    description: "Slows you down and coaches you toward a clear Situation–Task–Action–Result answer.",
  },
  {
    id: "exec-panel",
    name: "Executive Panel",
    style: "High-level, strategic",
    description: "Asks big-picture questions about judgment, priorities, and impact.",
  },
];

const ROLEPLAY_TRANSCRIPT_PREVIEW = [
  {
    role: "ai",
    text: "Thanks for joining — let's start simple. Walk me through your background in a couple of minutes.",
  },
  {
    role: "user",
    text: "Sure — I've spent the last three years as a frontend developer, most recently leading a redesign of...",
  },
  {
    role: "ai",
    text: "Good. What was the hardest trade-off you had to make on that redesign, and why?",
  },
];

const QUESTION_BANK = [
  ...FLASHCARD_DECK.map((c) => ({
    id: `q-${c.id}`,
    title: c.question,
    category: c.category,
    difficulty: c.difficulty,
    preview: c.answer,
  })),
  {
    id: "q-9",
    title: "What's your greatest professional weakness?",
    category: "HR / General",
    difficulty: "Easy",
    preview:
      "Pick something real, show self-awareness, and describe a concrete step you're taking to improve it.",
  },
  {
    id: "q-10",
    title: "Walk me through how you'd design a URL shortener.",
    category: "Technical",
    difficulty: "Hard",
    preview:
      "Cover requirements, data model, hashing/collision strategy, and how you'd scale reads vs. writes.",
  },
  {
    id: "q-11",
    title: "Tell me about a time you had to influence someone without authority.",
    category: "Leadership",
    difficulty: "Medium",
    preview:
      "Emphasize the relationship-building and evidence you used, not just the final outcome.",
  },
];

/* ------------------------------ Small helpers ------------------------------ */

function DifficultyPill({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    Easy: "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    Medium: "text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    Hard: "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
  };
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
        styles[difficulty] || "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {difficulty}
    </span>
  );
}

function ComingSoonPill() {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400">
      Coming soon
    </span>
  );
}

/* ------------------------------- Flashcards ------------------------------- */

function FlashcardsPanel() {
  const categories = ["All", ...Array.from(new Set(FLASHCARD_DECK.map((c) => c.category)))];
  const [categoryFilter, setCategoryFilter] = useState("All");
  const deck =
    categoryFilter === "All"
      ? FLASHCARD_DECK
      : FLASHCARD_DECK.filter((c) => c.category === categoryFilter);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setIndex(0);
    setFlipped(false);
  }, [categoryFilter]);

  const card = deck[index] ?? deck[0];

  const goNext = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % deck.length);
  };
  const goPrev = () => {
    setFlipped(false);
    setIndex((i) => (i - 1 + deck.length) % deck.length);
  };
  const goShuffle = () => {
    setFlipped(false);
    setIndex(Math.floor(Math.random() * deck.length));
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Flashcards</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Read the question, think through your answer out loud, then flip the card.
          </p>
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {index + 1} / {deck.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            className="h-8 text-sm whitespace-nowrap"
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="max-w-xl mx-auto [perspective:1400px]">
        <button
          onClick={() => setFlipped((f) => !f)}
          aria-label="Flip flashcard"
          className="relative w-full h-72 sm:h-80 rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div
            className="absolute inset-0 h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-blue-600 bg-blue-50 dark:bg-slate-800 dark:text-blue-400">
                  {card.category}
                </span>
                <DifficultyPill difficulty={card.difficulty} />
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white text-center px-2">
                {card.question}
              </p>
              <p className="text-xs text-slate-400 text-center">Tap the card to reveal a sample answer</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 [backface-visibility:hidden] rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-slate-800 p-8 flex flex-col justify-center gap-3"
              style={{ transform: "rotateY(180deg)" }}
            >
              <p className="text-[11px] uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 text-center">
                Sample answer
              </p>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 text-center leading-relaxed overflow-y-auto max-h-40">
                {card.answer}
              </p>
            </div>
          </div>
        </button>

        <div className="flex items-center justify-center gap-3 mt-6">
          <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={goPrev} aria-label="Previous card">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-4" onClick={goShuffle}>
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" size="sm" className="h-10 w-10 p-0" onClick={goNext} aria-label="Next card">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Exam --------------------------------- */

function ExamPanel() {
  const [selectedId, setSelectedId] = useState(EXAM_TEMPLATES[0].id);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const selected = EXAM_TEMPLATES.find((t) => t.id === selectedId)!;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exam Mode</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a question set to simulate a timed, structured interview round.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {EXAM_TEMPLATES.map((tmpl) => {
          const active = tmpl.id === selectedId;
          return (
            <button
              key={tmpl.id}
              onClick={() => setSelectedId(tmpl.id)}
              className={`text-left rounded-xl border p-5 transition ${
                active
                  ? "border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-slate-800 ring-2 ring-amber-400/40"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-700"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-amber-700 bg-amber-100 dark:bg-slate-700 dark:text-amber-400">
                  {tmpl.category}
                </span>
                <DifficultyPill difficulty={tmpl.difficulty} />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white mb-2">{tmpl.title}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="w-3.5 h-3.5" />
                  {tmpl.questionCount} questions
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {tmpl.duration} min
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <Card className="border-amber-200 dark:border-amber-900">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ready to start</p>
              <p className="font-semibold text-slate-900 dark:text-white">{selected.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selected.questionCount} questions · {selected.duration} minutes · {selected.difficulty}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => setTimerEnabled((v) => !v)}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
              >
                <Timer className="w-4 h-4" />
                Timer
                <span
                  className={`ml-1 inline-flex h-5 w-9 items-center rounded-full transition ${
                    timerEnabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded-full bg-white shadow transform transition ${
                      timerEnabled ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>

              <div className="flex flex-col items-start sm:items-end gap-1">
                <Button disabled className="opacity-60 cursor-not-allowed">
                  Start exam
                </Button>
                <ComingSoonPill />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------- AI Roleplay ------------------------------- */

function RoleplayPanel() {
  const [personaId, setPersonaId] = useState(ROLEPLAY_PERSONAS[0].id);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Roleplay</h2>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-violet-700 bg-violet-100 dark:bg-slate-800 dark:text-violet-400">
          <Sparkles className="w-3 h-3" />
          Beta
        </span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Pick an interviewer style and practice answering out loud in a live conversation.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {ROLEPLAY_PERSONAS.map((p) => {
          const active = p.id === personaId;
          return (
            <button
              key={p.id}
              onClick={() => setPersonaId(p.id)}
              className={`text-left rounded-xl border p-5 transition ${
                active
                  ? "border-violet-400 dark:border-violet-700 bg-violet-50 dark:bg-slate-800 ring-2 ring-violet-400/40"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-full bg-violet-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{p.name}</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400">{p.style}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{p.description}</p>
            </button>
          );
        })}
      </div>

      <Card className="border-violet-200 dark:border-violet-900">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Preview: {ROLEPLAY_PERSONAS.find((p) => p.id === personaId)?.name}
            </CardTitle>
            <ComingSoonPill />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
            {ROLEPLAY_TRANSCRIPT_PREVIEW.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 pt-4">
            <button
              disabled
              className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed flex-shrink-0"
              aria-label="Speak your answer (coming soon)"
            >
              <Mic className="w-4 h-4" />
            </button>
            <Input disabled placeholder="Live roleplay isn't available yet" className="flex-1 h-10" />
            <button
              disabled
              className="h-10 w-10 flex items-center justify-center rounded-full text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed flex-shrink-0"
              aria-label="Send (coming soon)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ----------------------------- Question Bank ----------------------------- */

function QuestionBankPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(QUESTION_BANK.map((q) => q.category)))];

  const filtered = QUESTION_BANK.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Question Bank</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Search the full library and bookmark questions to revisit later.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search questions..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={categoryFilter === cat ? "default" : "outline"}
            size="sm"
            className="h-8 text-sm whitespace-nowrap"
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => (
            <Card key={q.id} className="hover:border-emerald-300 dark:hover:border-emerald-700 transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-emerald-600 bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400">
                      {q.category}
                    </span>
                    <DifficultyPill difficulty={q.difficulty} />
                  </div>
                  <button className="text-slate-400 hover:text-emerald-600 transition flex-shrink-0" aria-label="Bookmark question">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1.5 leading-snug">{q.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{q.preview}</p>
                <button className="inline-flex items-center mt-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                  Practice this question
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          <Search className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-500">No questions match your search.</p>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Page --------------------------------- */

export default function InterviewPracticePage() {
  const [activeMode, setActiveMode] = useState<PracticeModeId>("flashcards");

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Interview Practice
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Choose how you want to practice — flip through flashcards, sit a timed exam, or roleplay live with an AI interviewer.
        </p>
      </div>

      {/* Mobile: horizontal mode pills */}
      <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-2 -mx-4 px-4">
        {PRACTICE_MODES.map((mode) => {
          const Icon = mode.icon;
          const active = mode.id === activeMode;
          const accent = ACCENT_STYLES[mode.accent];
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition flex-shrink-0 ${
                active
                  ? `${accent.bg} text-white border-transparent`
                  : "text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop: left tab rail */}
        <aside className="hidden lg:block lg:w-72 flex-shrink-0">
          <nav className="sticky top-8 flex flex-col gap-2">
            {PRACTICE_MODES.map((mode) => {
              const Icon = mode.icon;
              const active = mode.id === activeMode;
              const accent = ACCENT_STYLES[mode.accent];
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`text-left rounded-xl border p-4 transition ${
                    active
                      ? `${accent.border} ${accent.softBg}`
                      : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        active ? accent.bg : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                    </div>
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          active ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {mode.label}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main panel */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeMode === "flashcards" && <FlashcardsPanel />}
              {activeMode === "exam" && <ExamPanel />}
              {activeMode === "roleplay" && <RoleplayPanel />}
              {activeMode === "bank" && <QuestionBankPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
