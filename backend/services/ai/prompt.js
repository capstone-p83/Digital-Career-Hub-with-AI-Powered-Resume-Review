const RESUME_TEXT_LIMIT = 3500;
const JOB_DESCRIPTION_LIMIT = 1200;

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
    "career profile",
    "personal statement",
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
    "computer skills",
    "it skills",
    "language skills",
    "soft skills",
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
    "voluntary work",
    "job experience",
    "practical experience",
    "training experience",
  ],

  education: [
    "education",
    "academic background",
    "academic history",
    "qualifications",
    "educational background",
    "education and training",
    "degrees",
    "degree",
    "academic qualifications",
    "educational qualifications",
    "academic record",
    "academic credentials",
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
    "major projects",
    "capstone projects",
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
    "short courses",
    "professional training",
  ],

  achievements: [
    "achievements",
    "awards",
    "honors",
    "honours",
    "accomplishments",
    "recognition",
  ],
};

const BIODATA_HEADINGS = [
  "personal information",
  "personal details",
  "personal data",
  "biodata",
  "bio data",
  "personal profile",
  "personal particulars",
];

const ALL_HEADINGS = [
  ...Object.values(SECTION_HEADINGS).flat(),
  ...BIODATA_HEADINGS,
];

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

function removeSensitiveBiodataLines(text) {
  return String(text || "")
    .split("\n")
    .filter((line) => {
      const lower = line.trim().toLowerCase();

      const biodataKeywords = [
        "father's name",
        "fathers name",
        "mother's name",
        "mothers name",
        "date of birth",
        "dob",
        "age",
        "gender",
        "sex",
        "marital status",
        "religion",
        "nationality",
        "national id",
        "nid",
        "passport",
        "blood group",
        "blood type",
        "height",
        "weight",
        "permanent address",
        "present address",
        "current address",
        "signature",
        "declaration",
      ];

      return !biodataKeywords.some((keyword) => lower.startsWith(keyword));
    })
    .join("\n")
    .trim();
}

function buildCompactResumeText(resumeText) {
  const text = normalizeText(resumeText);
  const safeText = removeSensitiveBiodataLines(text);

  const summary = extractSection(safeText, SECTION_HEADINGS.summary, 350);
  const skills = extractSection(safeText, SECTION_HEADINGS.skills, 800);
  const experience = extractSection(safeText, SECTION_HEADINGS.experience, 1400);
  const education = extractSection(safeText, SECTION_HEADINGS.education, 450);
  const projects = extractSection(safeText, SECTION_HEADINGS.projects, 550);
  const certifications = extractSection(
    safeText,
    SECTION_HEADINGS.certifications,
    300
  );
  const achievements = extractSection(
    safeText,
    SECTION_HEADINGS.achievements,
    250
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

ACHIEVEMENTS:
${achievements || "[Not clearly found]"}
`.trim();

  const sectionFound =
    summary ||
    skills ||
    experience ||
    education ||
    projects ||
    certifications ||
    achievements;

  const fallbackText = safeText.slice(0, RESUME_TEXT_LIMIT);

  return sectionFound ? compact.slice(0, RESUME_TEXT_LIMIT) : fallbackText;
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
    "certificate",
    "certification",
    "licence",
    "license",
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
    "portfolio",
    "project",
    "education",
    "training",
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

  return result.slice(0, JOB_DESCRIPTION_LIMIT);
}

function truncateContent(text, maxLength, label) {
  const value = String(text || "").trim();

  if (value.length <= maxLength) {
    return {
      text: value,
      wasTruncated: false,
      originalLength: value.length,
      usedLength: value.length,
    };
  }

  return {
    text: `${value.slice(0, maxLength)}\n[${label} truncated]`,
    wasTruncated: true,
    originalLength: value.length,
    usedLength: maxLength,
  };
}

function isJobDescriptionLimited(targetJobDescription) {
  const text = String(targetJobDescription || "").trim();
  return text.length < 80;
}

function buildResumeReviewPrompt({
  resumeText,
  targetJobRole,
  targetJobDescription,
}) {
  const compactResumeText = buildCompactResumeText(resumeText);
  const compactJobDescription = buildCompactJobDescription(targetJobDescription);

  const truncatedResume = truncateContent(
    compactResumeText,
    RESUME_TEXT_LIMIT,
    "Resume"
  );

  const truncatedJobDescription = truncateContent(
    compactJobDescription,
    JOB_DESCRIPTION_LIMIT,
    "Job description"
  );

  const limitedJobDescription = isJobDescriptionLimited(
    truncatedJobDescription.text
  );

  return `
You are an AI resume reviewer.

Review the resume for the target role.
Use the job description if provided. If missing/short, use common industry standards.

Return ONLY valid JSON.
No markdown. No extra text.
All feedback must be in English.
Be concise.
Summary max 40 words.
Each array max 3 items.
Each item max 18 words.
Do not repeat points.
resume_data arrays must use keywords only.

Score out of 100:
job-relevant skills 35, relevant experience/practical evidence 30, required education/licence/certification 15, role-specific achievements/projects/portfolio 10, clarity/readability 10.

Important:
- Penalise missing information only when it is relevant to the target role.
- Do not penalise missing projects, portfolio, degree, or certifications unless the target role or job description requires them.
- Empty projects, certifications, or education arrays do not automatically reduce the score unless required by the role.
- For practical, service, labour, retail, hospitality, delivery, admin, support, or entry-level roles, focus on relevant experience, reliability, communication, availability, licences, and role-specific skills.
- For technical, software, data, design, engineering, research, graduate, or portfolio-based roles, projects or portfolio may be useful evidence.
- Bangladesh CVs may include biodata-style personal details.
- Do not reward or penalise photo, age, gender, religion, marital status, parents' names, NID, address, blood group, height, weight, signature, declaration, or references unless the job clearly requires them.
- Do not treat missing biodata personal details as missing resume sections.
- Do not expose sensitive personal details in feedback unless job-relevant.
- If resume/job description was truncated, mention impact briefly.
- Some sections may not be clearly detected due to different resume formats.

Flags:
resume_truncated=${truncatedResume.wasTruncated}
job_description_truncated=${truncatedJobDescription.wasTruncated}
job_description_limited=${limitedJobDescription}

Target role:
${targetJobRole}

Job description:
${truncatedJobDescription.text || "[No job description provided]"}

Resume:
${truncatedResume.text}

JSON shape:
{
  "score": 0,
  "summary": "",
  "confidence": "high | medium | low",
  "evaluation_basis": "",
  "missing_resume_sections": [],
  "missing_job_information": ${limitedJobDescription},
  "resume_text_truncated": ${truncatedResume.wasTruncated},
  "resume_length_warning": "",
  "job_description_truncated": ${truncatedJobDescription.wasTruncated},
  "job_description_warning": "",
  "impact_explanation": "",
  "strengths": [],
  "areas_for_improvement": [],
  "actionable_suggestions": [],
  "matched_skills": [],
  "missing_skills": [],
  "extra_skills": [],
  "resume_data": {
    "work_experience": [],
    "skills": [],
    "education": [],
    "projects": [],
    "certifications": [],
    "missing_sections": []
  }
}
`;
}

module.exports = {
  buildResumeReviewPrompt,
};