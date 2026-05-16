function extractJsonFromText(text) {
  const raw = String(text || "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error("AI response did not contain valid JSON.");
    }

    const jsonText = raw.slice(firstBrace, lastBrace + 1);
    return JSON.parse(jsonText);
  }
}

module.exports = {
  extractJsonFromText,
};