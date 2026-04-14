import { Language, Resource } from './types';

export const TRANSLATIONS = {
  en: {
    nav: {
      home: 'Home',
      review: 'Resume Review',
      resources: 'Resources',
      dashboard: 'Dashboard',
      login: 'Login',
      register: 'Register',
      logout: 'Logout'
    },
    hero: {
      title: 'Elevate Your Career with AI',
      subtitle: 'Get instant, personalized resume feedback and career guidance in English and Bangla.',
      cta: 'Start Review'
    },
    resume: {
      uploadTitle: 'Upload Your Resume',
      uploadSubtitle: 'Supported formats: PDF, DOCX',
      targetJob: 'Target Job Role',
      targetJobPlaceholder: 'e.g. Software Engineer',
      submit: 'Analyze Resume',
      analyzing: 'Analyzing your resume...'
    },
    chatbot: {
      placeholder: 'Ask me anything about your career...',
      title: 'Career Assistant'
    }
  },
  bn: {
    nav: {
      home: 'হোম',
      review: 'রেজিউমে রিভিউ',
      resources: 'রিসোর্স',
      dashboard: 'ড্যাশবোর্ড',
      login: 'লগইন',
      register: 'রেজিস্ট্রেশন',
      logout: 'লগআউট'
    },
    hero: {
      title: 'এআই-এর মাধ্যমে আপনার ক্যারিয়ার উন্নত করুন',
      subtitle: 'ইংরেজি এবং বাংলায় তাৎক্ষণিক, ব্যক্তিগতকৃত রেজিউমে ফিডব্যাক এবং ক্যারিয়ার গাইডেন্স পান।',
      cta: 'রিভিউ শুরু করুন'
    },
    resume: {
      uploadTitle: 'আপনার রেজিউমে আপলোড করুন',
      uploadSubtitle: 'সমর্থিত ফরম্যাট: PDF, DOCX',
      targetJob: 'টার্গেট জব রোল',
      targetJobPlaceholder: 'যেমন: সফটওয়্যার ইঞ্জিনিয়ার',
      submit: 'রেজিউমে বিশ্লেষণ করুন',
      analyzing: 'আপনার রেজিউমে বিশ্লেষণ করা হচ্ছে...'
    },
    chatbot: {
      placeholder: 'আপনার ক্যারিয়ার সম্পর্কে আমাকে কিছু জিজ্ঞাসা করুন...',
      title: 'ক্যারিয়ার অ্যাসিস্ট্যান্ট'
    }
  }
};

export const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'How to Write a Winning Resume',
    description: 'Learn the secrets of crafting a resume that gets noticed by recruiters.',
    type: 'article',
    category: 'resume',
    url: '#'
  },
  {
    id: '2',
    title: 'Mastering the Technical Interview',
    description: 'A comprehensive guide to acing your next coding interview.',
    type: 'guide',
    category: 'interview',
    url: '#'
  },
  {
    id: '3',
    title: 'Networking in the Digital Age',
    description: 'How to build meaningful professional connections online.',
    type: 'video',
    category: 'networking',
    url: '#'
  }
];
