"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-zA-Z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>();

  const password = watch("password", "");

  const passwordRules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "At least 1 letter",
      valid: /[a-zA-Z]/.test(password),
    },
    {
      label: "At least 1 uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least 1 special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError("");

      await registerUser({
        email: data.email.trim(),
        password: data.password,
        role: "user",
        first_name: data.first_name?.trim() || null,
        last_name: data.last_name?.trim() || null,
        phone: data.phone?.trim() || null,
        date_of_birth: data.date_of_birth || null,
      });

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred during registration.";

      setError(message);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden min-h-[calc(100vh-140px)]">
      {/* Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
        <CardHeader className="space-y-1 items-center pb-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/20 text-white">
            <Briefcase className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
            Join the platform to access AI-powered career tools &amp; resume reviews
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3.5 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/50">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Shakib"
                  {...register("first_name")}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Last Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Al Hasan"
                  {...register("last_name")}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Phone (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="+880..."
                  {...register("phone")}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Date of Birth
                </label>
                <Input
                  type="date"
                  {...register("date_of_birth")}
                  className="rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: emailPattern,
                    message: "Please enter a valid email address",
                  },
                  validate: (value) =>
                    value.trim() !== "" || "Email is required",
                })}
                className={`rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 ${
                  errors.email ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password", {
                  required: "Password is required",
                  validate: (value) =>
                    passwordPattern.test(value) ||
                    "Password must be at least 8 characters and include 1 letter, 1 uppercase letter, and 1 special character",
                })}
                className={`rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 ${
                  errors.password ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-1.5 mt-2">
                {passwordRules.map((rule) => (
                  <div
                    key={rule.label}
                    className={`text-[11px] flex items-center gap-1.5 font-medium ${
                      rule.valid
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      rule.valid
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                    }`}>
                      {rule.valid ? "✓" : "•"}
                    </span>
                    <span>{rule.label}</span>
                  </div>
                ))}
              </div>

              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value, formValues) =>
                    value === formValues.password || "Passwords do not match",
                })}
                className={`rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 ${
                  errors.confirmPassword ? "border-rose-500 focus-visible:ring-rose-500" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full rounded-full h-11 text-sm font-semibold shadow-md shadow-blue-600/20 mt-2" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold underline-offset-4 hover:underline"
            >
              Log in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}