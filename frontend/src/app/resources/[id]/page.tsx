"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Trash2, Send, CornerDownRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const COMMENTS_PER_PAGE = 3;
const REPLIES_PER_COMMENT = 2;

export default function ResourceDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { language } = useLanguage();

  const [resource, setResource] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);
  const [expandedReplies, setExpandedReplies] = useState<Record<number, boolean>>({});

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
      alert(
        language === "bn"
          ? "মন্তব্য করতে লগ ইন করুন।"
          : "Please log in to comment."
      );
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
      alert(
        language === "bn"
          ? "উত্তর দিতে লগ ইন করুন।"
          : "Please log in to reply."
      );
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
      alert(
        language === "bn"
          ? "প্রতিক্রিয়া দিতে লগ ইন করুন।"
          : "Please log in to react."
      );
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

  const toggleReplies = (commentId: number) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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

  const parentComments = comments.filter(
    (comment) => !comment.parent_comment_id
  );

  const displayTitle =
    language === "bn" && resource.title_bn ? resource.title_bn : resource.title;

  const displayContent = isArticle
    ? language === "bn" && resource.content_bn
      ? resource.content_bn
      : resource.content_en
    : language === "bn" && resource.description_bn
    ? resource.description_bn
    : resource.description;

  const displayCandidateName =
    language === "bn" && resource.candidate_name_bn
      ? resource.candidate_name_bn
      : resource.candidate_name;

  const displayJobTitle =
    language === "bn" && resource.job_title_bn
      ? resource.job_title_bn
      : resource.job_title;

  const authorText = resource.author
    ? `${language === "bn" ? "লেখক" : "By"} ${resource.author}`
    : displayCandidateName && displayJobTitle
    ? `${displayCandidateName} • ${displayJobTitle}`
    : language === "bn"
    ? "রিজুমে উদাহরণ"
    : "Resume Example";

  const visibleParentComments = parentComments.slice(0, visibleComments);
  const hasMoreComments = parentComments.length > visibleComments;
  const hasLessComments = visibleComments > COMMENTS_PER_PAGE;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 text-slate-900 dark:text-white">
      {/* Back button */}
      <Link
        href="/resources"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 mb-8 bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-4 py-2 rounded-full transition-all shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{language === "bn" ? "সকল রিসোর্সে ফিরুন" : "Back to Career Library"}</span>
      </Link>

      {/* Main Reader Surface */}
      <article className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-12 shadow-xl mb-10 overflow-hidden">
        {resource.image_url && (
          <div className="w-full h-72 sm:h-96 overflow-hidden rounded-2xl mb-8 border border-slate-100 dark:border-slate-800 shadow-inner">
            <img
              src={resource.image_url}
              alt={displayTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-blue-700 bg-blue-50/80 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
            {isArticle
              ? language === "bn" ? "প্রবন্ধ" : "Article"
              : language === "bn" ? "রিজুমে নমুনা" : "Resume Example"}
          </span>

          {resource.subcategory && (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {resource.subcategory}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 text-slate-900 dark:text-white tracking-tight leading-tight">
          {displayTitle}
        </h1>

        {/* Author / Contributor Info */}
        <div className="flex items-center gap-3 pb-8 mb-8 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {(resource.author || displayCandidateName || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {authorText}
            </p>
            <p className="text-xs text-slate-400">
              {language === "bn" ? "ডিজিটাল ক্যারিয়ার হাব গাইড" : "Digital Career Hub Resource"}
            </p>
          </div>
        </div>

        <div className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-4">
          {displayContent}
        </div>
      </article>

      {/* Comments Section */}
      <section className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-10 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2.5 text-slate-900 dark:text-white">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{language === "bn" ? "মন্তব্য" : "Comments"}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
              {parentComments.length}
            </span>
          </h2>
        </div>

        {/* New Comment Input Box */}
        <div className="mb-8 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              language === "bn" ? "আপনার মতামত বা প্রশ্ন লিখুন..." : "Share your questions or thoughts on this resource..."
            }
            className="w-full min-h-24 rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmitComment}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "মন্তব্য পোস্ট করুন" : "Post Comment"}</span>
            </button>
          </div>
        </div>

        {parentComments.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-sm">
            {language === "bn"
              ? "এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনিই করুন!"
              : "No comments yet. Be the first to share your thoughts!"}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleParentComments.map((comment) => {
                const replies = comments.filter(
                  (reply) => reply.parent_comment_id === comment.id
                );
                const repliesExpanded = expandedReplies[comment.id];
                const visibleReplies = repliesExpanded
                  ? replies
                  : replies.slice(0, REPLIES_PER_COMMENT);
                const hasMoreReplies = replies.length > REPLIES_PER_COMMENT;

                return (
                  <div
                    key={comment.id}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-5 dark:border-slate-800 dark:bg-slate-800/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                          {(comment.first_name || comment.email || "U").slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {comment.first_name || comment.email || "User"}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {formatTimestamp(comment.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                      {comment.content}
                    </p>

                    <div className="mt-3 flex items-center gap-2 pl-10">
                      <button
                        onClick={() => handleReaction(comment.id, "like")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-blue-600 bg-white dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{comment.likes || 0}</span>
                      </button>

                      <button
                        onClick={() => handleReaction(comment.id, "dislike")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-600 hover:text-rose-600 bg-white dark:bg-slate-800 dark:text-slate-300 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{comment.dislikes || 0}</span>
                      </button>

                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40 transition-colors"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{language === "bn" ? "উত্তর" : "Reply"}</span>
                      </button>

                      {isAdminUser() && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 transition-colors ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === "bn" ? "মুছুন" : "Delete"}</span>
                        </button>
                      )}
                    </div>

                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-10">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={
                            language === "bn"
                              ? "উত্তর লিখুন..."
                              : "Write a reply..."
                          }
                          className="w-full min-h-20 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />

                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="px-4 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm"
                          >
                            {language === "bn" ? "উত্তর পোস্ট করুন" : "Post Reply"}
                          </button>
                        </div>
                      </div>
                    )}

                    {replies.length > 0 && (
                      <div className="mt-4 border-l-2 border-blue-200 dark:border-blue-900/50 pl-4 ml-4 sm:ml-6 space-y-3">
                        {visibleReplies.map((reply) => (
                          <div
                            key={reply.id}
                            className="rounded-xl bg-white p-4 border border-slate-200/60 dark:bg-slate-900/90 dark:border-slate-800"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-[10px]">
                                {(reply.first_name || reply.email || "U").slice(0, 1).toUpperCase()}
                              </div>
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {reply.first_name || reply.email || "User"}
                              </p>
                              <span className="text-[10px] text-slate-400 ml-auto">
                                {formatTimestamp(reply.created_at)}
                              </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                              {reply.content}
                            </p>

                            <div className="mt-2.5 flex items-center gap-2 pl-8">
                              <button
                                onClick={() => handleReaction(reply.id, "like")}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-slate-600 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{reply.likes || 0}</span>
                              </button>

                              <button
                                onClick={() => handleReaction(reply.id, "dislike")}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] text-slate-600 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span>{reply.dislikes || 0}</span>
                              </button>

                              {isAdminUser() && (
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="text-[11px] text-rose-500 hover:text-rose-700 ml-auto"
                                >
                                  {language === "bn" ? "মুছুন" : "Delete"}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {hasMoreReplies && (
                          <button
                            onClick={() => toggleReplies(comment.id)}
                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-500"
                          >
                            {repliesExpanded
                              ? language === "bn"
                                ? "কম দেখান"
                                : "Show less replies"
                              : language === "bn"
                              ? `আরও ${replies.length - REPLIES_PER_COMMENT}টি উত্তর দেখুন`
                              : `Show ${replies.length - REPLIES_PER_COMMENT} more ${replies.length - REPLIES_PER_COMMENT === 1 ? "reply" : "replies"}`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show More / Show Less comments */}
            <div className="mt-8 flex gap-3">
              {hasMoreComments && (
                <button
                  onClick={() => setVisibleComments((prev) => prev + COMMENTS_PER_PAGE)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-xs"
                >
                  {language === "bn"
                    ? `আরও ${Math.min(COMMENTS_PER_PAGE, parentComments.length - visibleComments)}টি মন্তব্য দেখুন`
                    : `Show ${Math.min(COMMENTS_PER_PAGE, parentComments.length - visibleComments)} more comment${Math.min(COMMENTS_PER_PAGE, parentComments.length - visibleComments) === 1 ? "" : "s"}`}
                </button>
              )}

              {hasLessComments && (
                <button
                  onClick={() => setVisibleComments(COMMENTS_PER_PAGE)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 shadow-xs"
                >
                  {language === "bn" ? "কম দেখান" : "Show less"}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}