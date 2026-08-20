const {
  searchFallbackOccupations,
} = require("../data/fallbackOccupations");

const ESCO_API_BASE = "https://ec.europa.eu/esco/api";
const ESCO_TIMEOUT_MS = 3000;

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
  if (!data || typeof data !== "object") {
    return [];
  }

  const embedded =
    data._embedded?.results ||
    data._embedded?.concepts ||
    data._embedded?.items ||
    [];

  if (Array.isArray(embedded)) {
    return embedded;
  }

  if (Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

async function fetchEsco(endpoint, params) {
  const url =
    `${ESCO_API_BASE}${endpoint}?${params.toString()}`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, ESCO_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const contentType =
      response.headers.get("content-type") || "";

    const body = await response.text();

    if (!response.ok) {
      throw new Error(
        `ESCO returned HTTP ${response.status}`
      );
    }

    if (!contentType.includes("application/json")) {
      throw new Error(
        `ESCO returned ${contentType || "non-JSON content"}`
      );
    }

    return JSON.parse(body);
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("ESCO request timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function rankJobs(jobs, query) {
  const normalizedQuery =
    query.toLowerCase().trim();

  return jobs
    .map((job) => {
      const title =
        String(job.title || "").toLowerCase();

      let score = 4;

      if (title === normalizedQuery) {
        score = 0;
      } else if (
        title.startsWith(normalizedQuery)
      ) {
        score = 1;
      } else if (
        title
          .split(/\s+/)
          .some((word) =>
            word.startsWith(normalizedQuery)
          )
      ) {
        score = 2;
      } else if (
        title.includes(normalizedQuery)
      ) {
        score = 3;
      }

      return {
        ...job,
        score,
      };
    })
    .filter((job) => job.score < 4)
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }

      return a.title.length - b.title.length;
    })
    .map(({ score, ...job }) => job);
}

function removeDuplicateJobs(jobs) {
  const seen = new Set();

  return jobs.filter((job) => {
    const title =
      String(job.title || "").trim();

    if (!title) {
      return false;
    }

    const key =
      job.uri ||
      title.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

async function searchJobs(req, res) {
  const q =
    String(req.query.q || "").trim();

  if (q.length < 2) {
    return res.json({
      status: "ok",
      jobs: [],
      source: "none",
    });
  }

  try {
    const suggestParams =
      new URLSearchParams({
        text: q,
        language: "en",
        type: "occupation",
        limit: "20",
      });

    const searchParams =
      new URLSearchParams({
        text: q,
        language: "en",
        type: "occupation",
        limit: "30",
        full: "false",
      });

    const results =
      await Promise.allSettled([
        fetchEsco(
          "/suggest2",
          suggestParams
        ),
        fetchEsco(
          "/search",
          searchParams
        ),
      ]);

    const escoAvailable =
      results.some(
        (result) =>
          result.status === "fulfilled"
      );

    const suggestData =
      results[0].status === "fulfilled"
        ? results[0].value
        : {};

    const searchData =
      results[1].status === "fulfilled"
        ? results[1].value
        : {};

    const suggestJobs =
      getRawItems(suggestData).map(
        normalizeEscoItem
      );

    const searchedJobs =
      getRawItems(searchData).map(
        normalizeEscoItem
      );

    const escoJobs =
      rankJobs(
        removeDuplicateJobs([
          ...suggestJobs,
          ...searchedJobs,
        ]),
        q
      ).slice(0, 8);

    if (escoJobs.length > 0) {
      console.log(
        `[Job Search] ESCO returned ${escoJobs.length} result(s) for "${q}"`
      );

      return res.json({
        status: "ok",
        jobs: escoJobs,
        source: "esco",
      });
    }

    const fallbackJobs =
      searchFallbackOccupations(q, 8);

    if (fallbackJobs.length > 0) {
      console.warn(
        `[Job Search] Using fallback occupations for "${q}"`
      );

      return res.json({
        status: "ok",
        jobs: fallbackJobs,
        source: "fallback",
      });
    }

    console.warn(
      `[Job Search] No occupation found for "${q}". ESCO available: ${escoAvailable}`
    );

    return res.json({
      status: "ok",
      jobs: [],
      source: escoAvailable
        ? "esco"
        : "fallback",
    });
  } catch (error) {
    console.error(
      "Job search error:",
      error
    );

    const fallbackJobs =
      searchFallbackOccupations(q, 8);

    return res.json({
      status: "ok",
      jobs: fallbackJobs,
      source: "fallback",
    });
  }
}

module.exports = {
  searchJobs,
};
