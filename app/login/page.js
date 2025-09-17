// pages/login.tsx (or app/login/page.tsx) - Changed callbackUrl to "/after-login" for Google sign-in

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
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-300 mb-4"></div>
        <p className="text-teal-100">Loading...</p>
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
        background: "#111827",
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
        background: "#111827",
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
        dispatch(
          loginSuccess({
            token: signInResult.token, // Note: NextAuth.js doesn't return a token directly; this is for Redux state
            user: {
              id: sessionData.user.id,
              name: sessionData.user.name,
              email: sessionData.user.email,
              role: sessionData.user.role,
            },
          })
        );
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
        background: "#111827",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = useCallback((provider) => {
    signIn(provider, { callbackUrl: "/after-login" });
  }, []);

  if (session) {
    return (
      <section className="min-h-screen  flex items-center justify-center py-12">
        <Card className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/20">
            <Sparkles className="h-7 w-7 text-teal-300" />
          </div>
          <Image
            src={
              session?.user?.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                session?.user?.name || "User"
              )}&background=0f766e&color=fff`
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
            <p className="text-sm text-teal-100/80">{session?.user?.email}</p>
          </div>
          <Link href="/dashboard">
            <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium">
              Go to Dashboard
            </Button>
          </Link>
        </Card>
      </section>
    );
  }

  return (
    <main className="relative min-h-screen   flex flex-col items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background and Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_50%_0%,rgba(45,212,191,0.25),transparent),radial-gradient(30%_40%_at_10%_80%,rgba(20,184,166,0.15),transparent),radial-gradient(30%_40%_at_90%_20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />
        {/* Blobs */}
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
      </div>

      <div className="w-full max-w-md space-y-8 text-center">
        <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl hover:shadow-teal-500/20 transition-all duration-300">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, rgba(20,184,166,0.15), rgba(16,185,129,0.15), transparent 60%)",
              maskImage:
                "radial-gradient(100% 100% at 50% 50%, black 60%, transparent 100%)",
            }}
          />

          <CardHeader className="text-center relative">
            <CardTitle className="text-white text-3xl font-bold drop-shadow">
              Welcome back
            </CardTitle>
            <CardDescription className="text-teal-100/80">
              Sign in to continue earning
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 relative">
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => handleSocialSignIn("google")}
                className="w-full group bg-white text-gray-900 hover:bg-gray-100 border border-white/30 transition-all duration-200"
              >
                <FcGoogle className="mr-2" />
                Continue with Google
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Button>
            </div>

            <div className="relative">
              <Separator className="bg-gray-800/50" />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-transparent px-2 text-xs text-gray-400/80">
                or sign in with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-teal-100">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-11 bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30 ${
                      errors.email ? "border-red-400" : ""
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-300">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-teal-100 flex items-center gap-2"
                >
                  Password <ShieldCheck className="h-4 w-4 text-teal-300" />
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`pl-11 pr-12 bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30 ${
                      errors.password ? "border-red-400" : ""
                    }`}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-200/80 hover:text-teal-100 transition"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-300">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-teal-500"
                  />
                  <span className="text-teal-100/90">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-teal-300 underline underline-offset-2"
                >
                  Forgot?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium py-2.5 transition-all duration-200 border border-white/20 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    Sign In
                    <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="col-span-1 bg-gray-800/50 rounded-lg p-3 text-center text-sm text-gray-300">
                Secure
              </div>
              <div className="col-span-1 bg-gray-800/50 rounded-lg p-3 text-center text-sm text-gray-300">
                Fast
              </div>
              <div className="col-span-1 bg-gray-800/50 rounded-lg p-3 text-center text-sm text-gray-300">
                Role-based
              </div>
            </div>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-teal-200/80 text-center">
              New here?{" "}
              <Link
                href="/register"
                className="text-teal-300 hover:text-teal-200 underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
