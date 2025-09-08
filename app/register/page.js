"use client";

import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Optional Redux hooks (keep if you use them)
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slice/authSlice";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

function passwordStrength(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 5);
}

function strengthLabel(score) {
  switch (score) {
    case 0:
    case 1:
      return "Very weak";
    case 2:
      return "Weak";
    case 3:
      return "Good";
    case 4:
      return "Strong";
    case 5:
      return "Very strong";
    default:
      return "";
  }
}

// Separate component to handle client-side only logic
function RegisterContent({ referrerId: propReferrerId }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [cardTransform, setCardTransform] = useState(
    "rotateX(0deg) rotateY(0deg)"
  );
  const [referrerInfo, setReferrerInfo] = useState(null);
  const submittingRef = useRef(false);

  // Get referrerId from query params or props
  const queryReferrerId = searchParams.get("referrerId");
  const referrerId = propReferrerId || queryReferrerId;

  // Log referrerId for debugging and store in localStorage
  useEffect(() => {
    if (referrerId) {
      console.log("Referrer ID found:", referrerId);
      // Store referrerId in localStorage
      localStorage.setItem("referrerId", referrerId);
    }
  }, [referrerId]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "user",
    },
  });

  // Fetch referrer information if referrerId is provided
  useEffect(() => {
    if (referrerId) {
      fetchReferrerInfo(referrerId);
    }
  }, [referrerId]);

  const fetchReferrerInfo = async (id) => {
    try {
      // This would be an API endpoint to get referrer details
      // For now, we'll just set a placeholder
      setReferrerInfo({
        id: id,
        name: "Your Referrer",
      });
    } catch (error) {
      console.error("Failed to fetch referrer info:", error);
    }
  };

  const onMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 6; // subtle tilt
    const rotateY = (x / rect.width) * 6;
    setCardTransform(`rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  }, []);

  const onMouseLeave = () => {
    setCardTransform("rotateX(0deg) rotateY(0deg)");
  };

  const onSubmit = async (data) => {
    if (submittingRef.current) return;
    if (!agree) {
      Swal.fire({
        icon: "info",
        title: "Please confirm",
        text: "You must agree to the Terms & Privacy to continue.",
        confirmButtonColor: "#14b8a6",
      });
      return;
    }

    submittingRef.current = true;
    setApiError(null);
    dispatch(loginStart());

    try {
      // Include referrerId in the registration data if it exists
      const registrationData = referrerId ? { ...data, referrerId } : data;

      // 1) Register user in DB
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const result = await res.json();

      if (!res.ok) {
        dispatch(loginFailure(result?.error || "Registration failed"));
        setApiError(result?.error || "Registration failed");
        Swal.fire({
          icon: "error",
          title: "Registration failed",
          text: result?.error || "Please try again.",
        });
        return;
      }

      // 2) Auto-login with credentials so NextAuth session is in sync
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (loginRes?.ok) {
        dispatch(
          loginSuccess({ user: { email: data.email, role: data.role } })
        );

        // Show success message with referral info if applicable
        const successMessage = referrerId
          ? "Account created successfully! You've been added to your referrer's network. 🎉"
          : "Account created successfully 🎉";

        await Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: successMessage,
          confirmButtonColor: "#14b8a6",
        });

        // 3) Send to after-login page to select role and handle referral
        router.push("/after-login");
      } else {
        dispatch(loginFailure(loginRes?.error || "Auto login failed"));
        Swal.fire({
          icon: "warning",
          title: "Registered, but login failed",
          text: loginRes?.error || "Please sign in manually.",
          confirmButtonColor: "#14b8a6",
        });
        router.push("/login");
      }
    } catch (err) {
      dispatch(loginFailure("Network error"));
      setApiError("Network error");
      Swal.fire({
        icon: "error",
        title: "Network error",
        text: "Please check your connection and try again.",
        confirmButtonColor: "#14b8a6",
      });
    } finally {
      submittingRef.current = false;
    }
  };

  const handleGoogleRegister = async () => {
    if (!agree) {
      Swal.fire({
        icon: "info",
        title: "Please confirm",
        text: "You must agree to the Terms & Privacy to continue.",
        confirmButtonColor: "#14b8a6",
      });
      return;
    }

    // Pass referrerId in the state parameter for Google OAuth
    const state = referrerId ? { referrerId } : {};
    console.log("Google OAuth state:", state);

    try {
      await signIn("google", {
        callbackUrl: "/after-login",
        state: JSON.stringify(state),
      });
    } catch (err) {
      setApiError("Google registration failed");
      console.error(err);
    }
  };

  const pw = watch("password");
  const pwScore = passwordStrength(pw);

  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-teal-500",
    "bg-emerald-500",
  ];

  return (
    <>
      <Header />

      {/* Background and Blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(40%_30%_at_50%_0%,rgba(45,212,191,0.25),transparent),radial-gradient(30%_40%_at_10%_80%,rgba(20,184,166,0.15),transparent),radial-gradient(30%_40%_at_90%_20%,rgba(16,185,129,0.15),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:36px_36px] opacity-20" />
        {/* Blobs */}
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
      </div>

      {/* Main Content Wrapper - Centering and Layout */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-8 text-center">

          {/* Card */}
          <Card
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
              transform: cardTransform,
              transition: "transform 200ms ease",
              transformStyle: "preserve-3d",
            }}
            className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl hover:shadow-teal-500/20 transition-all duration-300"
          >
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
                {referrerId ? "Join Through Referral" : "Create your account"}
              </CardTitle>
              <CardDescription className="text-teal-100/80">
                {referrerId
                  ? "You're joining through a referral"
                  : "Join us and start earning"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative">
              {apiError && (
                <Alert className="border-red-500/40 bg-red-500/10 text-red-200">
                  <AlertCircle className="h-4 w-4 text-red-300" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Referral Info Box */}
              {referrerId && (
                <div className="p-4 bg-teal-500/10 border border-teal-400/30 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-teal-300 mr-2" />
                    <h3 className="font-medium text-teal-100">
                      Referral Join
                    </h3>
                  </div>
                  <p className="text-sm text-teal-200/90 mt-2">
                    You&apos;re joining through a referral from a friend. After
                    registration, you&apos;ll be automatically connected to
                    their network.
                  </p>
                  <div className="mt-3 flex items-center text-xs">
                    <span className="text-teal-300 font-medium">
                      Referrer ID:
                    </span>
                    <span className="ml-2 font-mono bg-teal-900/50 px-2 py-1 rounded text-teal-100">
                      {referrerId}
                    </span>
                  </div>
                </div>
              )}

              {/* Social auth */}
              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  onClick={handleGoogleRegister}
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
                <Separator className="bg-white/20" />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-transparent px-2 text-xs text-teal-200/80">
                  or continue with email
                </span>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(onSubmit)(e);
                }}
                className="space-y-5"
              >
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-teal-100">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                    <Input
                      id="name"
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className={`pl-11 bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30 ${
                        errors.name ? "border-red-400" : ""
                      }`}
                      placeholder="Your Name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-300">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-teal-100">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Invalid email address",
                        },
                      })}
                      className={`pl-11 bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30 ${
                        errors.email ? "border-red-400" : ""
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-300">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-teal-100 flex items-center gap-2"
                  >
                    Password{" "}
                    <ShieldCheck className="h-4 w-4 text-teal-300" />
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-200/70 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
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
                    <p className="text-sm text-red-300">
                      {errors.password.message}
                    </p>
                  )}

                  {/* Strength meter */}
                  <div className="mt-2">
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pw
                            ? strengthColors[Math.max(0, pwScore - 1)]
                            : "bg-transparent"
                        }`}
                        style={{
                          width: `${(pwScore / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-teal-200/80">
                      {pw
                        ? strengthLabel(pwScore)
                        : "Use 10+ chars with numbers & symbols"}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-teal-100">
                    Role
                  </Label>
                  <select
                    id="role"
                    {...register("role")}
                    defaultValue="user"
                    className="w-full rounded-md bg-white/5 border border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30 p-2"
                  >
                    <option value="user" className="bg-slate-900">
                      User
                    </option>
                    <option value="advertiser" className="bg-slate-900">
                      Advertiser
                    </option>
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-teal-100">
                    Phone (optional)
                  </Label>
                  <Input
                    id="phone"
                    type="text"
                    {...register("phone")}
                    className="bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <input
                    id="agree"
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-teal-500"
                  />
                  <label htmlFor="agree" className="text-sm text-teal-100/90">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-teal-300 hover:text-teal-200 underline underline-offset-2"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-teal-300 hover:text-teal-200 underline underline-offset-2"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-medium py-2.5 transition-all duration-200 border border-white/20 disabled:opacity-70"
                  size="lg"
                >
                  {isSubmitting
                    ? "Registering..."
                    : referrerId
                    ? "Join with Referral"
                    : "Create account"}
                  <span className="ml-2 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Button>
              </form>
            </CardContent>

            <CardFooter className="justify-center">
              <p className="text-sm text-teal-200/80 text-center">
                Already with us?{" "}
                <Link
                  href="/login"
                  className="text-teal-300 hover:text-teal-200 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
}

// Main component
export default function RegisterPage({ referrerId: propReferrerId }) {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RegisterContent referrerId={propReferrerId} />
    </React.Suspense>
  );
}