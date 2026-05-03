/**
 * Resume review: multipart POST /api/resume/review
 */

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export type ResumeReviewSubmission = {
  resume: File;
  target_job_role: string;
  target_job_description: string;
};

export type ResumeReviewAnalysis = {
  score: number;
  summary: string;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  keywords: { word: string; found: boolean }[];
};

export type ResumeReviewSuccessBody = {
  status: "ok";
  analysis: ResumeReviewAnalysis;
};

export type ResumeReviewErrorBody = {
  status?: string;
  message?: string;
};

export const RESUME_REVIEW_STORAGE_KEY = "resumeReviewResult";

export function buildResumeReviewFormData({
  resume,
  target_job_role,
  target_job_description,
}: ResumeReviewSubmission): FormData {
  const formData = new FormData();
  formData.append("resume", resume);
  formData.append("target_job_role", target_job_role.trim());
  formData.append("target_job_description", target_job_description.trim());
  return formData;
}

export async function postResumeReview(
  formData: FormData,
  token?: string | null
): Promise<Response> {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const url = `${apiBase.replace(/\/$/, "")}/resume/review`;
  return fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });
}
