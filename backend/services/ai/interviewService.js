const { analyzeWithDeepSeek } = require("./providers/deepseekProvider");
const { analyzeWithGemini } = require("./providers/geminiProvider");
const { analyzeWithOpenAI } = require("./providers/openaiProvider");

const VALID_CATEGORIES = new Set([
  "Behavioral",
  "Technical",
  "Situational",
  "Leadership",
  "HR / General",
]);

const VALID_DIFFICULTIES = new Set([
  "Easy",
  "Medium",
  "Hard",
]);

function buildInterviewPrompt(jobTitle, language) {
  const outputLanguage =
    language === "bn" ? "Bangla" : "English";

  return `
You are an interview preparation assistant.

Generate exactly 5 realistic interview questions for the following job:

Job title: ${jobTitle}

Requirements:
1. Generate exactly 5 interview questions.
2. Make the questions relevant to the selected job.
3. Include a useful mixture of technical, behavioral, situational, leadership, and general interview questions where appropriate.
4. Each sample answer must be short and practical, maximum 1-2 sentences.
5. Write the question and answer in ${outputLanguage}.
6. Keep category values in English and use only:
   Behavioral
   Technical
   Situational
   Leadership
   HR / General
7. Keep difficulty values in English and use only:
   Easy
   Medium
   Hard
8. Return ONLY valid JSON.
9. Do not include markdown.

Return exactly this format:

{
  "questions": [
    {
      "category": "Technical",
      "difficulty": "Medium",
      "question": "Question text",
      "answer": "Short sample answer."
    }
  ]
}
`;
}

function limitAnswer(value) {
  const text = String(value || "").trim();

  if (!text) return "";

  const sentences =
    text.match(/[^.!?।]+[.!?।]?/g) || [text];

  return sentences
    .slice(0, 2)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join(" ");
}

function normalizeQuestion(item) {
  return {
    category: VALID_CATEGORIES.has(item?.category)
      ? item.category
      : "HR / General",

    difficulty: VALID_DIFFICULTIES.has(item?.difficulty)
      ? item.difficulty
      : "Medium",

    question: String(item?.question || "").trim(),

    answer: limitAnswer(item?.answer),
  };
}

async function generateInterviewQuestions({
  jobTitle,
  language,
}) {
  const prompt = buildInterviewPrompt(
    jobTitle,
    language
  );

  const provider = (
    process.env.AI_PROVIDER || "gemini"
  ).toLowerCase();

  let result;

  if (provider === "deepseek") {
    result = await analyzeWithDeepSeek(prompt);
  } else if (provider === "openai") {
    result = await analyzeWithOpenAI(prompt);
  } else if (provider === "gemini") {
    result = await analyzeWithGemini(prompt);
  } else {
    throw new Error(
      "Invalid AI_PROVIDER. Use deepseek, gemini, or openai."
    );
  }

  const questions = Array.isArray(result?.questions)
    ? result.questions
        .map(normalizeQuestion)
        .filter(
          (item) => item.question && item.answer
        )
        .slice(0, 5)
    : [];

  if (questions.length === 0) {
    throw new Error(
      "AI did not return valid interview questions."
    );
  }

  return questions;
}

module.exports = {
  generateInterviewQuestions,
};
