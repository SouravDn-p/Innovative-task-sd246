"use client";
import { FcGoogle } from "react-icons/fc";

import { useState, Suspense } from "react"; // Import Suspense
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useLoginUserMutation } from "@/redux/api/api";
import { loginSuccess } from "@/redux/slice/authSlice";
import {
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

// Fallback component for Suspense
function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400 mb-4"></div>
        <p className="text-gray-300">Loading...</p>
      </div>
    </div>
  );
}

// Main LoginPage component (same as provided)
function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loginUser, { isLoading, error }] = useLoginUserMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { data: session } = useSession();

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

    if (!validateForm()) return;

    try {
      const result = await loginUser(formData).unwrap();
      dispatch(loginSuccess(result));
      router.push("/");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex items-center justify-center">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center">
          <Image
            src={
              session?.user?.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                session?.user?.name || "User"
              )}&background=0ea5e9&color=fff`
            }
            alt={session?.user?.name || "User"}
            width={96}
            height={96}
            className="mx-auto rounded-full shadow mb-4"
          />
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {session?.user?.name}!
            </h1>
            <p className="text-gray-400">{session?.user?.email}</p>
          </div>
          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700">
              Go to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(14,165,233,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <h2 className="text-4xl tracking-tight transition-all duration-300 font-serif font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
            Innovative Task Earn
          </h2>
          <p className="mt-3 text-black">
            Welcome back to your earning journey
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-sky-500/10 transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className=" text-gray-800 text-3xl font-bold">
              Sign In
            </CardTitle>
            <CardDescription className="text-black">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {message && (
              <Alert className="border-sky-500/50 bg-sky-500/10 text-sky-300">
                <CheckCircle className="h-4 w-4 text-sky-400" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-500/50 bg-red-500/10 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>
                  {error.data?.error || "Login failed. Please try again."}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              <Button
                // variant="outline"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/dashboard",
                  })
                }
                className="w-full bg-white/10 border-white/20 text-black hover:bg-gray-400 hover:text-white transition-all duration-200"
              >
                <FcGoogle className="" />
                Continue with Google
              </Button>
            </div>

            <Separator className="bg-white/20" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-11 bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 ${
                      errors.email ? "border-red-400" : ""
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-11 pr-11 bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 ${
                      errors.password ? "border-red-400" : ""
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-600 rounded bg-gray-800"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-black"
                  >
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-medium py-2.5 transition-all duration-200"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-gray-400 text-center">
              By signing in, you agree to our{" "}
              <Link
                href="/terms"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-sky-400 hover:text-sky-300 transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Wrap the LoginPage in Suspense
export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPage />
    </Suspense>
  );
}
