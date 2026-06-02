function detectLanguage(message) {
  const text = String(message || "").trim();

  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn";
  }

  return "en";
}

function isResumeReviewRequest(text) {
  return (
    text.includes("review my resume") ||
    text.includes("check my resume") ||
    text.includes("look at my resume") ||
    text.includes("improve my resume") ||
    text.includes("fix my resume") ||
    text.includes("help with my resume") ||
    text.includes("resume review") ||
    text.includes("resume feedback") ||
    text.includes("upload resume") ||
    text.includes("review my cv") ||
    text.includes("check my cv") ||
    text.includes("look at my cv") ||
    text.includes("improve my cv") ||
    text.includes("fix my cv") ||
    text.includes("help with my cv") ||
    text.includes("cv review") ||
    text.includes("cv feedback") ||
    text.includes("আমার রিজিউম") ||
    text.includes("আমার সিভি") ||
    text.includes("রিজিউম দেখ") ||
    text.includes("রিজিউম চেক") ||
    text.includes("রিজিউম রিভিউ") ||
    text.includes("রিজিউম ঠিক") ||
    text.includes("সিভি দেখ") ||
    text.includes("সিভি চেক") ||
    text.includes("সিভি রিভিউ") ||
    text.includes("সিভি ঠিক")
  );
}

function getEnglishResponse(message) {
  const text = String(message || "").toLowerCase();

  if (isResumeReviewRequest(text)) {
    return "Yes, I can help with that. For a detailed resume review, please go to the Resume Review page on this website and upload your resume together with your target job role or job description. The AI Resume Review tool will provide more structured feedback, including strengths, weaknesses, missing skills, and suggestions for improvement.";
  }

  if (text.includes("resume") || text.includes("cv")) {
    return "For your resume, focus on clear structure, strong action verbs, and measurable achievements. If you want detailed feedback, please use the Resume Review page and upload your resume with your target job role or job description. For a detailed resume review, please go to the Resume Review page on this website and upload your resume together with your target job role or job description.";
  }

  if (text.includes("interview")) {
    return "For interview preparation, I recommend using the STAR method: Situation, Task, Action, and Result. Prepare 3–5 examples from your past work, study, or project experience.";
  }

  if (text.includes("salary")) {
    return "For salary negotiation, research the market range first, then explain your value based on your skills, experience, and achievements. Try not to give a number too early.";
  }

  if (text.includes("cover letter")) {
    return "A good cover letter should explain why you are interested in the role, how your experience matches the job requirements, and what value you can bring to the company.";
  }

  if (text.includes("job") || text.includes("career")) {
    return "For career planning, start by choosing a target role, checking the required skills, identifying your current gaps, and building projects or experience to close those gaps.";
  }

  if (text.includes("linkedin")) {
    return "For LinkedIn, use a clear headline, a professional summary, relevant skills, and project or work experience that matches your target role.";
  }

  if (text.includes("portfolio")) {
    return "A strong portfolio should show your best projects, explain your role in each project, list the technologies used, and include links to live demos or GitHub repositories if available.";
  }

  return "I can help with resumes, interviews, cover letters, job search, career planning, workplace communication, and professional skills. Could you tell me more about your career goal?";
}

function getBanglaResponse(message) {
  const text = String(message || "").toLowerCase();

  if (isResumeReviewRequest(text)) {
    return "হ্যাঁ, আমি এতে সাহায্য করতে পারি। বিস্তারিত রিজিউম রিভিউ পাওয়ার জন্য এই ওয়েবসাইটের Resume Review পেজে গিয়ে আপনার রিজিউম এবং টার্গেট জব রোল বা জব ডেসক্রিপশন আপলোড করুন। AI Resume Review টুলটি আপনার রিজিউমের শক্তিশালী দিক, দুর্বল দিক, অনুপস্থিত স্কিল এবং উন্নতির পরামর্শ আরও গুছিয়ে দেবে।";
  }

  if (
    text.includes("resume") ||
    text.includes("cv") ||
    text.includes("রিজিউম") ||
    text.includes("সিভি")
  ) {
    return "রিজিউম ভালো করতে হলে পরিষ্কার কাঠামো, শক্তিশালী action verbs এবং measurable achievements ব্যবহার করুন। বিস্তারিত ফিডব্যাকের জন্য Resume Review পেজে গিয়ে আপনার রিজিউম এবং টার্গেট জব রোল বা জব ডেসক্রিপশন আপলোড করুন।";
  }

  if (text.includes("interview") || text.includes("ইন্টারভিউ")) {
    return "ইন্টারভিউ প্রস্তুতির জন্য STAR method ব্যবহার করুন: Situation, Task, Action, এবং Result। আপনার কাজ, পড়াশোনা বা প্রজেক্ট থেকে ৩–৫টি ভালো উদাহরণ প্রস্তুত রাখুন।";
  }

  if (text.includes("salary") || text.includes("বেতন")) {
    return "স্যালারি নেগোশিয়েশনের আগে আপনার রোল এবং লোকেশন অনুযায়ী মার্কেট রেট দেখে নিন। তারপর আপনার স্কিল, অভিজ্ঞতা এবং অর্জনের ভিত্তিতে নিজের value ব্যাখ্যা করুন।";
  }

  if (text.includes("cover letter") || text.includes("কভার লেটার")) {
    return "ভালো cover letter-এ আপনি কেন রোলটিতে আগ্রহী, আপনার অভিজ্ঞতা কীভাবে job requirements-এর সঙ্গে মিলে যায়, এবং আপনি কোম্পানিতে কী value দিতে পারবেন তা পরিষ্কারভাবে লিখতে হবে।";
  }

  if (
    text.includes("job") ||
    text.includes("career") ||
    text.includes("চাকরি") ||
    text.includes("ক্যারিয়ার")
  ) {
    return "ক্যারিয়ার প্ল্যানিংয়ের জন্য আগে একটি টার্গেট রোল ঠিক করুন, তারপর সেই রোলের প্রয়োজনীয় স্কিল দেখুন, নিজের স্কিল গ্যাপ চিহ্নিত করুন, এবং প্রজেক্ট বা অভিজ্ঞতার মাধ্যমে সেই গ্যাপ কমানোর চেষ্টা করুন।";
  }

  if (text.includes("linkedin") || text.includes("লিংকডইন")) {
    return "LinkedIn প্রোফাইল ভালো করতে পরিষ্কার headline, professional summary, relevant skills, এবং আপনার target role-এর সঙ্গে সম্পর্কিত project বা work experience যোগ করুন।";
  }

  if (text.includes("portfolio") || text.includes("পোর্টফোলিও")) {
    return "ভালো portfolio-তে আপনার সেরা project, প্রতিটি project-এ আপনার role, ব্যবহৃত technologies, এবং সম্ভব হলে live demo বা GitHub link থাকা উচিত।";
  }

  return "আমি রিজিউম, ইন্টারভিউ, cover letter, job search, career planning, workplace communication এবং professional skills বিষয়ে সাহায্য করতে পারি। আপনার career goal সম্পর্কে আর একটু বলবেন?";
}

async function generateChatbotResponse({ message }) {
  const language = detectLanguage(message);

  if (language === "bn") {
    return getBanglaResponse(message);
  }

  return getEnglishResponse(message);
}

module.exports = {
  generateChatbotResponse,
};