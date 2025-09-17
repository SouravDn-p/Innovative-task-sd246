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
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  Target,
  ArrowUpRight,
  Plus,
  History,
  PieChart,
  Loader2,
  FileText,
  PenTool,
} from "lucide-react";
import Link from "next/link";

export default function AdvertiserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        // Fetch advertiser wallet data which includes task statistics
        const response = await fetch(`/api/advertiser/wallet`);
        const data = await response.json();

        if (response.ok) {
          setDashboardData(data);
        } else {
          setError(data.error || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading dashboard...</span>
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

  const stats = dashboardData?.taskStatistics || {
    totalTasks: 0,
    totalSpent: 0,
    activeTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
  };

  const wallet = dashboardData?.wallet || {
    balance: 0,
    totalSpent: 0,
  };

  // Get campaign data from transactions
  const campaigns = (dashboardData?.transactions || [])
    .filter((transaction) => transaction.type === "debit")
    .slice(0, 3) // Get last 3 transactions
    .map((transaction, index) => ({
      id: transaction._id,
      name: transaction.description || `Campaign ${index + 1}`,
      budget: transaction.amount,
      spent: transaction.amount,
      clicks: Math.floor(transaction.amount * 10), // Approximation
      status: index === 0 ? "active" : "completed",
    }));

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Quick Actions */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link href="/dashboard/advertiser/create-from-template">
          <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-all cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
            <CardContent className="relative flex flex-col items-center justify-center p-6 text-center h-full">
              <FileText className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle className="text-teal-800 text-lg">
                Create Task
              </CardTitle>
              <p className="text-xs text-teal-600 mt-1">
                Launch from templates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/advertiser/active-tasks">
          <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-all cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
            <CardContent className="relative flex flex-col items-center justify-center p-6 text-center h-full">
              <BarChart3 className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle className="text-teal-800 text-lg">
                Active Tasks
              </CardTitle>
              <p className="text-xs text-teal-600 mt-1">
                Manage ongoing campaigns
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/advertiser/task-history">
          <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-all cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
            <CardContent className="relative flex flex-col items-center justify-center p-6 text-center h-full">
              <History className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle className="text-teal-800 text-lg">
                Task History
              </CardTitle>
              <p className="text-xs text-teal-600 mt-1">View past campaigns</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/advertiser/analytics">
          <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-all cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
            <CardContent className="relative flex flex-col items-center justify-center p-6 text-center h-full">
              <PieChart className="h-8 w-8 text-teal-600 mb-2" />
              <CardTitle className="text-teal-800 text-lg">Analytics</CardTitle>
              <p className="text-xs text-teal-600 mt-1">Campaign performance</p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-teal-800">Loading dashboard data...</span>
        </div>
      ) : (
        <>
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Total Spent
                </CardTitle>
                <DollarSign className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  ₹{stats.totalSpent?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-teal-600">Total advertising spend</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Active Campaigns
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {stats.activeTasks || 0}
                </div>
                <p className="text-xs text-teal-600">
                  {stats.pendingTasks || 0} pending approval
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Total Tasks
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {stats.totalTasks || 0}
                </div>
                <p className="text-xs text-teal-600">
                  {stats.completedTasks || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Wallet Balance
                </CardTitle>
                <Target className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  ₹{wallet.balance?.toFixed(2) || "0.00"}
                </div>
                <p className="text-xs text-teal-600">Available for campaigns</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-teal-200 shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100"></div>
              <CardHeader className="relative">
                <CardTitle className="text-teal-800">
                  Campaign Performance
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Overview of your recent campaigns
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  {campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-teal-900">
                              {campaign.name}
                            </p>
                            <p className="text-sm text-teal-600">
                              ₹{campaign.spent?.toFixed(2) || "0.00"} / ₹
                              {campaign.budget?.toFixed(2) || "0.00"} •{" "}
                              {campaign.clicks?.toLocaleString() || "0"} clicks
                            </p>
                          </div>
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              campaign.status === "active"
                                ? "bg-teal-500"
                                : "bg-teal-200 text-teal-800"
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <Progress
                          value={
                            campaign.budget
                              ? (campaign.spent / campaign.budget) * 100
                              : 0
                          }
                          className="h-2"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No campaigns found
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
                  asChild
                >
                  <Link href="/dashboard/advertiser/active-tasks">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    View All Campaigns
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Updated Task Creation Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 text-teal-800">
            Create New Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-teal-200 hover:border-teal-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-teal-700">
                  <FileText className="mr-2 h-5 w-5" />
                  Template-Based Creation
                </CardTitle>
                <CardDescription>
                  Create tasks using predefined templates with set limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Select from admin-approved templates with predefined reward
                  ranges and limits. All tasks require admin approval before
                  going live.
                </p>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() =>
                    router.push("/dashboard/advertiser/create-from-template")
                  }
                >
                  Create from Template
                </Button>
              </CardContent>
            </Card>

            <Card className="border-teal-200 hover:border-teal-400 transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-teal-700">
                  <PenTool className="mr-2 h-5 w-5" />
                  Custom Task Creation
                </CardTitle>
                <CardDescription>
                  Create custom tasks (requires admin approval)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Create custom tasks with your own specifications. Tasks will
                  be reviewed and approved by admin before going live.
                </p>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() =>
                    router.push("/dashboard/advertiser/create-from-template")
                  }
                >
                  Create Custom Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
