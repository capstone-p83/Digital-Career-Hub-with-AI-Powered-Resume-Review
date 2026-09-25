"use client";

import Script from "next/script";
import { PublicClientApplication } from "@azure/msal-browser";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
const MICROSOFT_CLIENT_ID =
  process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "";
const MICROSOFT_TENANT_ID =
  process.env.NEXT_PUBLIC_MICROSOFT_TENANT_ID || "common";

export default function LoginPage() {
  const {
    login,
    loginWithGoogle,
    loginWithMicrosoft,
    fetchCurrentUser,
  } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [microsoftProcessing, setMicrosoftProcessing] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleInitializedRef = useRef(false);
  const microsoftBusyRef = useRef(false);

  const msalInstance = useMemo(() => {
    if (!MICROSOFT_CLIENT_ID) {
      return null;
    }

    return new PublicClientApplication({
      auth: {
        clientId: MICROSOFT_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
        redirectUri: "/login",
      },
      cache: {
        cacheLocation: "sessionStorage"
      },
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const redirectByRole = useCallback(
    (role?: string) => {
      if (role === "admin") {
        router.replace("/dashboard");
        return;
      }

      if (role === "adminstaff") {
        router.replace("/dashboard");
        return;
      }

      router.replace("/dashboard");
    },
    [router]
  );

  const handleGoogleCredential = useCallback(
    async (response: { credential?: string }) => {
      try {
        setError("");

        if (!response.credential) {
          throw new Error("Google credential was not returned");
        }

        const user = await loginWithGoogle(response.credential);
        redirectByRole(user?.role);
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

  const handleMicrosoftLogin = async () => {
    if (!msalInstance) {
      setError("Microsoft login is not configured");
      return;
    }

    if (microsoftBusyRef.current) {
      return;
    }

    try {
      microsoftBusyRef.current = true;
      setError("");

      await msalInstance.initialize();

      await msalInstance.loginRedirect({
        scopes: ["openid", "profile", "email"],
        prompt: "select_account",
        redirectUri: "/login",
      });
    } catch (err) {
      const rawMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during Microsoft login.";

      setError(rawMessage);
      microsoftBusyRef.current = false;
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      const user = await login(data);
      redirectByRole(user?.role);
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
  }, []);

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
  }, [googleReady, renderGoogleButton]);

  useEffect(() => {
    const processMicrosoftRedirect = async () => {
      if (!msalInstance) {
        return;
      }

      try {
        setMicrosoftProcessing(true);

        await msalInstance.initialize();
        const result = await msalInstance.handleRedirectPromise({
          navigateToLoginRequestUrl: false,
        });

        if (result?.idToken) {
          const user = await loginWithMicrosoft(result.idToken);

          if (window.location.hash.includes("code=")) {
            window.history.replaceState({}, document.title, "/login");
          }

          redirectByRole(user?.role);
          return;
        }

        const currentUser = await fetchCurrentUser();

        if (currentUser?.role) {
          redirectByRole(currentUser.role);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "An error occurred during Microsoft login.";

        setError(message);
      } finally {
        microsoftBusyRef.current = false;
        setMicrosoftProcessing(false);
      }
    };

    processMicrosoftRedirect();
  }, [msalInstance, loginWithMicrosoft, fetchCurrentUser, redirectByRole]);

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

      <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-140px)] relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <Card className="w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden">
          <CardHeader className="space-y-1 items-center pb-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-600/20 text-white">
              <Briefcase className="w-7 h-7" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Log in to your Digital Career Hub account to access your AI tools
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3.5 text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  {error}
                </div>
              )}

              {microsoftProcessing && (
                <div className="p-3.5 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  Completing Microsoft sign-in...
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  {...register("email", { required: "Email is required" })}
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className={`rounded-xl h-11 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 ${
                    errors.password ? "border-rose-500 focus-visible:ring-rose-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full rounded-full h-11 text-sm font-semibold shadow-md shadow-blue-600/20" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div ref={googleButtonRef} className="w-full max-w-sm" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full mt-3 rounded-full h-11 text-xs font-semibold shadow-xs"
              onClick={handleMicrosoftLogin}
              disabled={microsoftProcessing}
            >
              Continue with Microsoft
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col items-center justify-center pt-2 pb-6">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold underline-offset-4 hover:underline"
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