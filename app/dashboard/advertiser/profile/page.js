"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobiles";
import {
  User,
  Mail,
  Phone,
  Building,
  Globe,
  Calendar,
  Wallet,
  TrendingUp,
  BarChart3,
  Target,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function AdvertiserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        // Fetch advertiser data from wallet API which includes all necessary information
        const response = await fetch(`/api/advertiser/wallet`);
        const data = await response.json();

        if (response.ok) {
          setProfileData(data);
        } else {
          setError(data.error || "Failed to fetch profile data");
        }
      } catch (err) {
        setError("Failed to fetch profile data");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.email) {
      fetchProfileData();
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading profile...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Extract data from the response
  const wallet = profileData?.wallet || {
    balance: 0,
    totalSpent: 0,
    totalCredits: 0,
  };

  const taskStats = profileData?.taskStatistics || {
    totalTasks: 0,
    activeTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  };

  // Safely access session user data with fallbacks
  const userData = session?.user || {};

  // Format join date
  const joinDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <motion.div
      className="space-y-6 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header - removed back button for mobile */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-teal-900">Advertiser Profile</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-teal-800">Loading profile data...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Overview Card */}
          <Card className="border-teal-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your advertiser account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="bg-teal-100 rounded-full p-4">
                  <User className="h-12 w-12 text-teal-600" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-teal-900">
                      {userData?.name || "N/A"}
                    </h2>
                    <p className="text-teal-600">{userData?.email || "N/A"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-teal-100 text-teal-800">
                      Advertiser
                    </Badge>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{userData?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="font-medium">
                      {userData?.companyName ||
                        userData?.advertiserData?.companyName ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">
                      {userData?.contactPhone ||
                        userData?.advertiserData?.contactPhone ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-slate-500">Website</p>
                    <p className="font-medium">
                      {userData?.website ||
                        userData?.advertiserData?.website ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  <div>
                    <p className="text-sm text-slate-500">Member Since</p>
                    <p className="font-medium">{joinDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Statistics */}
          <Card className="border-teal-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Statistics
              </CardTitle>
              <CardDescription>
                Your wallet balance and transaction summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-5 w-5 text-teal-600" />
                    <p className="text-sm text-teal-700 font-medium">Balance</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-900">
                    ₹
                    {wallet.balance?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }) || "0.00"}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">
                      Total Spent
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    ₹
                    {wallet.totalSpent?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }) || "0.00"}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      Total Credits
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    ₹
                    {wallet.totalCredits?.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    }) || "0.00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Statistics */}
          <Card className="border-teal-200 shadow-md">
            <CardHeader>
              <CardTitle className="text-teal-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Task Statistics
              </CardTitle>
              <CardDescription>
                Overview of your advertising campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-700 font-medium">
                      Total Tasks
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {taskStats.totalTasks || 0}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">
                      Active Tasks
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {taskStats.activeTasks || 0}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <p className="text-sm text-purple-700 font-medium">
                      Pending Tasks
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {taskStats.pendingTasks || 0}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">
                      Completed Tasks
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {taskStats.completedTasks || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push("/dashboard/advertiser/settings")}
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Edit Profile
            </Button>
            <Button
              onClick={() => router.push("/dashboard/advertiser/wallet")}
              className="bg-teal-600 hover:bg-teal-700"
            >
              View Wallet Details
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
