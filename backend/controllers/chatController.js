const { isCareerRelatedQuestion } = require("../services/ai/chatGuard");
const { generateChatbotResponse } = require("../services/ai/chatbotService");

function detectLanguage(message) {
  const text = String(message || "").trim();

  if (/[\u0980-\u09FF]/.test(text)) {
    return "bn";
  }

  return "en";
}

function getOutOfScopeReply(message) {
  const language = detectLanguage(message);

  if (language === "bn") {
    return "দুঃখিত, আমি শুধুমাত্র career, resume, interview, cover letter এবং job search সম্পর্কিত প্রশ্নে সাহায্য করতে পারি।";
  }

  return "Sorry, I can only help with career, resume, interview, cover letter, and job search related questions.";
}

async function sendChatMessage(req, res) {
  try {
    const { message } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    if (!isCareerRelatedQuestion(message)) {
      return res.status(200).json({
        success: true,
        reply: getOutOfScopeReply(message),
      });
    }

    const reply = await generateChatbotResponse({
      message,
      user: req.user || null,
    });

    return res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate chatbot response.",
    });
  }
}

module.exports = {
  sendChatMessage,
};