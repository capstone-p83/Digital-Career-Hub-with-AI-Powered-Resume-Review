"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function ResourceDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [resource, setResource] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);

  const isArticle = id?.startsWith("article-");
  const cleanId = id?.replace("article-", "").replace("resume-", "");

  const getStoredToken = () => {
    const storageTokenKeys = [
      "authToken",
      "adminToken",
      "token",
      "accessToken",
      "jwt",
      "userToken",
    ];

    let token = storageTokenKeys
      .map((key) => localStorage.getItem(key) || sessionStorage.getItem(key))
      .find(Boolean);

    if (!token) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.toLowerCase().includes("token")) {
          token = localStorage.getItem(key) || undefined;
          break;
        }
      }
    }

    if (!token) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.toLowerCase().includes("token")) {
          token = sessionStorage.getItem(key) || undefined;
          break;
        }
      }
    }

    return token;
  };

  const formatTimestamp = (dateString: string) => {
    const utcDateString = dateString.endsWith("Z") ? dateString : `${dateString}Z`;

    return new Date(utcDateString).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchComments = async () => {
    try {
      const commentEndpoint = isArticle
        ? `${API_BASE_URL}/comments/article/${cleanId}`
        : `${API_BASE_URL}/comments/resume/${cleanId}`;

      const res = await fetch(commentEndpoint);
      const data = await res.json();

      setComments(data.comments || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const endpoint = isArticle
          ? `${API_BASE_URL}/learning-resources/${cleanId}`
          : `${API_BASE_URL}/learning-resources/resumes/${cleanId}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        setResource(isArticle ? data.article : data.resume);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
      fetchComments();
    }
  }, [id, isArticle, cleanId]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    const token = getStoredToken();

    if (!token) {
      alert("Please log in to comment.");
      return;
    }

    const commentEndpoint = isArticle
      ? `${API_BASE_URL}/comments/article/${cleanId}`
      : `${API_BASE_URL}/comments/resume/${cleanId}`;

    const res = await fetch(commentEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: commentText }),
    });

    if (res.ok) {
      setCommentText("");
      fetchComments();
    }
  };

  const handleSubmitReply = async (commentId: number) => {
    if (!replyText.trim()) return;

    const token = getStoredToken();

    if (!token) {
      alert("Please log in to reply.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/comments/${commentId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: replyText }),
    });

    if (res.ok) {
      setReplyText("");
      setReplyingTo(null);
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    const token = getStoredToken();

    if (!token) {
      alert("Please log in.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      fetchComments();
    } else {
      alert("Only admin or admin staff can delete comments.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-white">Loading resource...</div>;
  }

  if (!resource) {
    return <div className="text-center py-20 text-red-500">Resource not found</div>;
  }

  const parentComments = comments.filter((comment) => !comment.parent_comment_id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-white">
      {resource.image_url && (
        <img
          src={resource.image_url}
          alt={resource.title}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>

      <p className="text-slate-400 mb-6">
        {resource.author
          ? `By ${resource.author}`
          : resource.candidate_name && resource.job_title
          ? `${resource.candidate_name} • ${resource.job_title}`
          : "Resume Example"}
      </p>

      <div className="text-lg leading-8 text-slate-300 whitespace-pre-line">
        {resource.content_en || resource.description}
      </div>

      <div className="mt-12 border-t border-slate-700 pt-8">
        <h2 className="text-2xl font-bold mb-4">Comments</h2>

        <div className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="w-full min-h-28 rounded-lg border border-slate-700 bg-slate-900 p-4 text-white outline-none"
          />

          <button
            onClick={handleSubmitComment}
            className="mt-3 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            Post Comment
          </button>
        </div>

        {parentComments.length === 0 ? (
          <p className="text-slate-400">No comments yet. Be the first to comment.</p>
        ) : (
          <div className="space-y-4">
            {parentComments.map((comment) => {
              const replies = comments.filter(
                (reply) => reply.parent_comment_id === comment.id
              );

              return (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-4"
                >
                  <p className="font-semibold">
                    {comment.first_name || comment.email || "User"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatTimestamp(comment.created_at)}
                  </p>

                  <p className="mt-2 text-slate-300">{comment.content}</p>

                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    }
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Reply
                  </button>

                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="ml-4 mt-3 text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>

                  {replyingTo === comment.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full min-h-20 rounded-lg border border-slate-700 bg-slate-950 p-3 text-white outline-none"
                      />

                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l border-slate-700 pl-4">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg bg-slate-950 p-3"
                        >
                          <p className="text-sm font-semibold">
                            {reply.first_name || reply.email || "User"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatTimestamp(reply.created_at)}
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {reply.content}
                          </p>

                          <button
                            onClick={() => handleDeleteComment(reply.id)}
                            className="mt-2 text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}