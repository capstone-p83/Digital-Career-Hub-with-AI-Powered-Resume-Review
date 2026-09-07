const {
  analyzeWithDeepSeek,
} = require("./providers/deepseekProvider");

const {
  analyzeWithGemini,
} = require("./providers/geminiProvider");

const {
  analyzeWithOpenAI,
} = require("./providers/openaiProvider");

function buildCoverLetterPrompt(data) {
  const {
    templateStyle,
    fullName,
    email,
    phone,
    address,
    date,
    jobTitle,
    company,
    hiringManager,
    skills,
    experience,
    whyRole,
    whyCompany,
    jobDescription,
    language = "en",
  } = data;

  const isBangla =
    language === "bn";

  const languageInstruction =
    isBangla
      ? `
LANGUAGE REQUIREMENT:
- Write the entire cover letter in natural, professional Bangla.
- The salutation, all body paragraphs and closing must be written in Bangla.
- Do not translate names, company names, job titles, technology names or other proper nouns unless necessary.
- Keep English technical terms where they are normally used professionally.
`
      : `
LANGUAGE REQUIREMENT:
- Write the entire cover letter in professional English.
- The salutation, all body paragraphs and closing must be written in English.
`;

  const templateInstructions = {
    graduate: `
TEMPLATE STYLE: Graduate / Internship

Focus on:
- education;
- university projects;
- internships;
- transferable skills;
- willingness to learn;
- motivation for starting a career.

Do not make the applicant sound more experienced than the information provided.
`,

    professional: `
TEMPLATE STYLE: Professional

Focus on:
- relevant professional experience;
- achievements;
- relevant technical and professional skills;
- evidence of value the applicant can bring to the employer.

Use a confident but professional tone.
`,

    "career-change": `
TEMPLATE STYLE: Career Change

Focus on:
- transferable skills;
- relevant experience from the applicant's previous field;
- reasons for moving into the target field;
- evidence showing readiness for the transition.

Do not apologise for the career change.
Present it positively and professionally.
`,
  };

  return `
You are a professional cover letter writer for a career development web application.

Your task is to generate a concise, professional cover letter using ONLY the information provided by the user.

${languageInstruction}

${templateInstructions[templateStyle] || templateInstructions.graduate}

IMPORTANT RULES:

1. Do NOT invent:
   - experience;
   - employment;
   - projects;
   - education;
   - skills;
   - qualifications;
   - achievements;
   - responsibilities;
   - company knowledge.

2. Only use information that the applicant provided.

3. The final cover letter must fit comfortably on ONE A4 page when formatted using:
   - Arial;
   - approximately 11pt;
   - normal margins;
   - normal paragraph spacing.

4. Target approximately 300-400 words.

5. Maximum target length is approximately 420 words.

6. Use approximately 3-4 concise body paragraphs.

7. Prioritise the most relevant information for the target role.

8. If the applicant provides too much information:
   - remove repetition;
   - omit less relevant information;
   - prioritise information matching the target role;
   - shorten long explanations;
   - set "was_shortened" to true.

9. If the applicant does not provide enough meaningful information:
   - do NOT generate vague or invented claims;
   - return status "insufficient_information";
   - explain what additional information would improve the application.

10. The opening paragraph should:
   - identify the position;
   - identify the company;
   - briefly explain the applicant's interest.

11. The middle paragraphs should:
   - connect relevant skills and experience to the role;
   - use concrete information provided by the applicant;
   - avoid repeating the resume.

12. If company motivation was provided, use it naturally.

13. The closing should:
   - express interest in discussing the application;
   - remain concise and professional.

14. Do not include:
   - the applicant's name;
   - address;
   - phone;
   - email;
   - date;
   inside the generated body paragraphs.

The application will place those details separately in the document.

15. Do not use Markdown.

16. Return ONLY valid JSON.

Applicant information:

Full name:
${fullName || "[Not provided]"}

Email:
${email || "[Not provided]"}

Phone:
${phone || "[Not provided]"}

Address:
${address || "[Not provided]"}

Date:
${date || "[Not provided]"}


Application information:

Job title:
${jobTitle || "[Not provided]"}

Company:
${company || "[Not provided]"}

Hiring manager:
${hiringManager || "[Not provided]"}


Relevant skills:

${skills || "[Not provided]"}


Relevant experience / projects:

${experience || "[Not provided]"}


Why this role:

${whyRole || "[Not provided]"}


Why this company:

${whyCompany || "[Not provided]"}


Job description:

${jobDescription || "[Not provided]"}


If enough information is available, return JSON exactly in this structure:

{
  "status": "ok",
  "word_count": 0,
  "was_shortened": false,
  "warning": "",
  "salutation": "${
    isBangla
      ? "প্রিয় নিয়োগকারী,"
      : "Dear Hiring Manager,"
  }",
  "paragraphs": [
    "Opening paragraph",
    "Relevant experience and skills paragraph",
    "Role/company motivation paragraph",
    "Closing paragraph"
  ],
  "closing": "${
    isBangla
      ? "বিনীত,"
      : "Kind regards,"
  }"
}

If information is insufficient, return:

{
  "status": "insufficient_information",
  "word_count": 0,
  "was_shortened": false,
  "warning": "${
    isBangla
      ? "একটি শক্তিশালী কভার লেটার তৈরি করতে আরও প্রাসঙ্গিক তথ্য দিন।"
      : "Please provide more relevant information to generate a strong cover letter."
  }",
  "salutation": "",
  "paragraphs": [],
  "closing": ""
}
`;
}

async function generateCoverLetterWithAI(
  data
) {
  const provider =
    (
      process.env.AI_PROVIDER ||
      "deepseek"
    ).toLowerCase();

  const prompt =
    buildCoverLetterPrompt(
      data
    );

  if (
    provider ===
    "deepseek"
  ) {
    return analyzeWithDeepSeek(
      prompt
    );
  }

  if (
    provider === "gemini"
  ) {
    return analyzeWithGemini(
      prompt
    );
  }

  if (
    provider === "openai"
  ) {
    return analyzeWithOpenAI(
      prompt
    );
  }

  throw new Error(
    "Invalid AI_PROVIDER. Use deepseek, gemini, or openai."
  );
}

module.exports = {
  generateCoverLetterWithAI,
};