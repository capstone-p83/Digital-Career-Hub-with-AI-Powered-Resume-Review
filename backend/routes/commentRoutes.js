const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET comments for one article
router.get("/article/:articleId", async (req, res) => {
  try {
    const { articleId } = req.params;

    const result = await db.query(
      `
      SELECT 
        c.id,
        c.article_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.created_at AT TIME ZONE 'UTC' AS created_at,
        COALESCE(SUM(CASE WHEN cr.reaction_type = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN cr.reaction_type = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes,
        u.email,
        up.first_name,
        up.last_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN user_profile up ON up.user_id = u.id
      LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
      WHERE c.article_id = $1
      GROUP BY c.id, u.email, up.first_name, up.last_name
      ORDER BY c.created_at ASC
      `,
      [articleId]
    );

    return res.json({
      status: "ok",
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch comments",
      error: error.message,
    });
  }
});

// GET comments for one resume example
router.get("/resume/:resumeId", async (req, res) => {
  try {
    const { resumeId } = req.params;

    const result = await db.query(
      `
      SELECT 
        c.id,
        c.resume_example_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.created_at AT TIME ZONE 'UTC' AS created_at,
        COALESCE(SUM(CASE WHEN cr.reaction_type = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN cr.reaction_type = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes,
        u.email,
        up.first_name,
        up.last_name
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN user_profile up ON up.user_id = u.id
      LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
      WHERE c.resume_example_id = $1
      GROUP BY c.id, u.email, up.first_name, up.last_name
      ORDER BY c.created_at ASC
      `,
      [resumeId]
    );

    return res.json({
      status: "ok",
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get resume comments error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch resume comments",
      error: error.message,
    });
  }
});

// ADD comment under article
router.post("/article/:articleId", authMiddleware, async (req, res) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot be empty",
      });
    }

    const result = await db.query(
      `
      INSERT INTO comments (article_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, NULL, $3)
      RETURNING id, article_id, user_id, parent_comment_id, content, created_at
      `,
      [articleId, userId, content.trim()]
    );

    return res.status(201).json({
      status: "ok",
      message: "Comment added successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to add comment",
      error: error.message,
    });
  }
});

// ADD comment under resume example
router.post("/resume/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Comment cannot be empty",
      });
    }

    const result = await db.query(
      `
      INSERT INTO comments (resume_example_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, NULL, $3)
      RETURNING id, resume_example_id, user_id, parent_comment_id, content, created_at
      `,
      [resumeId, userId, content.trim()]
    );

    return res.status(201).json({
      status: "ok",
      message: "Resume comment added successfully",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Add resume comment error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to add resume comment",
      error: error.message,
    });
  }
});

// ADD reply under comment
router.post("/:commentId/replies", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Reply cannot be empty",
      });
    }

    const parent = await db.query(
      "SELECT id, article_id, resume_example_id FROM comments WHERE id = $1",
      [commentId]
    );

    if (parent.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Parent comment not found",
      });
    }

    const parentComment = parent.rows[0];

    const result = await db.query(
      `
      INSERT INTO comments (article_id, resume_example_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, article_id, resume_example_id, user_id, parent_comment_id, content, created_at
      `,
      [
        parentComment.article_id,
        parentComment.resume_example_id,
        userId,
        commentId,
        content.trim(),
      ]
    );

    return res.status(201).json({
      status: "ok",
      message: "Reply added successfully",
      reply: result.rows[0],
    });
  } catch (error) {
    console.error("Add reply error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to add reply",
      error: error.message,
    });
  }
});

// ADD, UPDATE, OR REMOVE like/dislike reaction
router.post("/:commentId/reaction", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;
    const { reactionType } = req.body;
    const userId = req.user.id;

    if (reactionType !== "like" && reactionType !== "dislike") {
      return res.status(400).json({
        status: "error",
        message: "Reaction must be like or dislike",
      });
    }

    const existingReaction = await db.query(
      "SELECT id, reaction_type FROM comment_reactions WHERE comment_id = $1 AND user_id = $2",
      [commentId, userId]
    );

    if (existingReaction.rows.length > 0) {
      if (existingReaction.rows[0].reaction_type === reactionType) {
        await db.query(
          "DELETE FROM comment_reactions WHERE comment_id = $1 AND user_id = $2",
          [commentId, userId]
        );

        return res.json({
          status: "ok",
          message: "Reaction removed successfully",
        });
      }

      await db.query(
        "UPDATE comment_reactions SET reaction_type = $1 WHERE comment_id = $2 AND user_id = $3",
        [reactionType, commentId, userId]
      );

      return res.json({
        status: "ok",
        message: "Reaction updated successfully",
      });
    }

    await db.query(
      "INSERT INTO comment_reactions (comment_id, user_id, reaction_type) VALUES ($1, $2, $3)",
      [commentId, userId, reactionType]
    );

    return res.status(201).json({
      status: "ok",
      message: "Reaction added successfully",
    });
  } catch (error) {
    console.error("Comment reaction error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to update reaction",
      error: error.message,
    });
  }
});

// DELETE comment/reply admin or adminstaff only
router.delete("/:commentId", authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.params;

    if (req.user.role !== "admin" && req.user.role !== "adminstaff") {
      return res.status(403).json({
        status: "error",
        message: "Only Admin or AdminStaff can delete comments",
      });
    }

    const result = await db.query(
      "DELETE FROM comments WHERE id = $1 RETURNING id",
      [commentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found",
      });
    }

    return res.json({
      status: "ok",
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to delete comment",
      error: error.message,
    });
  }
});

module.exports = router;
