"use client";
import { FcGoogle } from "react-icons/fc";
import { useState, Suspense, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { loginSuccess } from "@/redux/slice/authSlice";
import { Eye, EyeOff, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4"></div>
        <p className="text-gray-200">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <Header />
      <LoginPage />
      <Footer />
    </Suspense>
  );
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { data: session } = useSession();

  useEffect(() => {
    if (message) {
      Swal.fire({
        toast: true,
        icon: "success",
        title: message,
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#134e4a",
        color: "#fff",
      });
    }
  }, [message]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        toast: true,
        icon: "error",
        title: "Please fill in all required fields",
        position: "top-end",
        timer: 3000,
        showConfirmButton: false,
        background: "#0f766e",
        color: "#fff",
      });
      return;
    }

    setIsLoading(true);
    try {
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error(signInResult.error);
      }

      // Fetch user data from session
      const response = await fetch("/api/auth/session");
      const sessionData = await response.json();
      if (sessionData?.user) {
        dispatch(loginSuccess({
          token: signInResult.token, // Note: NextAuth.js doesn't return a token directly; this is for Redux state
          user: {
            id: sessionData.user.id,
            name: sessionData.user.name,
            email: sessionData.user.email,
            role: sessionData.user.role,
          },
        }));
        router.push("/dashboard");
      } else {
        throw new Error("Failed to retrieve session data");
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        icon: "error",
        title: err.message || "Login failed. Please try again.",
        position: "top-end",
        timer: 3500,
        showConfirmButton: false,
        background: "#164e63",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = useCallback((provider) => {
    signIn(provider, { callbackUrl: "/dashboard" });
  }, []);

  if (session) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-900 flex items-center justify-center py-12">
        <Card className="bg-white/6 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/8 border border-white/10">
            <Sparkles className="h-7 w-7 text-teal-200" />
          </div>
          <Image
            src={
              session?.user?.image ||
mania              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                session?.user?.name || "User"
              )}&background=14b8a6&color=fff`
            }
            alt={session?.user?.name || "User"}
            width={96}
            height={96}
            className="mx-auto rounded-full shadow mb-4"
          />
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white mb-1">
              Welcome back,
              <span className="text-teal-200 ml-2">{session?.user?.name}</span>
            </h1>
            <p className="text-sm text-teal-100">{session?.user?.email}</p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-medium">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 flex flex-col items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(30%_25%_at_10%_20%,rgba(45,212,191,0.08),transparent),radial-gradient(30%_25%_at_90%_80%,rgba(16,185,129,0.06),transparent)] opacity-95" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-teal-500/12 blur-3xl animate-blob" />
        <div className="absolute right-8 bottom-12 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
      </div>

      <header className="w-full max-w-md text-center z-10/favicon.ico mb-6">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-white/6 border border-white/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-teal-200" />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-emerald-200">
          Innovative Task Earn
        </h2>
        <p className="mt-2 text-sm text-teal-100/80">
          Welcome back — continue earning today
        </p>
        <p className="mt-2 text-sm text-teal-100/70">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-teal-200 underline underline-offset-2"
          >
            Create account
          </Link>
        </p>
      </header>

      <section className="w-full max-w-md z-10">
        <Card className="bg-white/6 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <CardHeader className="text-center p-0 mb-4">
              <CardTitle className="text-2xl sm:text-3xl font-semibold text-white">
                Sign in
              </CardTitle>
              <CardDescription className="text-sm text-teal-100/80">
                Pick a quick sign-in method or use your email
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 mt-4">
              <div className="grid gap-3">
                <Button
                  onClick={() => handleSocialSignIn("google")}
                  className="w-full flex items-center justify-center gap-3 bg-white/10 border border-white/12 text-white hover:bg-white/12 py-3 rounded-xl transition transform hover:-translate-y-0.5"
                  disabled={isLoading}
                >
                  <FcGoogle className="h-5 w-5" />
                  Continue with Google
                </Button>

                <div className="relative my-2">
                  <Separator className="bg-white/12" />
                  <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-transparent text-xs text-teal-100 px-2">
                    or sign in with email
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-teal-100 text-sm">
                      Email
                    </Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`pl-11 pr-4 bg-white/8 border border-white/8 text-white placeholder:text-teal-100/60 rounded-lg h-11 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow ${
                          errors.email ? "ring-red-400" : ""
                        }`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-300 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label
                      htmlFor="password"
                      className="text-teal-100 text-sm flex items-center gap-2"
                    >
                      Password{" "}
                      <ShieldCheck className="h-4 w-4 text-teal-200/70" />
                    </Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        className={`pl-11 pr-12 bg-white/8 border border-white/8 text-white placeholder:text-teal-100/60 rounded-lg h-11 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-shadow ${
                          errors.password ? "ring-red-400" : ""
                        }`}
                        placeholder="Your secure password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-100/70"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-300 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-white/10 bg-white/6 accent-teal-400"
                      />
                      <span className="text-teal-100">Remember me</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-teal-200 underline underline-offset-2"
                    >
                      Forgot?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-teal-500/30 transform transition hover:-translate-y-0.5"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="col-span-1 bg-white/6 rounded-lg p-3 text-center text-sm text-teal-100">
                    Secure
                  </div>
                  <div className="col-span-1 bg-white/6 rounded-lg p-3 text-center text-sm text-teal-100">
                    Fast
                  </div>
                  <div className="col-span-1 bg-white/6 rounded-lg p-3 text-center text-sm text-teal-100">
                    Role-based
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          <CardFooter className="mt-2 p-6 pt-0 bg-gradient-to-t from-transparent to-white/2">
            <p className="text-xs text-teal-100/80 text-center">
              By signing in you agree to our{" "}
              <Link href="/terms" className="underline text-teal-200">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline text-teal-200">
                Privacy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}