const RESUME_TEXT_LIMIT = 5000;
const JOB_DESCRIPTION_LIMIT = 2500;

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
    text: `${value.slice(0, maxLength)}\n\n[${label} was truncated because it was too long.]`,
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
  const truncatedResume = truncateContent(
    resumeText,
    RESUME_TEXT_LIMIT,
    "Resume text"
  );

  const truncatedJobDescription = truncateContent(
    targetJobDescription,
    JOB_DESCRIPTION_LIMIT,
    "Job description"
  );

  const limitedJobDescription = isJobDescriptionLimited(
    truncatedJobDescription.text
  );

  return `
You are an AI resume reviewer for a career development web application.

Your task:
Analyze the resume against the target job role and optional job description.

Important rules:
1. The target job role is required.
2. The target job description is optional.
3. If the job description is detailed, evaluate mainly against that description.
4. If the job description is missing or limited, infer common industry requirements for the target job role.
5. If the job description is missing or limited, set missing_job_information to true.
6. If the resume text was truncated, explain that only part of the resume was reviewed.
7. If the job description was truncated, explain that only part of the job description was used.
8. Mention that an overly long resume may reduce readability for HR/recruiters.
9. Extract only the most important resume information.
10. Identify missing resume sections, such as work experience, skills, education, projects, or certifications.
11. Missing resume sections must affect scoring where relevant.
12. Be fair, consistent, concise, and specific.
13. Return ONLY valid JSON.
14. Do not include markdown.
15. Do not include extra explanation outside JSON.

Output constraints:
- Keep all responses concise.
- Summary must be under 60 words.
- Each list must contain maximum 5 items.
- Each item must be one short sentence.
- Only include the most important skills and feedback.
- Do not repeat similar points.
- Keep the full JSON response short enough to avoid truncation.

Scoring rubric:
- Skills match: 30 points
- Experience relevance: 25 points
- Education and qualifications: 15 points
- Projects, achievements, or evidence: 15 points
- Resume clarity and ATS readability: 15 points

Resume text status:
- was_truncated: ${truncatedResume.wasTruncated}
- original_length: ${truncatedResume.originalLength}
- used_length: ${truncatedResume.usedLength}

Job description status:
- was_truncated: ${truncatedJobDescription.wasTruncated}
- original_length: ${truncatedJobDescription.originalLength}
- used_length: ${truncatedJobDescription.usedLength}

Target job role:
${targetJobRole}

Target job description:
${truncatedJobDescription.text || "[No job description provided]"}

Job description limited:
${limitedJobDescription ? "true" : "false"}

Resume text:
${truncatedResume.text}

Return JSON exactly in this shape:

{
  "score": 0,
  "summary": "Short overall summary under 60 words.",
  "confidence": "high | medium | low",
  "evaluation_basis": "Explain whether the evaluation used the provided job description or general industry standards.",
  "missing_resume_sections": [],
  "missing_job_information": false,

  "resume_text_truncated": ${truncatedResume.wasTruncated},
  "resume_length_warning": "If resume was truncated, explain that only part of the resume was reviewed and long resumes may reduce HR readability. Otherwise empty string.",

  "job_description_truncated": ${truncatedJobDescription.wasTruncated},
  "job_description_warning": "If job description was truncated, explain that only part of it was used. Otherwise empty string.",

  "impact_explanation": "Explain how missing resume/job information or truncation affected the score.",

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