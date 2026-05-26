const ESCO_API_BASE = "https://ec.europa.eu/esco/api";

function getLocalizedText(value) {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.en ||
      value["en-us"] ||
      value["en-gb"] ||
      Object.values(value)[0] ||
      ""
    );
  }

  return "";
}

function normalizeEscoItem(item) {
  const title =
    getLocalizedText(item.title) ||
    getLocalizedText(item.preferredLabel) ||
    getLocalizedText(item.label);

  return {
    title,
    uri: item.uri || "",
    description: getLocalizedText(item.description),
  };
}

function getRawItems(data) {
  const embedded =
    data._embedded?.results ||
    data._embedded?.concepts ||
    data._embedded?.items ||
    [];

  if (Array.isArray(embedded)) return embedded;
  if (Array.isArray(data.results)) return data.results;

  return [];
}

// backend/controllers/jobController.js

async function fetchEsco(endpoint, params) {
  const url = `${ESCO_API_BASE}${endpoint}?${params.toString()}`;
  
  // --- ADD TIMEOUT LOGS HERE ---
  const startTime = Date.now();
  console.log(`[ESCO API Request] Outgoing to: ${url}`);
  // ------------------------------

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[ESCO API Response] Success! Status: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch ESCO data.");
    }

    return response.json();
  } catch (err) {
    const duration = Date.now() - startTime;
    // This logs the exact millisecond count when the connection drops or times out
    console.error(`[ESCO API Error] Failed after ${duration}ms! Message: ${err.message}`);
    throw err; // Re-throw so your existing catch block still handles it
  }
}

function rankJobs(jobs, query) {
  const normalizedQuery = query.toLowerCase();

  return jobs
    .map((job) => {
      const title = job.title.toLowerCase();

      let score = 3;

      if (title === normalizedQuery) {
        score = 0;
      } else if (title.startsWith(normalizedQuery)) {
        score = 1;
      } else if (title.includes(normalizedQuery)) {
        score = 2;
      }

      return {
        ...job,
        score,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return a.title.length - b.title.length;
    })
    .map(({ score, ...job }) => job);
}

function removeDuplicateJobs(jobs) {
  const seen = new Set();

  return jobs.filter((job) => {
    const key = job.uri || job.title.toLowerCase();

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

async function searchJobs(req, res) {
  try {
    const q = String(req.query.q || "").trim();

    if (q.length < 1) {
      return res.json({
        status: "ok",
        jobs: [],
      });
    }

    const suggestParams = new URLSearchParams({
      text: q,
      language: "en",
      type: "occupation",
      limit: "20",
    });

    const searchParams = new URLSearchParams({
      text: q,
      language: "en",
      type: "occupation",
      limit: "30",
      full: "false",
    });

    const [suggestData, searchData] = await Promise.all([
      fetchEsco("/suggest2", suggestParams),
      fetchEsco("/search", searchParams),
    ]);

    const suggestJobs = getRawItems(suggestData).map(normalizeEscoItem);
    const searchJobs = getRawItems(searchData).map(normalizeEscoItem);

    const jobs = removeDuplicateJobs([...suggestJobs, ...searchJobs])
      .filter((job) => job.title)
      .filter((job) => {
        const title = job.title.toLowerCase();
        const query = q.toLowerCase();

        return title.startsWith(query) || title.includes(query);
      });

    const rankedJobs = rankJobs(jobs, q).slice(0, 8);

    return res.json({
      status: "ok",
      jobs: rankedJobs,
    });
  } catch (error) {
    console.error("ESCO job search error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to search job titles.",
    });
  }
}

module.exports = {
  searchJobs,
};