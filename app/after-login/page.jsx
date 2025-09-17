// pages/select-role.tsx (or app/select-role/page.tsx) - New page for role selection

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
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-teal-100/80">
              {userData?.user?.role
                ? "Add referral information if applicable"
                : "Choose your role and add referral information if applicable"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {!userData?.user?.role && (
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-teal-100">
                    Role *
                  </Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-md bg-teal-400 border border-white/20 text-white p-2 focus:border-teal-400"
                    disabled={isLoading}
                    required
                  >
                    <option value="user">User</option>
                    <option value="advertiser">Advertiser</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="referrerId" className="text-teal-100">
                  Referral ID (Optional)
                </Label>
                <Input
                  id="referrerId"
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  placeholder="Enter referral ID"
                  className="bg-white/5 border-white/20 text-white placeholder:text-teal-200/60 focus:border-teal-400 focus:ring-teal-400/30"
                  disabled={isLoading}
                />
                {referrerError && (
                  <p className="text-sm text-red-300">{referrerError}</p>
                )}
                <p className="text-sm text-teal-200/80">
                  If you don't have a referral ID, leave this field empty.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white"
              >
                {isLoading ? "Submitting..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
