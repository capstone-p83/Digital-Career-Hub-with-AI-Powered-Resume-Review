/**
 * Resume review API helpers
 */

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export type ResumeReviewSubmission = {
  resume: File;
  target_job_role: string;
  target_job_description: string;
};

export type ResumeReviewAnalysis = {
  feedback_id?: number;
  resume_id?: number;
  created_at?: string;

  score: number;
  summary: string;

  target_job_role: string;
  target_job_description?: string | null;

  confidence: "high" | "medium" | "low" | string;
  evaluation_basis: string;

  missing_resume_sections: string[];
  missing_job_information: boolean;

  resume_text_truncated?: boolean;
  resume_length_warning?: string;

  job_description_truncated?: boolean;
  job_description_warning?: string;

  impact_explanation: string;

  strengths: string[];
  areas_for_improvement: string[];
  actionable_suggestions: string[];

  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];
};

export type ResumeFeedbackHistoryItem = {
  feedback_id: number;
  resume_id: number;
  score: number;
  target_job_role: string;
  target_job_description?: string | null;
  confidence?: string | null;
  created_at: string;
};

export type ResumeReviewSuccessBody = {
  status: "ok";
  analysis: ResumeReviewAnalysis;
};

export type ResumeFeedbackListBody = {
  status: "ok";
  feedbacks: ResumeFeedbackHistoryItem[];
};

export type ResumeReviewErrorBody = {
  status?: string;
  message?: string;
};

export const RESUME_REVIEW_STORAGE_KEY = "resumeReviewResult";

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

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
  const url = `${apiBase.replace(/\/$/, "")}/resume/review`;

  return fetch(url, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(token),
  });
}

export async function getLatestResumeFeedback(
  token?: string | null
): Promise<Response> {
  const url = `${apiBase.replace(/\/$/, "")}/resume/feedback/latest`;

  return fetch(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

export async function getResumeFeedbackHistory(
  token?: string | null
): Promise<Response> {
  const url = `${apiBase.replace(/\/$/, "")}/resume/feedback`;

  return fetch(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

export async function getResumeFeedbackById(
  feedbackId: number,
  token?: string | null
): Promise<Response> {
  const url = `${apiBase.replace(/\/$/, "")}/resume/feedback/${feedbackId}`;

  return fetch(url, {
    method: "GET",
    headers: getAuthHeaders(token),
  });
}

export async function deleteResumeFeedbackById(
  feedbackId: number,
  token?: string | null
): Promise<Response> {
  const url = `${apiBase.replace(/\/$/, "")}/resume/feedback/${feedbackId}`;

  return fetch(url, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
}