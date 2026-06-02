const ALLOWED_KEYWORDS = [
  "resume",
  "cv",
  "cover letter",
  "job",
  "career",
  "interview",
  "salary",
  "application",
  "linkedin",
  "portfolio",
  "skill",
  "skills",
  "work",
  "workplace",
  "employment",
  "recruiter",
  "hr",
  "internship",
  "graduate",
  "position",
  "role",
  "experience",
  "qualification",
  "professional",
  "networking",
  "hire",
  "hiring",
  "company",
  "industry",

  "রিজিউম",
  "সিভি",
  "কভার লেটার",
  "চাকরি",
  "ক্যারিয়ার",
  "ইন্টারভিউ",
  "বেতন",
  "আবেদন",
  "লিংকডইন",
  "পোর্টফোলিও",
  "স্কিল",
  "দক্ষতা",
  "কাজ",
  "কর্মক্ষেত্র",
  "নিয়োগ",
  "ইন্টার্নশিপ",
  "গ্র্যাজুয়েট",
  "পজিশন",
  "রোল",
  "অভিজ্ঞতা",
  "যোগ্যতা",
  "প্রফেশনাল",
  "নেটওয়ার্কিং",
  "কোম্পানি",
  "ইন্ডাস্ট্রি",
];

const BLOCKED_KEYWORDS = [
  "weather",
  "movie",
  "game",
  "politics",
  "war",
  "religion",
  "stock",
  "crypto",
  "betting",
  "gambling",
  "hack",
  "illegal",

  "আবহাওয়া",
  "সিনেমা",
  "গেম",
  "রাজনীতি",
  "যুদ্ধ",
  "ধর্ম",
  "স্টক",
  "ক্রিপ্টো",
  "জুয়া",
  "হ্যাক",
  "অবৈধ",
];

function isCareerRelatedQuestion(message) {
  const text = String(message || "").toLowerCase().trim();

  if (!text) {
    return false;
  }

  const hasBlockedKeyword = BLOCKED_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );

  if (hasBlockedKeyword) {
    return false;
  }

  const hasAllowedKeyword = ALLOWED_KEYWORDS.some((keyword) =>
    text.includes(keyword)
  );

  return hasAllowedKeyword;
}

module.exports = {
  isCareerRelatedQuestion,
};