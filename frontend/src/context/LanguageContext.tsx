"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "bn" | "es" | "hi";

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  bn: "Bangla",
  es: "Spanish",
  hi: "Hindi"
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.resources": "Resources",
    "nav.resume": "Resume Review",
    "nav.chatbot": "AI Assistant",
    "nav.dashboard": "Dashboard",
    "nav.login": "Log In",
    "nav.logout": "Log Out",
    "hero.title": "AI-Powered Career Hub",
    "hero.subtitle": "Elevate your career with intelligent tools, curated resources, and AI feedback.",
    "cta.upload": "Upload Resume",
    "cta.askAI": "Ask AI Assistant",
  },
  bn: {
    "nav.home": "হোম",
    "nav.resources": "রিসোর্স",
    "nav.resume": "রিজুমে রিভিউ",
    "nav.chatbot": "এআই অ্যাসিস্ট্যান্ট",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.login": "লগ ইন",
    "nav.logout": "লগ আউট",
    "hero.title": "এআই-চালিত ক্যারিয়ার হাব",
    "hero.subtitle": "বুদ্ধিমান টুলস, বাছাইকৃত রিসোর্স এবং এআই ফিডব্যাকের মাধ্যমে আপনার ক্যারিয়ার উন্নত করুন।",
    "cta.upload": "রিজুমে আপলোড করুন",
    "cta.askAI": "এআই অ্যাসিস্ট্যান্টকে জিজ্ঞাসা করুন",
  },
  es: {
    "nav.home": "Inicio",
    "nav.resources": "Recursos",
    "nav.resume": "Revisión de Curr.",
    "nav.chatbot": "Asistente AI",
    "nav.dashboard": "Panel",
    "nav.login": "Iniciar Sesión",
    "nav.logout": "Cerrar Sesión",
    "hero.title": "Centro de Carreras con AI",
    "hero.subtitle": "Eleva tu carrera con herramientas inteligentes, recursos seleccionados y comentarios de AI.",
    "cta.upload": "Subir Currículum",
    "cta.askAI": "Preguntar al Asistente AI",
  },
  hi: {
    "nav.home": "होम",
    "nav.resources": "संसाधन",
    "nav.resume": "रिज्यूमे समीक्षा",
    "nav.chatbot": "एआई सहायक",
    "nav.dashboard": "डैशबोर्ड",
    "nav.login": "लॉग इन",
    "nav.logout": "लॉग आउट",
    "hero.title": "एआई-संचालित करियर हब",
    "hero.subtitle": "बुद्धिमान उपकरण, क्यूरेटेड संसाधन और एआई फीडबैक के साथ अपने करियर को बेहतर बनाएं।",
    "cta.upload": "रिज्यूमे अपलोड करें",
    "cta.askAI": "एआई सहायक से पूछें",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLangState] = useState<Language>("en");

  // On mount, check if there's a preferred language saved
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") as Language;
    if (["en", "bn", "es", "hi"].includes(savedLang)) {
      setLangState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
