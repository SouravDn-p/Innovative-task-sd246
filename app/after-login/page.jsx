"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useGetUserByEmailQuery } from "@/redux/api/api";
import { User, Users, Building, Gift } from "lucide-react";

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

export default function SelectRole() {
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [referrerId, setReferrerId] = useState("");
  const [referrerError, setReferrerError] = useState("");
  const router = useRouter();
  const { data: session, update } = useSession();

  // Get user data to check if they have a role and referrerId
  const { data: userData, isLoading: userLoading } = useGetUserByEmailQuery(
    session?.user?.email,
    { skip: !session?.user?.email }
  );

  // Check if user needs to set role or referral ID after login
  useEffect(() => {
    if (userData?.user && !userLoading) {
      // Check if user has a role set
      if (userData.user.role) {
        // User already has a role set, check for referral ID
        setRole(userData.user.role); // Set the role in state to match the database

        // Check if user has a referrerId
        if (!userData.user.referrerId) {
          // Check if there's a referrerId in localStorage
          if (typeof window !== "undefined") {
            const storedReferrerId = localStorage.getItem("referrerId");
            if (storedReferrerId) {
              setReferrerId(storedReferrerId);
              // Don't return here, let the user submit the referral ID
              return;
            }
          }
        }

        // If user has both role and either has referrerId or no stored referrerId, redirect to dashboard
        router.push(getDashboardRoute(userData.user.role));
        return;
      }

      // If user doesn't have a role set, they need to select one
      // Check if there's a referrerId in localStorage
      if (typeof window !== "undefined") {
        const storedReferrerId = localStorage.getItem("referrerId");
        if (storedReferrerId) {
          setReferrerId(storedReferrerId);
        }
      }
    }
  }, [userData, userLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Only update the user's role if they don't already have one
      if (!userData?.user?.role) {
        const roleRes = await fetch("/api/auth/update-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });

        if (!roleRes.ok) {
          throw new Error("Failed to update role");
        }

        // Update session
        await update({ role });
      }

      // If we have a referral ID, submit it
      if (referrerId) {
        const newUser = {
          name: session?.user?.name,
          email: session?.user?.email,
        };

        const referralRes = await fetch("/api/user/addReferral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrerId: referrerId,
            newUser,
          }),
        });

        const result = await referralRes.json();

        if (!referralRes.ok) {
          throw new Error(result.message || "Failed to add referral");
        }

        // Clear referrerId from localStorage after successful referral
        if (typeof window !== "undefined") {
          localStorage.removeItem("referrerId");
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Your information has been updated.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push(getDashboardRoute(role));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update information. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-cyan-600/20 rounded-full translate-y-16 -translate-x-16 blur-2xl"></div>

          <CardHeader className="text-center relative z-10 pt-8 pb-4">
            <div className="mx-auto bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-gray-300">
              {userData?.user?.role
                ? "Add referral information if applicable"
                : "Choose your role and add referral information if applicable"}
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!userData?.user?.role && (
                <div className="space-y-4">
                  <Label
                    htmlFor="role"
                    className="text-gray-200 text-sm font-medium"
                  >
                    Select Your Role *
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        role === "user"
                          ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <Users className="h-6 w-6 text-blue-400 mb-2" />
                      <span className="text-white font-medium">
                        Task Earner
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        Complete tasks to earn
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("advertiser")}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                        role === "advertiser"
                          ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <Building className="h-6 w-6 text-purple-400 mb-2" />
                      <span className="text-white font-medium">Advertiser</span>
                      <span className="text-xs text-gray-400 mt-1">
                        Create campaigns
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="referrerId"
                  className="text-gray-200 text-sm font-medium flex items-center gap-2"
                >
                  <Gift className="h-4 w-4" />
                  Referral ID (Optional)
                </Label>
                <Input
                  id="referrerId"
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  placeholder="Enter referral ID"
                  className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/30"
                  disabled={isLoading}
                />
                {referrerError && (
                  <p className="text-sm text-red-400">{referrerError}</p>
                )}
                <p className="text-xs text-gray-400">
                  If you don't have a referral ID, leave this field empty.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-6 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                    Submitting...
                  </span>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
