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
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 py-12">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
        <CardHeader className="space-y-1 items-center pb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
            <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join the platform to access premium career tools
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                  First Name
                </label>
                <Input type="text" {...register("first_name")} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                  Last Name
                </label>
                <Input type="text" {...register("last_name")} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                Phone
              </label>
              <Input type="text" {...register("phone")} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                Date of Birth
              </label>
              <Input type="date" {...register("date_of_birth")} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                Email
              </label>
              <Input
                type="email"
                placeholder="m@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: emailPattern,
                    message: "Please enter a valid email address",
                  },
                  validate: (value) =>
                    value.trim() !== "" || "Email is required",
                })}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  validate: (value) =>
                    passwordPattern.test(value) ||
                    "Password must be at least 8 characters and include 1 letter, 1 uppercase letter, and 1 special character",
                })}
                className={errors.password ? "border-red-500" : ""}
              />

              <div className="rounded-md bg-slate-50 dark:bg-slate-800/60 p-3 space-y-1">
                {passwordRules.map((rule) => (
                  <p
                    key={rule.label}
                    className={`text-xs ${
                      rule.valid
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {rule.valid ? "✓" : "•"} {rule.label}
                  </p>
                ))}
              </div>

              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                Confirm Password
              </label>
              <Input
                type="password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value, formValues) =>
                    value === formValues.password || "Passwords do not match",
                })}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-center space-y-2">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
            >
              Log in here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}