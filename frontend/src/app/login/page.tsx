"use client";

import Script from "next/script";
import { useEffect, useRef, useState, useCallback } from "react";
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
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Briefcase } from "lucide-react";

interface LoginFormData {
  email: string;
  password: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const { login, loginWithGoogle, fetchCurrentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitializedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const redirectByRole = useCallback(async () => {
    const currentUser = await fetchCurrentUser();

    if (currentUser?.role === "admin") {
      router.replace("/admin");
      return;
    }

    if (currentUser?.role === "adminstaff") {
      router.replace("/dashboard");
      return;
    }

    router.replace("/dashboard");
  }, [fetchCurrentUser, router]);

  const handleGoogleCredential = useCallback(
    async (response: { credential?: string }) => {
      try {
        setError("");

        if (!response.credential) {
          throw new Error("Google credential was not returned");
        }

        await loginWithGoogle(response.credential);
        await redirectByRole();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An error occurred during Google login.";
        setError(message);
      }
    },
    [loginWithGoogle, redirectByRole]
  );

  const renderGoogleButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      return;
    }

    if (!window.google || !googleButtonRef.current) {
      return;
    }

    if (!googleInitializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
      });
      googleInitializedRef.current = true;
    }

    googleButtonRef.current.innerHTML = "";

    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: 380,
      text: "continue_with",
      shape: "rectangular",
    });
  }, [handleGoogleCredential]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data);
      await redirectByRole();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An error occurred during login.";
      setError(message);
    }
  };

  useEffect(() => {
    if (window.google) {
      setGoogleReady(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (!googleReady) {
      return;
    }

    const timer = setTimeout(() => {
      renderGoogleButton();
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [googleReady, renderGoogleButton, pathname]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setGoogleReady(true);
        }}
      />

      <div className="flex-1 flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
          <CardHeader className="space-y-1 items-center pb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", { required: "Email is required" })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div ref={googleButtonRef} className="w-full max-w-sm" />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center space-y-2">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:underline dark:text-blue-400 font-medium"
              >
                Register here
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}