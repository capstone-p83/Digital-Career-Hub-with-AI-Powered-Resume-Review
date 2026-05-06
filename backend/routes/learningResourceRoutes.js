const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// GET /api/learning-resources - get all articles (everyone)
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM articles 
       WHERE is_deleted = false 
       ORDER BY created_at DESC`
    );

    return res.json({
      status: "ok",
      articles: result.rows,
    });
  } catch (error) {
    console.error("Get articles error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
});

// POST /api/learning-resources - create article (admin/adminstaff only)
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { title, author, image_url, content_en, content_bn, article_url } = req.body;

      if (!title || !author || !content_en) {
        return res.status(400).json({
          status: "error",
          message: "Title, author and content are required",
        });
      }

      const result = await db.query(
        `INSERT INTO articles (title, author, image_url, content_en, content_bn, article_url, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [title, author, image_url || null, content_en, content_bn || content_en, article_url || null, req.user.id]
      );

      return res.status(201).json({
        status: "ok",
        message: "Article created successfully",
        article: result.rows[0],
      });
    } catch (error) {
      console.error("Create article error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to create article",
        error: error.message,
      });
    }
  }
);

// GET /api/learning-resources/resumes - get all resume examples (everyone)
router.get("/resumes", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM resume_examples 
       WHERE is_deleted = false 
       ORDER BY created_at DESC`
    );

    return res.json({
      status: "ok",
      resumes: result.rows,
    });
  } catch (error) {
    console.error("Get resumes error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch resume examples",
      error: error.message,
    });
  }
});

// POST /api/learning-resources/resumes - create resume example (admin/adminstaff only)
router.post(
  "/resumes",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { title, candidate_name, job_title, image_url, description } = req.body;

      if (!title || !candidate_name || !job_title || !description) {
        return res.status(400).json({
          status: "error",
          message: "Title, candidate name, job title and description are required",
        });
      }

      const result = await db.query(
        `INSERT INTO resume_examples (title, candidate_name, job_title, image_url, description, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, candidate_name, job_title, image_url || null, description, req.user.id]
      );

      return res.status(201).json({
        status: "ok",
        message: "Resume example created successfully",
        resume: result.rows[0],
      });
    } catch (error) {
      console.error("Create resume error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to create resume example",
        error: error.message,
      });
    }
  }
);

// PUT /api/learning-resources/resumes/:id - update resume example (admin/adminstaff only)
router.put(
  "/resumes/:id",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, candidate_name, job_title, image_url, description } = req.body;

      if (!title || !candidate_name || !job_title || !description) {
        return res.status(400).json({
          status: "error",
          message: "Title, candidate name, job title and description are required",
        });
      }

      const result = await db.query(
        `UPDATE resume_examples
         SET title = $1,
             candidate_name = $2,
             job_title = $3,
             image_url = $4,
             description = $5,
             updated_at = NOW()
         WHERE id = $6 AND is_deleted = false
         RETURNING *`,
        [title, candidate_name, job_title, image_url || null, description, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Resume example not found",
        });
      }

      return res.json({
        status: "ok",
        message: "Resume example updated successfully",
        resume: result.rows[0],
      });
    } catch (error) {
      console.error("Update resume error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to update resume example",
        error: error.message,
      });
    }
  }
);

// DELETE /api/learning-resources/resumes/:id - soft delete resume (admin/adminstaff only)
router.delete(
  "/resumes/:id",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE resume_examples
         SET is_deleted = true,
             deleted_at = NOW()
         WHERE id = $1 AND is_deleted = false
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Resume example not found",
        });
      }

      return res.json({
        status: "ok",
        message: "Resume example deleted successfully",
        resume: result.rows[0],
      });
    } catch (error) {
      console.error("Delete resume error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to delete resume example",
        error: error.message,
      });
    }
  }
);

// GET /api/learning-resources/:id - get single article (everyone)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT * FROM articles 
       WHERE id = $1 AND is_deleted = false`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Article not found",
      });
    }

    return res.json({
      status: "ok",
      article: result.rows[0],
    });
  } catch (error) {
    console.error("Get article error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch article",
      error: error.message,
    });
  }
});

// PUT /api/learning-resources/:id - update article (admin/adminstaff only)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, image_url, content_en, content_bn, article_url } = req.body;

      if (!title || !author || !content_en) {
        return res.status(400).json({
          status: "error",
          message: "Title, author and content are required",
        });
      }

      const result = await db.query(
        `UPDATE articles
         SET title = $1,
             author = $2,
             image_url = $3,
             content_en = $4,
             content_bn = $5,
             article_url = $6,
             updated_at = NOW()
         WHERE id = $7 AND is_deleted = false
         RETURNING *`,
        [title, author, image_url || null, content_en, content_bn || content_en, article_url || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Article not found",
        });
      }

      return res.json({
        status: "ok",
        message: "Article updated successfully",
        article: result.rows[0],
      });
    } catch (error) {
      console.error("Update article error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to update article",
        error: error.message,
      });
    }
  }
);

// DELETE /api/learning-resources/:id - soft delete article (admin/adminstaff only)
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "adminstaff"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        `UPDATE articles
         SET is_deleted = true,
             deleted_at = NOW()
         WHERE id = $1 AND is_deleted = false
         RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Article not found",
        });
      }

      return res.json({
        status: "ok",
        message: "Article deleted successfully",
        article: result.rows[0],
      });
    } catch (error) {
      console.error("Delete article error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to delete article",
        error: error.message,
      });
    }
  }
);

module.exports = router;