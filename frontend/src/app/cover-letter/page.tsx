"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import {
  FileText,
  Sparkles,
  Download,
  RotateCcw,
  GraduationCap,
  Briefcase,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  Zap,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/Card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

type TemplateStyle =
  | "graduate"
  | "professional"
  | "career-change";

type CoverLetterResult = {
  salutation: string;
  paragraphs: string[];
  closing: string;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  jobTitle: string;
  company: string;
  hiringManager: string;
  skills: string;
  experience: string;
  whyRole: string;
  whyCompany: string;
  jobDescription: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  date: new Date().toISOString().slice(0, 10),
  jobTitle: "",
  company: "",
  hiringManager: "",
  skills: "",
  experience: "",
  whyRole: "",
  whyCompany: "",
  jobDescription: "",
};

export default function CoverLetterPage() {
  const router = useRouter();

  const {
    user,
    token,
    isAuthenticated,
    isLoading,
  } = useAuth();

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [templateStyle, setTemplateStyle] =
    useState<TemplateStyle>("graduate");

  const [coverLetter, setCoverLetter] =
    useState<CoverLetterResult | null>(null);

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [warning, setWarning] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [remaining, setRemaining] =
    useState<number | null>(null);

  const [unlimited, setUnlimited] =
    useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [
    isLoading,
    isAuthenticated,
    router,
  ]);

  useEffect(() => {
    if (!user) return;

    const firstName =
      user.profile?.first_name || "";

    const lastName =
      user.profile?.last_name || "";

    setForm((previous) => ({
      ...previous,

      fullName:
        `${firstName} ${lastName}`.trim(),

      email:
        user.email || "",

      phone:
        user.profile?.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    async function loadStatus() {
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/cover-letter/status`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (response.ok) {
          setUnlimited(
            Boolean(data.unlimited)
          );

          setRemaining(
            data.remaining
          );
        }
      } catch {
        // Usage status is optional.
      }
    }

    loadStatus();
  }, [token]);

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const generateCoverLetter =
    async () => {
      if (!token) {
        setError(
          "Please log in first."
        );
        return;
      }

      try {
        setGenerating(true);
        setError("");
        setWarning("");
        setSuccess("");

        const response = await fetch(
          `${API_BASE_URL}/cover-letter/generate`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              ...form,
              templateStyle,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          if (
            Array.isArray(data.missing)
          ) {
            throw new Error(
              `Please add: ${data.missing.join(
                ", "
              )}.`
            );
          }

          throw new Error(
            data.message ||
              "Failed to generate cover letter."
          );
        }

        setCoverLetter(
          data.cover_letter
        );

        setWarning(
          data.warning || ""
        );

        setUnlimited(
          Boolean(data.unlimited)
        );

        setRemaining(
          data.remaining
        );

        setSuccess(
          "Cover letter generated successfully."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate cover letter."
        );
      } finally {
        setGenerating(false);
      }
    };

  const updateParagraph = (
    index: number,
    value: string
  ) => {
    setCoverLetter((previous) => {
      if (!previous) {
        return previous;
      }

      const paragraphs = [
        ...previous.paragraphs,
      ];

      paragraphs[index] = value;

      return {
        ...previous,
        paragraphs,
      };
    });
  };

  const downloadWord =
    async () => {
      if (!coverLetter) return;

      const bodyParagraphs =
        coverLetter.paragraphs.map(
          (text) =>
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  font: "Arial",
                  size: 22,
                }),
              ],

              spacing: {
                after: 160,
                line: 240,
              },
            })
        );

      const doc =
        new Document({
          sections: [
            {
              properties: {
                page: {
                  size: {
                    width: 11906,
                    height: 16838,
                  },

                  margin: {
                    top: 1000,
                    right: 1100,
                    bottom: 1000,
                    left: 1100,
                  },
                },
              },

              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        form.fullName,
                      bold: true,
                      font: "Arial",
                      size: 24,
                    }),
                  ],
                }),

                ...(form.address
                  ? [
                      simpleParagraph(
                        form.address
                      ),
                    ]
                  : []),

                simpleParagraph(
                  form.email
                ),

                ...(form.phone
                  ? [
                      simpleParagraph(
                        form.phone
                      ),
                    ]
                  : []),

                new Paragraph({
                  spacing: {
                    after: 180,
                  },
                }),

                simpleParagraph(
                  formatDate(
                    form.date
                  )
                ),

                new Paragraph({
                  spacing: {
                    after: 160,
                  },
                }),

                simpleParagraph(
                  form.hiringManager ||
                    "Hiring Manager"
                ),

                simpleParagraph(
                  form.company
                ),

                new Paragraph({
                  spacing: {
                    after: 160,
                  },
                }),

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        coverLetter.salutation,
                      font: "Arial",
                      size: 22,
                    }),
                  ],

                  spacing: {
                    after: 160,
                  },
                }),

                ...bodyParagraphs,

                new Paragraph({
                  children: [
                    new TextRun({
                      text:
                        coverLetter.closing,
                      font: "Arial",
                      size: 22,
                    }),
                  ],

                  spacing: {
                    after: 120,
                  },
                }),

                simpleParagraph(
                  form.fullName
                ),
              ],
            },
          ],
        });

      const blob =
        await Packer.toBlob(
          doc
        );

      const url =
        URL.createObjectURL(blob);

      const link =
        window.document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        `${safeFileName(
          form.fullName
        )}-${safeFileName(
          form.company
        )}-Cover-Letter.docx`;

      window.document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    };

  const reset = () => {
    setCoverLetter(null);

    setWarning("");
    setError("");
    setSuccess("");

    setForm((previous) => ({
      ...emptyForm,

      fullName:
        previous.fullName,

      email:
        previous.email,

      phone:
        previous.phone,
    }));
  };

  if (
    isLoading ||
    !isAuthenticated
  ) {
    return null;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="relative text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          AI Cover Letter Studio
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          AI Cover Letter Generator
        </h1>

        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Create an ATS-friendly, tailored one-page cover letter matching standard recruitment expectations and download as an editable Word document.
        </p>

        <div className="mt-4 inline-flex items-center gap-2">
          {unlimited ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Admin Access: Unlimited Generations
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Free generations remaining: <strong className="text-slate-900 dark:text-white">{remaining ?? "..."}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Template selection */}
      <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">
                1. Choose a Template
              </CardTitle>
              <CardDescription className="mt-1 text-sm">
                Select the tone and structure best tailored to your target application.
              </CardDescription>
            </div>
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40">
              ATS Optimized
            </span>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-0">
          <TemplateButton
            label="Graduate"
            description="Focused on academic achievements, internships, and growth potential"
            selected={
              templateStyle ===
              "graduate"
            }
            onClick={() =>
              setTemplateStyle(
                "graduate"
              )
            }
          />

          <TemplateButton
            label="Professional"
            description="Emphasizes industry track record, quantifiable results, and technical mastery"
            selected={
              templateStyle ===
              "professional"
            }
            onClick={() =>
              setTemplateStyle(
                "professional"
              )
            }
          />

          <TemplateButton
            label="Career Change"
            description="Highlights transferable skills, adaptability, and fresh perspective"
            selected={
              templateStyle ===
              "career-change"
            }
            onClick={() =>
              setTemplateStyle(
                "career-change"
              )
            }
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Editor */}
        <Card className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold">
              2. Application Details
            </CardTitle>

            <CardDescription className="text-sm">
              Provide your details and target position for precision AI tailoring.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={form.fullName}
                onChange={(value) =>
                  updateField(
                    "fullName",
                    value
                  )
                }
                required
              />

              <Field
                label="Date"
                type="date"
                value={form.date}
                onChange={(value) =>
                  updateField(
                    "date",
                    value
                  )
                }
                required
              />

              <Field
                label="Email"
                value={form.email}
                onChange={(value) =>
                  updateField(
                    "email",
                    value
                  )
                }
                required
              />

              <Field
                label="Phone"
                value={form.phone}
                onChange={(value) =>
                  updateField(
                    "phone",
                    value
                  )
                }
              />
            </div>

            <Field
              label="Address / Location"
              value={form.address}
              placeholder="e.g. Sydney NSW 2000, Australia"
              onChange={(value) =>
                updateField(
                  "address",
                  value
                )
              }
            />

            <div className="border-t border-slate-100 dark:border-slate-800 pt-2" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Target Job Title"
                value={form.jobTitle}
                placeholder="e.g. Junior Frontend Developer"
                onChange={(value) =>
                  updateField(
                    "jobTitle",
                    value
                  )
                }
                required
              />

              <Field
                label="Company Name"
                value={form.company}
                placeholder="e.g. Atlassian"
                onChange={(value) =>
                  updateField(
                    "company",
                    value
                  )
                }
                required
              />
            </div>

            <Field
              label="Hiring Manager Name"
              value={
                form.hiringManager
              }
              placeholder="Optional: e.g. Sarah Jenkins (or leave blank)"
              onChange={(value) =>
                updateField(
                  "hiringManager",
                  value
                )
              }
            />

            <TextareaField
              label="Relevant Skills"
              value={form.skills}
              placeholder="e.g. React, TypeScript, Tailwind CSS, teamwork, Git, API integration..."
              guidance="Include the key technical & soft skills sought in the job posting."
              onChange={(value) =>
                updateField(
                  "skills",
                  value
                )
              }
              required
            />

            <TextareaField
              label="Relevant Experience & University Projects"
              value={form.experience}
              placeholder="Describe your relevant course projects, internships, part-time work, or club leadership..."
              guidance="Provide at least one specific achievement. The AI never fabricates fake work history."
              onChange={(value) =>
                updateField(
                  "experience",
                  value
                )
              }
              required
            />

            <TextareaField
              label="Why This Role?"
              value={form.whyRole}
              placeholder="What specifically excites you about the day-to-day responsibilities of this position?"
              onChange={(value) =>
                updateField(
                  "whyRole",
                  value
                )
              }
            />

            <TextareaField
              label="Why This Company?"
              value={form.whyCompany}
              placeholder="What attracts you to this organization's culture, mission, or industry footprint?"
              onChange={(value) =>
                updateField(
                  "whyCompany",
                  value
                )
              }
            />

            <TextareaField
              label="Job Description (Optional)"
              value={
                form.jobDescription
              }
              placeholder="Paste the full job advertisement description here for closer keyword matching..."
              guidance="Providing the job description helps the AI align keywords directly with ATS screening filters."
              rows={5}
              onChange={(value) =>
                updateField(
                  "jobDescription",
                  value
                )
              }
            />

            {error && (
              <Message
                type="error"
                text={error}
              />
            )}

            {warning && (
              <Message
                type="warning"
                text={warning}
              />
            )}

            {success && (
              <Message
                type="success"
                text={success}
              />
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={
                  generateCoverLetter
                }
                disabled={
                  generating ||
                  (!unlimited &&
                    remaining === 0)
                }
                className="flex-1 rounded-full h-12 text-base font-semibold shadow-md shadow-emerald-600/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />

                {generating
                  ? "Generating Cover Letter..."
                  : "Generate Cover Letter"}
              </Button>

              <Button
                variant="outline"
                onClick={reset}
                className="rounded-full h-12 px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:sticky lg:top-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Live Preview &amp; Editor
              </h2>

              <p className="text-xs text-slate-500">
                Standard A4 Document • Editable in-place
              </p>
            </div>

            {coverLetter && (
              <Button
                size="sm"
                onClick={
                  downloadWord
                }
                className="rounded-full px-4 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Download Word (.docx)
              </Button>
            )}
          </div>

          <div className="bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 p-3 sm:p-6 rounded-3xl overflow-auto shadow-inner">
            <div
              className="
                bg-white
                text-slate-900
                mx-auto
                shadow-2xl
                rounded-sm
                w-full
                max-w-[794px]
                min-h-[1050px]
                px-8
                sm:px-14
                py-12
                border
                border-slate-200/50
              "
            >
              {!coverLetter ? (
                <div className="h-full min-h-[900px] flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center mb-6 shadow-sm">
                    <FileText className="w-10 h-10 text-emerald-500" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Your Cover Letter Appears Here
                  </h3>

                  <p className="text-sm text-slate-500 max-w-sm mb-8 leading-relaxed">
                    Complete the application form on the left and click &ldquo;Generate Cover Letter&rdquo; to create your document.
                  </p>

                  <div className="flex flex-col gap-2.5 text-left max-w-xs w-full">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
                      Select a targeted template style
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
                      Enter job &amp; key accomplishments
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
                      Instant live preview &amp; Word download
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-[15px] leading-relaxed">
                  <p className="font-bold text-lg">
                    {form.fullName}
                  </p>

                  {form.address && (
                    <p>
                      {form.address}
                    </p>
                  )}

                  <p>
                    {form.email}
                  </p>

                  {form.phone && (
                    <p>
                      {form.phone}
                    </p>
                  )}

                  <div className="mt-6">
                    <p>
                      {formatDate(
                        form.date
                      )}
                    </p>
                  </div>

                  <div className="mt-6">
                    <p>
                      {form.hiringManager ||
                        "Hiring Manager"}
                    </p>

                    <p>
                      {form.company}
                    </p>
                  </div>

                  <textarea
                    value={
                      coverLetter.salutation
                    }
                    onChange={(
                      event
                    ) =>
                      setCoverLetter(
                        (previous) =>
                          previous
                            ? {
                                ...previous,
                                salutation:
                                  event
                                    .target
                                    .value,
                              }
                            : previous
                      )
                    }
                    rows={1}
                    className="w-full mt-6 resize-none border-none outline-none bg-transparent font-inherit"
                  />

                  {coverLetter.paragraphs.map(
                    (
                      paragraph,
                      index
                    ) => (
                      <textarea
                        key={index}
                        value={
                          paragraph
                        }
                        onChange={(
                          event
                        ) =>
                          updateParagraph(
                            index,
                            event
                              .target
                              .value
                          )
                        }
                        rows={5}
                        className="w-full mt-4 resize-y border border-transparent hover:border-slate-200 focus:border-blue-300 rounded p-1 outline-none bg-transparent leading-relaxed"
                      />
                    )
                  )}

                  <textarea
                    value={
                      coverLetter.closing
                    }
                    onChange={(
                      event
                    ) =>
                      setCoverLetter(
                        (previous) =>
                          previous
                            ? {
                                ...previous,
                                closing:
                                  event
                                    .target
                                    .value,
                              }
                            : previous
                      )
                    }
                    rows={1}
                    className="w-full mt-5 resize-none border-none outline-none bg-transparent"
                  />

                  <p className="mt-1">
                    {form.fullName}
                  </p>
                </div>
              )}
            </div>
          </div>

          {coverLetter && (
            <p className="text-xs text-slate-500 mt-3">
              You can edit the generated
              paragraphs directly in the
              preview before downloading
              the Word document.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>

      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  guidance,
  required,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  guidance?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
        {label}
        {required && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>

      {guidance && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {guidance}
        </p>
      )}

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>
  );
}

function TemplateButton({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  const icon =
    label === "Graduate" ? (
      <GraduationCap className="w-5 h-5" />
    ) : label === "Professional" ? (
      <Briefcase className="w-5 h-5" />
    ) : (
      <Compass className="w-5 h-5" />
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl border-2 p-5 text-left transition-all duration-200 group ${
        selected
          ? "border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-md shadow-emerald-600/10 scale-[1.01]"
          : "border-slate-200 hover:border-emerald-300 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            selected
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-600"
          }`}
        >
          {icon}
        </div>

        {selected && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3" /> Selected
          </span>
        )}
      </div>

      <p className="font-bold text-slate-900 dark:text-white text-base">
        {label}
      </p>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
        {description}
      </p>
    </button>
  );
}

function Message({
  type,
  text,
}: {
  type:
    | "error"
    | "warning"
    | "success";
  text: string;
}) {
  const style =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
      : type === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300";

  return (
    <div
      className={`rounded-xl border p-3.5 text-sm font-medium ${style}`}
    >
      {text}
    </div>
  );
}

function simpleParagraph(
  text: string
) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Arial",
        size: 22,
      }),
    ],

    spacing: {
      after: 40,
      line: 240,
    },
  });
}

function formatDate(
  value: string
) {
  if (!value) return "";

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-AU",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function safeFileName(
  value: string
) {
  return (
    String(
      value ||
        "Cover-Letter"
    )
      .trim()
      .replace(
        /[^a-zA-Z0-9-_]+/g,
        "-"
      )
      .replace(/-+/g, "-")
  );
}