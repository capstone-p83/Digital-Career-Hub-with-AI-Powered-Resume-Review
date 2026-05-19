function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/Page \d+ of \d+/gi, "")
    .replace(/References available upon request/gi, "")
    .trim();
}

const SECTION_HEADINGS = {
  summary: [
    "summary",
    "profile",
    "professional summary",
    "career summary",
    "personal profile",
    "objective",
    "career objective",
    "about me",
    "introduction",
  ],

  skills: [
    "skills",
    "technical skills",
    "key skills",
    "core skills",
    "core competencies",
    "competencies",
    "areas of expertise",
    "expertise",
    "technologies",
    "tools",
    "technical proficiencies",
    "professional skills",
    "relevant skills",
    "skill set",
  ],

  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "career history",
    "work history",
    "employment",
    "professional background",
    "industry experience",
    "relevant experience",
    "internship experience",
    "internships",
    "volunteer experience",
  ],

  education: [
    "education",
    "academic background",
    "academic history",
    "qualifications",
    "educational background",
    "education and training",
    "degrees",
    "certificates and education",
  ],

  projects: [
    "projects",
    "project experience",
    "academic projects",
    "personal projects",
    "key projects",
    "selected projects",
    "portfolio",
    "project portfolio",
    "research projects",
  ],

  certifications: [
    "certifications",
    "certificates",
    "licenses",
    "licences",
    "training",
    "professional development",
    "courses",
    "online courses",
    "awards and certifications",
  ],
};

const ALL_HEADINGS = Object.values(SECTION_HEADINGS).flat();

function cleanHeading(line) {
  return line
    .trim()
    .toLowerCase()
    .replace(/[:：\-–—]+$/g, "")
    .replace(/\s+/g, " ");
}

function isHeadingLine(line, headingList) {
  const cleaned = cleanHeading(line);

  if (!cleaned) return false;

  return headingList.some((heading) => {
    const h = heading.toLowerCase();

    return (
      cleaned === h ||
      cleaned.startsWith(`${h} `) ||
      cleaned.startsWith(`${h}:`) ||
      cleaned.startsWith(`${h} -`)
    );
  });
}

function findSectionStart(lines, headingList) {
  for (let i = 0; i < lines.length; i++) {
    if (isHeadingLine(lines[i], headingList)) {
      return i;
    }
  }

  return -1;
}

function findNextSectionStart(lines, startIndex) {
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (isHeadingLine(lines[i], ALL_HEADINGS)) {
      return i;
    }
  }

  return lines.length;
}

function extractSection(text, headingList, maxLength) {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n");

  const start = findSectionStart(lines, headingList);

  if (start === -1) {
    return "";
  }

  const end = findNextSectionStart(lines, start);

  return lines
    .slice(start, end)
    .join("\n")
    .trim()
    .slice(0, maxLength);
}

function buildCompactResumeText(resumeText) {
  const text = normalizeText(resumeText);

  const summary = extractSection(text, SECTION_HEADINGS.summary, 400);
  const skills = extractSection(text, SECTION_HEADINGS.skills, 800);
  const experience = extractSection(text, SECTION_HEADINGS.experience, 1400);
  const education = extractSection(text, SECTION_HEADINGS.education, 500);
  const projects = extractSection(text, SECTION_HEADINGS.projects, 700);
  const certifications = extractSection(
    text,
    SECTION_HEADINGS.certifications,
    300
  );

  const compact = `
SUMMARY:
${summary || "[Not clearly found]"}

SKILLS:
${skills || "[Not clearly found]"}

EXPERIENCE:
${experience || "[Not clearly found]"}

EDUCATION:
${education || "[Not clearly found]"}

PROJECTS:
${projects || "[Not clearly found]"}

CERTIFICATIONS:
${certifications || "[Not clearly found]"}
`.trim();

  return compact.slice(0, 3800);
}

function buildCompactJobDescription(jobDescription) {
  const text = normalizeText(jobDescription);

  if (!text) return "";

  const keywords = [
    "responsibility",
    "responsibilities",
    "requirement",
    "requirements",
    "qualification",
    "qualifications",
    "skill",
    "skills",
    "experience",
    "degree",
    "knowledge",
    "must",
    "preferred",
    "familiar",
    "ability",
    "duties",
    "role",
    "candidate",
    "essential",
    "desirable",
  ];

  const importantLines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      const lower = line.toLowerCase();
      return keywords.some((keyword) => lower.includes(keyword));
    });

  const result = importantLines.length > 0 ? importantLines.join("\n") : text;

  return result.slice(0, 1200);
}

module.exports = {
  normalizeText,
  buildCompactResumeText,
  buildCompactJobDescription,
};