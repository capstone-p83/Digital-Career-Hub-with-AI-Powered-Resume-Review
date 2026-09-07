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
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          AI Cover Letter Generator
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Create a professional,
          one-page cover letter and
          download it as a Word file.
        </p>

        <div className="mt-3 text-sm">
          {unlimited ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              Admin access: Unlimited
              generations
            </span>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Free generations remaining:{" "}
              <strong>
                {remaining ?? "..."}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Template selection */}
      <Card>
        <CardHeader>
          <CardTitle>
            Choose a Template
          </CardTitle>

          <CardDescription>
            Select the style that best
            matches your application.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TemplateButton
            label="Graduate"
            description="For graduates and internships"
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
            description="For experienced applicants"
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
            description="For moving into a new field"
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
        <Card>
          <CardHeader>
            <CardTitle>
              Application Details
            </CardTitle>

            <CardDescription>
              Provide enough specific
              information for the AI to
              create a strong cover
              letter.
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
              label="Address"
              value={form.address}
              onChange={(value) =>
                updateField(
                  "address",
                  value
                )
              }
            />

            <div className="border-t border-slate-200 dark:border-slate-800 pt-5" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Job Title"
                value={form.jobTitle}
                onChange={(value) =>
                  updateField(
                    "jobTitle",
                    value
                  )
                }
                required
              />

              <Field
                label="Company"
                value={form.company}
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
              label="Hiring Manager"
              value={
                form.hiringManager
              }
              placeholder="Optional"
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
              placeholder="e.g. React, Node.js, teamwork, AWS..."
              guidance="Include the skills most relevant to this job."
              onChange={(value) =>
                updateField(
                  "skills",
                  value
                )
              }
              required
            />

            <TextareaField
              label="Relevant Experience / Projects"
              value={form.experience}
              placeholder="Describe relevant work, university projects, internships or achievements..."
              guidance="Provide at least one specific example. The AI will not invent experience."
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
              placeholder="Why are you interested in this position?"
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
              placeholder="What interests you about this company?"
              onChange={(value) =>
                updateField(
                  "whyCompany",
                  value
                )
              }
            />

            <TextareaField
              label="Job Description"
              value={
                form.jobDescription
              }
              placeholder="Optional: paste the job description here..."
              guidance="Providing the job description helps the AI prioritise the most relevant information."
              rows={6}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={
                  generateCoverLetter
                }
                disabled={
                  generating ||
                  (!unlimited &&
                    remaining === 0)
                }
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />

                {generating
                  ? "Generating..."
                  : "Generate Cover Letter"}
              </Button>

              <Button
                variant="outline"
                onClick={reset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Preview
              </h2>

              <p className="text-sm text-slate-500">
                A4 Cover Letter Preview
              </p>
            </div>

            {coverLetter && (
              <Button
                size="sm"
                onClick={
                  downloadWord
                }
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word
              </Button>
            )}
          </div>

          <div className="bg-slate-200 dark:bg-slate-800 p-3 sm:p-5 rounded-xl overflow-auto">
            <div
              className="
                bg-white
                text-slate-900
                mx-auto
                shadow-lg
                w-full
                max-w-[794px]
                min-h-[1050px]
                px-10
                sm:px-14
                py-12
              "
            >
              {!coverLetter ? (
                <div className="h-full min-h-[900px] flex items-center justify-center text-center">
                  <div>
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />

                    <p className="text-slate-400">
                      Your cover letter
                      preview will appear
                      here.
                    </p>
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
      </label>

      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}
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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
          : "border-slate-200 hover:border-emerald-300 dark:border-slate-700"
      }`}
    >
      <p className="font-semibold text-slate-900 dark:text-white">
        {label}
      </p>

      <p className="text-xs text-slate-500 mt-1">
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
      className={`rounded-lg border p-3 text-sm ${style}`}
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