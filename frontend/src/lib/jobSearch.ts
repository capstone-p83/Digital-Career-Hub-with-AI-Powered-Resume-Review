const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export type JobSuggestion = {
  title: string;
  uri: string;
  description?: string;
};

export type JobSearchSuccessBody = {
  status: "ok";
  jobs: JobSuggestion[];
};

export async function searchJobTitles(
  query: string,
  token?: string | null
): Promise<JobSuggestion[]> {
  const q = query.trim();

  if (!q) return [];

  const headers: HeadersInit = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${apiBase.replace(/\/$/, "")}/jobs/search?q=${encodeURIComponent(
    q
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as JobSearchSuccessBody;

  return Array.isArray(data.jobs) ? data.jobs : [];
}