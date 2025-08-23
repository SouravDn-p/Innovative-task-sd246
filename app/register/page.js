"use client";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import Link from "next/link";
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
import { AlertCircle, User, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "@/redux/slice/authSlice";
import { signIn } from "next-auth/react";

export default function Register() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [apiError, setApiError] = useState(null);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  const onSubmit = async (data) => {
    setApiError(null);
    dispatch(loginStart());
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (res.ok) {
        dispatch(loginSuccess({ user: result }));
        router.push("/dashboard");
      } else {
        dispatch(loginFailure(result.error));
        setApiError(result.error);
      }
    } catch (err) {
      dispatch(loginFailure("Network error"));
      setApiError("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <h2 className="text-4xl tracking-tight font-serif font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
          Innovative Task Earn
        </h2>
        <p className="mt-3 text-black">Start your earning journey today</p>
        <p className="mt-2 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-400 hover:text-sky-300 transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl hover:shadow-sky-500/10 transition-all duration-300">
          <CardHeader className="text-center">
            <CardTitle className="text-gray-800 text-3xl font-bold">
              Create Account
            </CardTitle>
            <CardDescription className="text-black">
              Join us and start earning
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {apiError && (
              <Alert className="border-red-500/50 bg-red-500/10 text-red-300">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4">
              <Button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full bg-white/10 border-white/20 text-black hover:bg-gray-400 hover:text-black transition-all duration-200"
              >
                <FcGoogle className="mr-2" />
                Continue with Google
              </Button>
            </div>

            <Separator className="bg-white/20" />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-black">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="name"
                    type="text"
                    {...formRegister("name", { required: "Name is required" })}
                    className={`pl-11 bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 ${
                      errors.name ? "border-red-400" : ""
                    }`}
                    placeholder="Your Name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    {...formRegister("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    })}
                    className={`pl-11 bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 ${
                      errors.email ? "border-red-400" : ""
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    {...formRegister("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={`pl-11 bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 ${
                      errors.password ? "border-red-400" : ""
                    }`}
                    placeholder="********"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-black">
                  Role
                </Label>
                <select
                  id="role"
                  {...formRegister("role")}
                  defaultValue="user"
                  className="w-full rounded-md bg-white/5 border border-white/20 text-black 
               placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20 p-2"
                >
                  <option value="user">User</option>
                  <option value="advertiser">Advertiser</option>
                </select>
              </div>
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-black">
                  Phone (optional)
                </Label>
                <Input
                  id="phone"
                  type="text"
                  {...formRegister("phone")}
                  className="bg-white/5 border-white/20 text-black placeholder:text-gray-400 focus:border-sky-400 focus:ring-sky-400/20"
                  placeholder="Enter your phone number"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-black font-medium py-2.5 transition-all duration-200"
                size="lg"
              >
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-sm text-gray-400 text-center">
              By signing up, you agree to our{" "}
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
