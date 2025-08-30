"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Target,
  DollarSign,
  Award,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useGetAdminDashboardStatsQuery } from "@/redux/api/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    data: dashboardData,
    error,
    isLoading,
    refetch,
  } = useGetAdminDashboardStatsQuery(undefined, {
    // Enable polling for real-time updates
    pollingInterval: 30000,
    // Skip if not admin
    skip: !session || session.user?.role !== "admin",
  });

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  // Loading skeleton
  if (isLoading || status === "loading") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data.{" "}
            {error?.data?.error || "Please try again."}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = dashboardData || {
    stats: {},
    recentActivity: [],
    alerts: [],
  };

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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Admin Dashboard</h1>
          <p className="text-teal-600">
            Monitor platform activity and performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center text-teal-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Updating...</span>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-teal-600">
              +{data.stats.newUsersThisWeek || 0} this week
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Active Tasks
            </CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.activeTasks || 0}
            </div>
            <p className="text-xs text-teal-600">
              {data.stats.completedTasksThisMonth || 0} completed this month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              ₹{(data.stats.totalRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-teal-600">
              {data.stats.pendingSubmissions || 0} pending submissions
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              System Health
            </CardTitle>
            <Award className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.systemHealth || 0}%
            </div>
            <p className="text-xs text-teal-600">
              {data.stats.systemHealth >= 95
                ? "All systems operational"
                : data.stats.systemHealth >= 80
                ? "Minor issues detected"
                : "Attention required"}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Additional Stats Row */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Pending KYC
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {data.stats.pendingKyc || 0}
            </div>
            <p className="text-xs text-blue-600">
              {data.stats.verifiedKyc || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Approved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {data.stats.approvedSubmissions || 0}
            </div>
            <p className="text-xs text-green-600">Submissions</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Rejected
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {data.stats.rejectedSubmissions || 0}
            </div>
            <p className="text-xs text-red-600">Submissions</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">
              Pending Review
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">
              {data.stats.pendingSubmissions || 0}
            </div>
            <p className="text-xs text-yellow-600">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Growth Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {data.stats.newUsersThisWeek && data.stats.totalUsers
                ? Math.round(
                    (data.stats.newUsersThisWeek / data.stats.totalUsers) *
                      100 *
                      52
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-purple-600">Annual rate</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">
              Efficiency
            </CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">
              {data.stats.approvedSubmissions &&
              data.stats.pendingSubmissions +
                data.stats.approvedSubmissions +
                data.stats.rejectedSubmissions >
                0
                ? Math.round(
                    (data.stats.approvedSubmissions /
                      (data.stats.pendingSubmissions +
                        data.stats.approvedSubmissions +
                        data.stats.rejectedSubmissions)) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-indigo-600">Success rate</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts Section */}
      {data.alerts && data.alerts.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="space-y-3">
            {data.alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.type === "error" ? "destructive" : "default"}
                className="border-teal-200"
              >
                {alert.type === "warning" && (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {alert.type === "info" && <Clock className="h-4 w-4" />}
                {alert.type === "error" && <XCircle className="h-4 w-4" />}
                <AlertDescription className="font-medium">
                  {alert.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">Platform Activity</CardTitle>
            <CardDescription className="text-teal-600">
              Recent platform metrics and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {data.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-teal-100 rounded-lg bg-white/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                        {activity.type === "user_signup" && (
                          <Users className="h-5 w-5 text-teal-600" />
                        )}
                        {activity.type === "task_completion" && (
                          <Target className="h-5 w-5 text-teal-600" />
                        )}
                        {activity.type === "revenue" && (
                          <DollarSign className="h-5 w-5 text-teal-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-teal-900 capitalize">
                          {activity.type.replace("_", " ")}
                        </p>
                        <p className="text-sm text-teal-600">
                          {activity.period}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-teal-900">
                        {activity.type === "revenue"
                          ? `₹${(activity.count || 0).toLocaleString()}`
                          : (activity.count || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        {activity.change}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-teal-600">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity data available</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => router.push("/dashboard/admin/tasks")}
              >
                <Target className="h-4 w-4 mr-2" />
                Manage Tasks
              </Button>
              <Button
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => router.push("/dashboard/admin/users")}
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
