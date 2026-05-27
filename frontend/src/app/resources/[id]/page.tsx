"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export default function ResourceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { t, language } = useLanguage();

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
    const utcDateString = dateString.endsWith("Z")
      ? dateString
      : `${dateString}Z`;

    return new Date(utcDateString).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCurrentUserRole = () => {
    const storedUser =
      localStorage.getItem("authUser") ||
      localStorage.getItem("adminUser") ||
      localStorage.getItem("user") ||
      sessionStorage.getItem("authUser") ||
      sessionStorage.getItem("adminUser") ||
      sessionStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const storedRole =
          parsedUser.role || parsedUser.user?.role || parsedUser.data?.role;

        if (storedRole) {
          return storedRole;
        }
      } catch (error) {
        console.error(error);
      }
    }

    const token = getStoredToken();

    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || payload.user?.role || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const isAdminUser = () => {
    const role = getCurrentUserRole();
    return role === "admin" || role === "adminstaff";
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
      alert(language === "bn" ? "মন্তব্য করতে লগ ইন করুন।" : "Please log in to comment.");
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
      alert(language === "bn" ? "উত্তর দিতে লগ ইন করুন।" : "Please log in to reply.");
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
      alert(language === "bn" ? "অনুগ্রহ করে লগ ইন করুন।" : "Please log in.");
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
      alert(
        language === "bn"
          ? "শুধু অ্যাডমিন বা অ্যাডমিন স্টাফ মন্তব্য মুছতে পারে।"
          : "Only admin or admin staff can delete comments."
      );
    }
  };

  const handleReaction = async (
    commentId: number,
    reactionType: "like" | "dislike"
  ) => {
    const token = getStoredToken();

    if (!token) {
      alert(language === "bn" ? "প্রতিক্রিয়া দিতে লগ ইন করুন।" : "Please log in to react.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/comments/${commentId}/reaction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reactionType }),
    });

    if (res.ok) {
      fetchComments();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-900 dark:text-white">
        {language === "bn" ? "রিসোর্স লোড হচ্ছে..." : "Loading resource..."}
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="text-center py-20 text-red-500">
        {language === "bn" ? "রিসোর্স পাওয়া যায়নি" : "Resource not found"}
      </div>
    );
  }

  const parentComments = comments.filter((comment) => !comment.parent_comment_id);

  const displayTitle =
    isArticle && language === "bn" && resource.title_bn
      ? resource.title_bn
      : resource.title;

  const displayContent =
    isArticle && language === "bn" && resource.content_bn
      ? resource.content_bn
      : resource.content_en || resource.description;

  const authorText = resource.author
    ? `${language === "bn" ? "লেখক" : "By"} ${resource.author}`
    : resource.candidate_name && resource.job_title
    ? `${resource.candidate_name} • ${resource.job_title}`
    : language === "bn"
    ? "রিজুমে উদাহরণ"
    : "Resume Example";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-slate-900 dark:text-white">
      {resource.image_url && (
        <img
          src={resource.image_url}
          alt={displayTitle}
          className="w-full h-80 object-cover rounded-xl mb-6"
        />
      )}

      <h1 className="text-4xl font-bold mb-4">{displayTitle}</h1>

      <p className="text-slate-400 mb-6">{authorText}</p>

      <div className="text-lg leading-8 text-slate-700 dark:text-slate-300 whitespace-pre-line">
        {displayContent}
      </div>

      <div className="mt-12 border-t border-slate-300 dark:border-slate-700 pt-8">
        <h2 className="text-2xl font-bold mb-4">
          {language === "bn" ? "মন্তব্য" : "Comments"}
        </h2>

        <div className="mb-6">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              language === "bn" ? "একটি মন্তব্য লিখুন..." : "Write a comment..."
            }
            className="w-full min-h-28 rounded-lg border border-slate-300 bg-white p-4 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <button
            onClick={handleSubmitComment}
            className="mt-3 rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
          >
            {language === "bn" ? "মন্তব্য পোস্ট করুন" : "Post Comment"}
          </button>
        </div>

        {parentComments.length === 0 ? (
          <p className="text-slate-400">
            {language === "bn"
              ? "এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন।"
              : "No comments yet. Be the first to comment."}
          </p>
        ) : (
          <div className="space-y-4">
            {parentComments.map((comment) => {
              const replies = comments.filter(
                (reply) => reply.parent_comment_id === comment.id
              );

              return (
                <div
                  key={comment.id}
                  className="rounded-lg border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="font-semibold">
                    {comment.first_name || comment.email || "User"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatTimestamp(comment.created_at)}
                  </p>

                  <p className="mt-2 text-slate-700 dark:text-slate-300">
                    {comment.content}
                  </p>

                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => handleReaction(comment.id, "like")}
                      className="text-sm text-slate-700 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
                    >
                      👍 {comment.likes || 0}
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, "dislike")}
                      className="text-sm text-slate-700 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-300"
                    >
                      👎 {comment.dislikes || 0}
                    </button>

                    <button
                      onClick={() =>
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                      }
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {language === "bn" ? "উত্তর" : "Reply"}
                    </button>
                  </div>

                  {isAdminUser() && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="ml-4 mt-3 text-sm text-red-400 hover:text-red-300"
                    >
                      {language === "bn" ? "মুছুন" : "Delete"}
                    </button>
                  )}

                  {replyingTo === comment.id && (
                    <div className="mt-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={
                          language === "bn" ? "উত্তর লিখুন..." : "Write a reply..."
                        }
                        className="w-full min-h-20 rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />

                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {language === "bn" ? "উত্তর পোস্ট করুন" : "Post Reply"}
                      </button>
                    </div>
                  )}

                  {replies.length > 0 && (
                    <div className="mt-4 space-y-3 border-l border-slate-300 pl-4 dark:border-slate-700">
                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-lg bg-slate-100 p-3 dark:bg-slate-950"
                        >
                          <p className="text-sm font-semibold">
                            {reply.first_name || reply.email || "User"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatTimestamp(reply.created_at)}
                          </p>

                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                            {reply.content}
                          </p>

                          <div className="mt-2 flex items-center gap-4">
                            <button
                              onClick={() => handleReaction(reply.id, "like")}
                              className="text-xs text-slate-700 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-300"
                            >
                              👍 {reply.likes || 0}
                            </button>

                            <button
                              onClick={() => handleReaction(reply.id, "dislike")}
                              className="text-xs text-slate-700 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-300"
                            >
                              👎 {reply.dislikes || 0}
                            </button>
                          </div>

                          {isAdminUser() && (
                            <button
                              onClick={() => handleDeleteComment(reply.id)}
                              className="mt-2 text-xs text-red-400 hover:text-red-300"
                            >
                              {language === "bn" ? "মুছুন" : "Delete"}
                            </button>
                          )}
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