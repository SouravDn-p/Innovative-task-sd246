// pages/select-role.tsx (or app/select-role/page.tsx) - New page for role selection

"use client";

import { useState } from "react";
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
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const getDashboardRoute = (role) => {
  if (role === "admin") return "/dashboard/admin";
  if (role === "advertiser") return "/dashboard/advertiser";
  return "/dashboard/user";
};

export default function SelectRole() {
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        throw new Error("Failed to update role");
      }

      // Update session
      await update({ role });

      Swal.fire({
        icon: "success",
        title: "Role selected!",
        text: "Redirecting to your dashboard...",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push(getDashboardRoute(role));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update role. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">Select Your Role</CardTitle>
            <CardDescription className="text-teal-100/80">
              Choose how you want to use the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-teal-100">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md bg-teal-400 border border-white/20 text-white p-2 focus:border-teal-400"
                >
                  <option value="user">User</option>
                  <option value="advertiser">Advertiser</option>
                </select>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white"
              >
                {isLoading ? "Submitting..." : "Confirm Role"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}