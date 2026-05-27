"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "bn" | "es" | "hi";

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  bn: "Bangla",
  es: "Spanish",
  hi: "Hindi",
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
    "nav.profile": "Profile",
    "nav.adminPanel": "Admin Panel",

    "hero.title": "AI-Powered Career Hub",
    "hero.subtitle":
      "Elevate your career with intelligent tools, curated resources, and AI feedback.",

    "cta.upload": "Upload Resume",
    "cta.askAI": "Ask AI Assistant",

    "resources.title": "Career Resource Hub",
    "resources.subtitle":
      "Explore our curated collection of guides, templates, and advice to help you land your dream job.",
    "resources.search": "Search resources...",
    "resources.all": "All",
    "resources.articles": "Articles",
    "resources.resumes": "Resume Examples",
    "resources.readArticle": "Read Article",
    "resources.noLink": "No External Link",
    "resources.resumeExample": "Resume Example",
    "resources.noResults": "No resources found",
    "resources.noResultsHint": "Try adjusting your search or category filter.",
    "resources.clearFilters": "Clear Filters",
    "resources.loading": "Loading resources...",
    "resources.by": "By",
    "resources.viewFullResource": "View full resource",
    "resources.filterBySubcategory": "Filter by Subcategory",
    "resources.allSubcategories": "All Subcategories",
    "resources.failedLoad": "Failed to load resources. Please try again later.",

    "footer.brand": "Digital Career Hub",
    "footer.description":
      "AI-Powered Resume Review & Career Resources to help you land your dream job faster. Empowering professionals worldwide.",
    "footer.resources": "Resources",
    "footer.resumeTemplates": "Resume Templates",
    "footer.coverLetterBuilder": "Cover Letter Builder",
    "footer.interviewPrep": "Interview Prep",
    "footer.careerAdvice": "Career Advice",
    "footer.company": "Company",
    "footer.aboutUs": "About Us",
    "footer.careers": "Careers",
    "footer.privacyPolicy": "Privacy Policy",
    "footer.termsOfService": "Terms of Service",
    "footer.contactUs": "Contact Us",
    "footer.sendMessage": "Send us a message",
    "footer.rights": "Digital Career Hub. All rights reserved.",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.cookies": "Cookies",

    "mgmt.title": "Learning Resource Management",
    "mgmt.subtitle": "Create, edit and manage learning resources on the platform.",
    "mgmt.backToDashboard": "Back to Dashboard",
    "mgmt.refresh": "Refresh",
    "mgmt.newResource": "New Learning Resource",
    "mgmt.totalArticles": "Total Articles",
    "mgmt.totalResumes": "Total Resume Examples",
    "mgmt.createTitle": "Create New Learning Resource",
    "mgmt.createPrompt": "What type of resource would you like to upload?",
    "mgmt.articleDesc": "Create a written article with content",
    "mgmt.resumeDesc": "Upload a resume example for users to reference",
    "mgmt.editArticle": "Edit Article",
    "mgmt.createArticle": "Create New Article",
    "mgmt.editResume": "Edit Resume Example",
    "mgmt.uploadResume": "Upload Resume Example",
    "mgmt.title_field": "Title",
    "mgmt.author": "Author",
    "mgmt.thumbnailUrl": "Thumbnail Image URL (optional)",
    "mgmt.externalUrl": "External Article URL (optional)",
    "mgmt.externalUrlHint": "Link to the full article on an external website",
    "mgmt.content": "Content",
    "mgmt.candidateName": "Candidate Name",
    "mgmt.jobTitle": "Job Title",
    "mgmt.description": "Description",
    "mgmt.cancel": "Cancel",
    "mgmt.saving": "Saving...",
    "mgmt.updateArticle": "Update Article",
    "mgmt.createArticleBtn": "Create Article",
    "mgmt.updateResume": "Update Resume Example",
    "mgmt.createResumeBtn": "Create Resume Example",
    "mgmt.articles": "Articles",
    "mgmt.resumes": "Resume Examples",
    "mgmt.loadingArticles": "Loading articles...",
    "mgmt.noArticles": "No articles yet. Create your first one!",
    "mgmt.loadingResumes": "Loading resume examples...",
    "mgmt.noResumes": "No resume examples yet. Upload your first one!",
    "mgmt.id": "ID",
    "mgmt.externalUrlCol": "External URL",
    "mgmt.thumbnailCol": "Thumbnail",
    "mgmt.createdAt": "Created At",
    "mgmt.actions": "Actions",
    "mgmt.viewImage": "View Image",
    "mgmt.viewArticle": "View Article",
    "mgmt.none": "None",
  },

  bn: {
    "nav.home": "হোম",
    "nav.resources": "রিসোর্স",
    "nav.resume": "রিজুমে রিভিউ",
    "nav.chatbot": "এআই অ্যাসিস্ট্যান্ট",
    "nav.dashboard": "ড্যাশবোর্ড",
    "nav.login": "লগ ইন",
    "nav.logout": "লগ আউট",
    "nav.profile": "প্রোফাইল",
    "nav.adminPanel": "অ্যাডমিন প্যানেল",

    "hero.title": "এআই-চালিত ক্যারিয়ার হাব",
    "hero.subtitle":
      "বুদ্ধিমান টুলস, বাছাইকৃত রিসোর্স এবং এআই ফিডব্যাকের মাধ্যমে আপনার ক্যারিয়ার উন্নত করুন।",

    "cta.upload": "রিজুমে আপলোড করুন",
    "cta.askAI": "এআই অ্যাসিস্ট্যান্টকে জিজ্ঞাসা করুন",

    "resources.title": "ক্যারিয়ার রিসোর্স হাব",
    "resources.subtitle":
      "আপনার স্বপ্নের চাকরি পেতে সাহায্য করার জন্য আমাদের বাছাইকৃত গাইড, টেমপ্লেট এবং পরামর্শ অন্বেষণ করুন।",
    "resources.search": "রিসোর্স খুঁজুন...",
    "resources.all": "সব",
    "resources.articles": "নিবন্ধ",
    "resources.resumes": "রিজুমে উদাহরণ",
    "resources.readArticle": "নিবন্ধ পড়ুন",
    "resources.noLink": "কোনো বাহ্যিক লিঙ্ক নেই",
    "resources.resumeExample": "রিজুমে উদাহরণ",
    "resources.noResults": "কোনো রিসোর্স পাওয়া যায়নি",
    "resources.noResultsHint": "আপনার অনুসন্ধান বা ক্যাটাগরি ফিল্টার সামঞ্জস্য করুন।",
    "resources.clearFilters": "ফিল্টার পরিষ্কার করুন",
    "resources.loading": "রিসোর্স লোড হচ্ছে...",
    "resources.by": "লেখক",
    "resources.viewFullResource": "সম্পূর্ণ রিসোর্স দেখুন",
    "resources.filterBySubcategory": "সাবক্যাটাগরি অনুযায়ী ফিল্টার করুন",
    "resources.allSubcategories": "সব সাবক্যাটাগরি",
    "resources.failedLoad": "রিসোর্স লোড করা যায়নি। পরে আবার চেষ্টা করুন।",

    "footer.brand": "ডিজিটাল ক্যারিয়ার হাব",
    "footer.description":
      "এআই-চালিত রিজুমে রিভিউ এবং ক্যারিয়ার রিসোর্স, যা আপনাকে দ্রুত আপনার স্বপ্নের চাকরি পেতে সাহায্য করে।",
    "footer.resources": "রিসোর্স",
    "footer.resumeTemplates": "রিজুমে টেমপ্লেট",
    "footer.coverLetterBuilder": "কভার লেটার বিল্ডার",
    "footer.interviewPrep": "ইন্টারভিউ প্রস্তুতি",
    "footer.careerAdvice": "ক্যারিয়ার পরামর্শ",
    "footer.company": "কোম্পানি",
    "footer.aboutUs": "আমাদের সম্পর্কে",
    "footer.careers": "ক্যারিয়ার",
    "footer.privacyPolicy": "গোপনীয়তা নীতি",
    "footer.termsOfService": "সেবার শর্তাবলি",
    "footer.contactUs": "যোগাযোগ করুন",
    "footer.sendMessage": "বার্তা পাঠান",
    "footer.rights": "ডিজিটাল ক্যারিয়ার হাব। সর্বস্বত্ব সংরক্ষিত।",
    "footer.privacy": "গোপনীয়তা",
    "footer.terms": "শর্তাবলি",
    "footer.cookies": "কুকিজ",

    "mgmt.title": "লার্নিং রিসোর্স ম্যানেজমেন্ট",
    "mgmt.subtitle": "প্ল্যাটফর্মে লার্নিং রিসোর্স তৈরি, সম্পাদনা এবং পরিচালনা করুন।",
    "mgmt.backToDashboard": "ড্যাশবোর্ডে ফিরুন",
    "mgmt.refresh": "রিফ্রেশ",
    "mgmt.newResource": "নতুন লার্নিং রিসোর্স",
    "mgmt.totalArticles": "মোট নিবন্ধ",
    "mgmt.totalResumes": "মোট রিজুমে উদাহরণ",
    "mgmt.createTitle": "নতুন লার্নিং রিসোর্স তৈরি করুন",
    "mgmt.createPrompt": "আপনি কোন ধরনের রিসোর্স আপলোড করতে চান?",
    "mgmt.articleDesc": "বিষয়বস্তু সহ একটি লিখিত নিবন্ধ তৈরি করুন",
    "mgmt.resumeDesc": "ব্যবহারকারীদের জন্য একটি রিজুমে উদাহরণ আপলোড করুন",
    "mgmt.editArticle": "নিবন্ধ সম্পাদনা করুন",
    "mgmt.createArticle": "নতুন নিবন্ধ তৈরি করুন",
    "mgmt.editResume": "রিজুমে উদাহরণ সম্পাদনা করুন",
    "mgmt.uploadResume": "রিজুমে উদাহরণ আপলোড করুন",
    "mgmt.title_field": "শিরোনাম",
    "mgmt.author": "লেখক",
    "mgmt.thumbnailUrl": "থাম্বনেইল ইমেজ URL (ঐচ্ছিক)",
    "mgmt.externalUrl": "বাহ্যিক নিবন্ধ URL (ঐচ্ছিক)",
    "mgmt.externalUrlHint": "বাহ্যিক ওয়েবসাইটে সম্পূর্ণ নিবন্ধের লিঙ্ক",
    "mgmt.content": "বিষয়বস্তু",
    "mgmt.candidateName": "প্রার্থীর নাম",
    "mgmt.jobTitle": "পদবি",
    "mgmt.description": "বিবরণ",
    "mgmt.cancel": "বাতিল",
    "mgmt.saving": "সংরক্ষণ হচ্ছে...",
    "mgmt.updateArticle": "নিবন্ধ আপডেট করুন",
    "mgmt.createArticleBtn": "নিবন্ধ তৈরি করুন",
    "mgmt.updateResume": "রিজুমে উদাহরণ আপডেট করুন",
    "mgmt.createResumeBtn": "রিজুমে উদাহরণ তৈরি করুন",
    "mgmt.articles": "নিবন্ধসমূহ",
    "mgmt.resumes": "রিজুমে উদাহরণসমূহ",
    "mgmt.loadingArticles": "নিবন্ধ লোড হচ্ছে...",
    "mgmt.noArticles": "এখনো কোনো নিবন্ধ নেই। প্রথমটি তৈরি করুন!",
    "mgmt.loadingResumes": "রিজুমে উদাহরণ লোড হচ্ছে...",
    "mgmt.noResumes": "এখনো কোনো রিজুমে উদাহরণ নেই। প্রথমটি আপলোড করুন!",
    "mgmt.id": "আইডি",
    "mgmt.externalUrlCol": "বাহ্যিক URL",
    "mgmt.thumbnailCol": "থাম্বনেইল",
    "mgmt.createdAt": "তৈরির তারিখ",
    "mgmt.actions": "কার্যক্রম",
    "mgmt.viewImage": "ছবি দেখুন",
    "mgmt.viewArticle": "নিবন্ধ দেখুন",
    "mgmt.none": "কোনোটি নেই",
  },

  es: {
    "nav.home": "Inicio",
    "nav.resources": "Recursos",
    "nav.resume": "Revisión de Curr.",
    "nav.chatbot": "Asistente AI",
    "nav.dashboard": "Panel",
    "nav.login": "Iniciar Sesión",
    "nav.logout": "Cerrar Sesión",
    "nav.profile": "Perfil",
    "nav.adminPanel": "Panel de Administración",

    "hero.title": "Centro de Carreras con AI",
    "hero.subtitle":
      "Eleva tu carrera con herramientas inteligentes, recursos seleccionados y comentarios de AI.",

    "cta.upload": "Subir Currículum",
    "cta.askAI": "Preguntar al Asistente AI",

    "resources.title": "Centro de Recursos de Carrera",
    "resources.subtitle":
      "Explora nuestra colección de guías, plantillas y consejos para conseguir tu trabajo ideal.",
    "resources.search": "Buscar recursos...",
    "resources.all": "Todos",
    "resources.articles": "Artículos",
    "resources.resumes": "Ejemplos de CV",
    "resources.readArticle": "Leer Artículo",
    "resources.noLink": "Sin enlace externo",
    "resources.resumeExample": "Ejemplo de CV",
    "resources.noResults": "No se encontraron recursos",
    "resources.noResultsHint": "Intenta ajustar tu búsqueda o filtro de categoría.",
    "resources.clearFilters": "Limpiar Filtros",
    "resources.loading": "Cargando recursos...",
    "resources.by": "Por",
    "resources.viewFullResource": "Ver recurso completo",
    "resources.filterBySubcategory": "Filtrar por subcategoría",
    "resources.allSubcategories": "Todas las subcategorías",
    "resources.failedLoad": "No se pudieron cargar los recursos. Inténtalo de nuevo más tarde.",

    "footer.brand": "Digital Career Hub",
    "footer.description":
      "Revisión de currículum con AI y recursos profesionales para ayudarte a conseguir tu trabajo ideal más rápido.",
    "footer.resources": "Recursos",
    "footer.resumeTemplates": "Plantillas de CV",
    "footer.coverLetterBuilder": "Constructor de cartas",
    "footer.interviewPrep": "Preparación para entrevistas",
    "footer.careerAdvice": "Consejos profesionales",
    "footer.company": "Empresa",
    "footer.aboutUs": "Sobre nosotros",
    "footer.careers": "Carreras",
    "footer.privacyPolicy": "Política de privacidad",
    "footer.termsOfService": "Términos de servicio",
    "footer.contactUs": "Contáctanos",
    "footer.sendMessage": "Envíanos un mensaje",
    "footer.rights": "Digital Career Hub. Todos los derechos reservados.",
    "footer.privacy": "Privacidad",
    "footer.terms": "Términos",
    "footer.cookies": "Cookies",

    "mgmt.title": "Gestión de Recursos de Aprendizaje",
    "mgmt.subtitle": "Crea, edita y gestiona recursos de aprendizaje en la plataforma.",
    "mgmt.backToDashboard": "Volver al Panel",
    "mgmt.refresh": "Actualizar",
    "mgmt.newResource": "Nuevo Recurso",
    "mgmt.totalArticles": "Total de Artículos",
    "mgmt.totalResumes": "Total de Ejemplos de CV",
    "mgmt.createTitle": "Crear Nuevo Recurso de Aprendizaje",
    "mgmt.createPrompt": "¿Qué tipo de recurso deseas subir?",
    "mgmt.articleDesc": "Crea un artículo escrito con contenido",
    "mgmt.resumeDesc": "Sube un ejemplo de CV para que los usuarios lo consulten",
    "mgmt.editArticle": "Editar Artículo",
    "mgmt.createArticle": "Crear Nuevo Artículo",
    "mgmt.editResume": "Editar Ejemplo de CV",
    "mgmt.uploadResume": "Subir Ejemplo de CV",
    "mgmt.title_field": "Título",
    "mgmt.author": "Autor",
    "mgmt.thumbnailUrl": "URL de imagen miniatura (opcional)",
    "mgmt.externalUrl": "URL de artículo externo (opcional)",
    "mgmt.externalUrlHint": "Enlace al artículo completo en un sitio web externo",
    "mgmt.content": "Contenido",
    "mgmt.candidateName": "Nombre del Candidato",
    "mgmt.jobTitle": "Cargo",
    "mgmt.description": "Descripción",
    "mgmt.cancel": "Cancelar",
    "mgmt.saving": "Guardando...",
    "mgmt.updateArticle": "Actualizar Artículo",
    "mgmt.createArticleBtn": "Crear Artículo",
    "mgmt.updateResume": "Actualizar Ejemplo de CV",
    "mgmt.createResumeBtn": "Crear Ejemplo de CV",
    "mgmt.articles": "Artículos",
    "mgmt.resumes": "Ejemplos de CV",
    "mgmt.loadingArticles": "Cargando artículos...",
    "mgmt.noArticles": "Aún no hay artículos. ¡Crea el primero!",
    "mgmt.loadingResumes": "Cargando ejemplos de CV...",
    "mgmt.noResumes": "Aún no hay ejemplos de CV. ¡Sube el primero!",
    "mgmt.id": "ID",
    "mgmt.externalUrlCol": "URL Externa",
    "mgmt.thumbnailCol": "Miniatura",
    "mgmt.createdAt": "Creado El",
    "mgmt.actions": "Acciones",
    "mgmt.viewImage": "Ver Imagen",
    "mgmt.viewArticle": "Ver Artículo",
    "mgmt.none": "Ninguno",
  },

  hi: {
    "nav.home": "होम",
    "nav.resources": "संसाधन",
    "nav.resume": "रिज्यूमे समीक्षा",
    "nav.chatbot": "एआई सहायक",
    "nav.dashboard": "डैशबोर्ड",
    "nav.login": "लॉग इन",
    "nav.logout": "लॉग आउट",
    "nav.profile": "प्रोफाइल",
    "nav.adminPanel": "एडमिन पैनल",

    "hero.title": "एआई-संचालित करियर हब",
    "hero.subtitle":
      "बुद्धिमान उपकरण, क्यूरेटेड संसाधन और एआई फीडबैक के साथ अपने करियर को बेहतर बनाएं।",

    "cta.upload": "रिज्यूमे अपलोड करें",
    "cta.askAI": "एआई सहायक से पूछें",

    "resources.title": "करियर रिसोर्स हब",
    "resources.subtitle":
      "अपने सपनों की नौकरी पाने में मदद के लिए हमारे गाइड, टेम्पलेट और सलाह का संग्रह देखें।",
    "resources.search": "रिसोर्स खोजें...",
    "resources.all": "सभी",
    "resources.articles": "लेख",
    "resources.resumes": "रिज्यूमे उदाहरण",
    "resources.readArticle": "लेख पढ़ें",
    "resources.noLink": "कोई बाहरी लिंक नहीं",
    "resources.resumeExample": "रिज्यूमे उदाहरण",
    "resources.noResults": "कोई रिसोर्स नहीं मिला",
    "resources.noResultsHint": "अपनी खोज या श्रेणी फ़िल्टर समायोजित करें।",
    "resources.clearFilters": "फ़िल्टर साफ़ करें",
    "resources.loading": "रिसोर्स लोड हो रहे हैं...",
    "resources.by": "द्वारा",
    "resources.viewFullResource": "पूरा रिसोर्स देखें",
    "resources.filterBySubcategory": "उपश्रेणी से फ़िल्टर करें",
    "resources.allSubcategories": "सभी उपश्रेणियाँ",
    "resources.failedLoad": "रिसोर्स लोड नहीं हो सके। कृपया बाद में फिर कोशिश करें।",

    "footer.brand": "डिजिटल करियर हब",
    "footer.description":
      "एआई-संचालित रिज्यूमे समीक्षा और करियर रिसोर्स, जो आपको अपना सपना नौकरी जल्दी पाने में मदद करते हैं।",
    "footer.resources": "रिसोर्स",
    "footer.resumeTemplates": "रिज्यूमे टेम्पलेट",
    "footer.coverLetterBuilder": "कवर लेटर बिल्डर",
    "footer.interviewPrep": "इंटरव्यू तैयारी",
    "footer.careerAdvice": "करियर सलाह",
    "footer.company": "कंपनी",
    "footer.aboutUs": "हमारे बारे में",
    "footer.careers": "करियर",
    "footer.privacyPolicy": "गोपनीयता नीति",
    "footer.termsOfService": "सेवा की शर्तें",
    "footer.contactUs": "संपर्क करें",
    "footer.sendMessage": "हमें संदेश भेजें",
    "footer.rights": "डिजिटल करियर हब। सर्वाधिकार सुरक्षित।",
    "footer.privacy": "गोपनीयता",
    "footer.terms": "शर्तें",
    "footer.cookies": "कुकीज़",

    "mgmt.title": "लर्निंग रिसोर्स प्रबंधन",
    "mgmt.subtitle": "प्लेटफ़ॉर्म पर लर्निंग रिसोर्स बनाएं, संपादित करें और प्रबंधित करें।",
    "mgmt.backToDashboard": "डैशबोर्ड पर वापस जाएं",
    "mgmt.refresh": "रीफ्रेश",
    "mgmt.newResource": "नया लर्निंग रिसोर्स",
    "mgmt.totalArticles": "कुल लेख",
    "mgmt.totalResumes": "कुल रिज्यूमे उदाहरण",
    "mgmt.createTitle": "नया लर्निंग रिसोर्स बनाएं",
    "mgmt.createPrompt": "आप किस प्रकार का रिसोर्स अपलोड करना चाहते हैं?",
    "mgmt.articleDesc": "सामग्री के साथ एक लिखित लेख बनाएं",
    "mgmt.resumeDesc": "उपयोगकर्ताओं के लिए एक रिज्यूमे उदाहरण अपलोड करें",
    "mgmt.editArticle": "लेख संपादित करें",
    "mgmt.createArticle": "नया लेख बनाएं",
    "mgmt.editResume": "रिज्यूमे उदाहरण संपादित करें",
    "mgmt.uploadResume": "रिज्यूमे उदाहरण अपलोड करें",
    "mgmt.title_field": "शीर्षक",
    "mgmt.author": "लेखक",
    "mgmt.thumbnailUrl": "थंबनेल इमेज URL (वैकल्पिक)",
    "mgmt.externalUrl": "बाहरी लेख URL (वैकल्पिक)",
    "mgmt.externalUrlHint": "बाहरी वेबसाइट पर पूर्ण लेख का लिंक",
    "mgmt.content": "सामग्री",
    "mgmt.candidateName": "उम्मीदवार का नाम",
    "mgmt.jobTitle": "पद",
    "mgmt.description": "विवरण",
    "mgmt.cancel": "रद्द करें",
    "mgmt.saving": "सहेजा जा रहा है...",
    "mgmt.updateArticle": "लेख अपडेट करें",
    "mgmt.createArticleBtn": "लेख बनाएं",
    "mgmt.updateResume": "रिज्यूमे उदाहरण अपडेट करें",
    "mgmt.createResumeBtn": "रिज्यूमे उदाहरण बनाएं",
    "mgmt.articles": "लेख",
    "mgmt.resumes": "रिज्यूमे उदाहरण",
    "mgmt.loadingArticles": "लेख लोड हो रहे हैं...",
    "mgmt.noArticles": "अभी तक कोई लेख नहीं। पहला बनाएं!",
    "mgmt.loadingResumes": "रिज्यूमे उदाहरण लोड हो रहे हैं...",
    "mgmt.noResumes": "अभी तक कोई रिज्यूमे उदाहरण नहीं। पहला अपलोड करें!",
    "mgmt.id": "आईडी",
    "mgmt.externalUrlCol": "बाहरी URL",
    "mgmt.thumbnailCol": "थंबनेल",
    "mgmt.createdAt": "बनाया गया",
    "mgmt.actions": "क्रियाएं",
    "mgmt.viewImage": "छवि देखें",
    "mgmt.viewArticle": "लेख देखें",
    "mgmt.none": "कोई नहीं",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLangState] = useState<Language>("en");

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