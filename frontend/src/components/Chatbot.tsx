"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageSquare, Send, X, Sparkles, User } from "lucide-react";
import { sendChatMessage } from "../services/chatService";
import { useLanguage } from "../context/LanguageContext";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

const QUICK_PROMPTS_EN = [
  "Review my resume tips",
  "How to use the STAR method in interviews?",
  "Bangladesh IT job skills",
  "Cover letter structure guide",
];

const QUICK_PROMPTS_BN = [
  "রিজিউম তৈরির সেরা টিপস",
  "ইন্টারভিউতে STAR মেথড কীভাবে ব্যবহার করব?",
  "বাংলাদেশের আইটি চাকরির প্রয়োজনীয় দক্ষতা",
  "কভার লেটার লেখার সঠিক নিয়ম",
];

function getInitialMessages(lang: string = "en"): Message[] {
  return [
    {
      id: "initial-bot",
      sender: "bot",
      text:
        lang === "bn"
          ? "আসসালামু আলাইকুম! আমি আপনার এআই ক্যারিয়ার সহকারী। আপনার ক্যারিয়ার যাত্রায় কীভাবে সাহায্য করতে পারি? রিজিউম, ইন্টারভিউ প্রস্তুতি, কভার লেটার বা চাকরির দক্ষতা সম্পর্কে আমাকে জিজ্ঞাসা করতে পারেন!"
          : "Assalamu Alaikum! I'm your AI Career Assistant. How can I help boost your career journey today? Ask me about resumes, interview prep, cover letters, or skills in Bangladesh!",
    },
  ];
}

export default function Chatbot() {
  const { language } = useLanguage();
  const isBn = language === "bn";
  const quickPrompts = isBn ? QUICK_PROMPTS_BN : QUICK_PROMPTS_EN;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages(language));
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "initial-bot") {
        return getInitialMessages(language);
      }
      return prev;
    });
  }, [language]);

  useEffect(() => {
    const openChatbot = () => {
      setIsOpen(true);
    };

    const resetChatbot = () => {
      setMessages(getInitialMessages(language));
      setInputValue("");
      setIsTyping(false);
      setIsOpen(false);
    };

    window.addEventListener("open-chatbot", openChatbot);
    window.addEventListener("reset-chatbot", resetChatbot);

    return () => {
      window.removeEventListener("open-chatbot", openChatbot);
      window.removeEventListener("reset-chatbot", resetChatbot);
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessageWithText = async (textToSend: string) => {
    const trimmedInput = textToSend.trim();

    if (!trimmedInput || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(trimmedInput);

      const botMessage: Message = {
        id: `${Date.now()}-bot`,
        sender: "bot",
        text: reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        sender: "bot",
        text: isBn
          ? "দুঃখিত, এআই অ্যাসিস্ট্যান্টে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।"
          : "Sorry, something went wrong with the AI assistant. Please try again in a moment.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = () => {
    sendMessageWithText(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-4 flex h-[560px] w-[calc(100vw-3rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl shadow-blue-500/15 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/95"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-4 text-white shadow-md">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner ring-2 ring-white/20">
                    <Bot className="h-5 w-5 text-white" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 ring-2 ring-blue-600" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold tracking-tight">
                        {isBn ? "এআই ক্যারিয়ার কোচ" : "AI Career Coach"}
                      </p>
                      <span className="rounded-full bg-blue-500/40 px-1.5 py-0.5 text-[10px] font-semibold text-blue-100 uppercase tracking-wider">
                        {isBn ? "সক্রিয়" : "Live"}
                      </span>
                    </div>
                    <p className="text-xs text-blue-100/90 font-medium">
                      {isBn ? "ডিজিটাল ক্যারিয়ার হাব • ২৪/৭" : "Digital Career Hub • 24/7"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-blue-100 transition-all hover:bg-white/15 hover:text-white active:scale-95"
                  aria-label={isBn ? "চ্যাটবট বন্ধ করুন" : "Close chatbot"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 dark:bg-slate-900/60">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "bot" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                      message.sender === "user"
                        ? "rounded-2xl rounded-br-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/15"
                        : "rounded-2xl rounded-bl-xs border border-slate-200/80 bg-white text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {message.text}
                  </div>

                  {message.sender === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 shadow-xs dark:bg-slate-700 dark:text-slate-200">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-xs border border-slate-200/80 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-800">
                    <div className="flex h-5 items-center gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Starter Suggestions */}
              {messages.length === 1 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    {isBn ? "দ্রুত প্রশ্ন" : "Quick Questions"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessageWithText(prompt)}
                        className="rounded-full border border-blue-200/80 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm active:scale-95 dark:border-blue-900/50 dark:bg-slate-800/80 dark:text-blue-300 dark:hover:bg-blue-950/40"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="border-t border-slate-200/80 bg-white/80 p-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
              <div className="flex items-center gap-2">
                <input
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isBn
                      ? "রিজিউম বা চাকরি সম্পর্কিত পরামর্শ জিজ্ঞাসা করুন..."
                      : "Ask advice on resumes, jobs..."
                  }
                  className="flex-1 rounded-full border border-slate-300/80 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-600 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-400 dark:focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={isBn ? "বার্তা পাঠান" : "Send message"}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <div className="relative group">
          {/* Subtle Outer Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur-sm group-hover:opacity-50 transition-opacity animate-pulse" />

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white shadow-xl shadow-blue-500/35 ring-4 ring-white/80 transition-all duration-300 hover:scale-105 active:scale-95 dark:ring-slate-900/80"
            aria-label={isBn ? "চ্যাটবট খুলুন" : "Open chatbot"}
          >
            <MessageSquare className="h-6 w-6" />

            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}