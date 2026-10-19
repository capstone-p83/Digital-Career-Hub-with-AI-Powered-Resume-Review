/**
 * Removes personal information from extracted resume text before it is
 * provided to an external AI service.
 *
 * This function returns a new string and does not modify the original file.
 */
function sanitizePersonalInfo(resumeText, user = {}) {
  if (typeof resumeText !== "string") {
    return "";
  }

  let sanitizedText = resumeText;

  // Email addresses
  const emailPattern =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

  sanitizedText = sanitizedText.replace(
    emailPattern,
    "[EMAIL REDACTED]"
  );

  // LinkedIn profile URLs
  const linkedInPattern =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s)\]}>,]+/gi;

  sanitizedText = sanitizedText.replace(
    linkedInPattern,
    "[LINKEDIN REDACTED]"
  );

  // Australian mobile and common international phone-number formats
  const phonePattern =
    /(?<!\d)(?:(?:\+?61[\s.-]?)?0?4\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\+?\d{1,3}[\s.-]?(?:\(\d{1,4}\)[\s.-]?)?(?:\d[\s.-]?){7,12}\d)(?!\d)/g;

  sanitizedText = sanitizedText.replace(
    phonePattern,
    "[PHONE REDACTED]"
  );

  // Known user name, when it is available
  const possibleNames = [
    user.full_name,
    user.fullName,
    user.name,
    [user.first_name, user.last_name].filter(Boolean).join(" "),
    [user.firstName, user.lastName].filter(Boolean).join(" "),
  ];

  for (const name of possibleNames) {
    if (typeof name !== "string" || name.trim().length < 2) {
      continue;
    }

    const escapedName = name
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const namePattern = new RegExp(`\\b${escapedName}\\b`, "gi");

    sanitizedText = sanitizedText.replace(
      namePattern,
      "[NAME REDACTED]"
    );
  }

  return sanitizedText;
}

module.exports = {
  sanitizePersonalInfo,
};