"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  DollarSign,
  Target,
  Users,
  Zap,
  CheckCircle,
  Star,
  Loader2,
} from "lucide-react";
import { useGetUserByEmailQuery, useGetUserTasksQuery } from "@/redux/api/api";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStreak, setCurrentStreak] = useState(0);

  // Get user data
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByEmailQuery(session?.user?.email, {
    skip: !session?.user?.email,
  });

  // Get user tasks data
  const {
    data: userTasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useGetUserTasksQuery(session?.user?.email, {
    skip: !session?.user?.email,
  });

  // Calculate current streak based on recent task activity
  useEffect(() => {
    if (userTasksData?.recentTasks) {
      // Simple streak calculation based on consecutive days with completed tasks
      const today = new Date();
      const recentDays = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const hasTaskOnDate = userTasksData.recentTasks.some(
          (task) => task.status === "completed" && task.date === dateStr
        );

        if (hasTaskOnDate) {
          recentDays.push(dateStr);
        } else if (i === 0) {
          // If no task today, streak is 0
          break;
        } else {
          // Gap in streak
          break;
        }
      }

      setCurrentStreak(recentDays.length);
    }
  }, [userTasksData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const user = userData?.user;
  const userTasks = userTasksData?.userTasks || [];
  const statistics = userTasksData?.statistics || {};
  const recentTasks = userTasksData?.recentTasks || [];

  // Calculate referrals from user data
  const activeReferrals =
    user?.Recent_Referrals?.length || user?.recentReferrals?.length || 0;

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

  // Loading state
  if (status === "loading" || userLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading dashboard...</span>
      </div>
    );
  }

  // Error state
  if (userError || tasksError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Earned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              ₹{user?.totalEarn || user?.walletBalance || 0}
            </div>
            <p className="text-xs text-teal-600">
              {statistics.totalEarned > 0
                ? `+₹${statistics.totalEarned} this month`
                : "Start earning today!"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Tasks Completed
            </CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {statistics.tasksCompleted || 0}
            </div>
            <p className="text-xs text-teal-600">
              {statistics.activeTasks > 0
                ? `${statistics.activeTasks} active`
                : "No active tasks"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Active Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {activeReferrals}
            </div>
            <p className="text-xs text-teal-600">
              {user?.dailyReferralsCount > 0
                ? `+${user.dailyReferralsCount} today`
                : "Share your link!"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {currentStreak} days
            </div>
            <p className="text-xs text-teal-600">
              {currentStreak > 0 ? "Keep it up!" : "Start your streak!"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Wallet Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              ₹{user?.walletBalance?.toFixed(2) || "0.00"}
            </div>
            <Button
              className="mt-2 w-full text-xs bg-teal-600 hover:bg-teal-700"
              size="sm"
              onClick={() => router.push("/dashboard/user/wallet")}
            >
              View Wallet
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">Recent Tasks</CardTitle>
            <CardDescription className="text-teal-600">
              Your latest task activity
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="font-medium text-teal-900 text-sm">
                          {task.title}
                        </p>
                        <p className="text-sm text-teal-600">{task.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.status === "completed" ? "default" : "secondary"
                      }
                      className={
                        task.status === "completed"
                          ? "bg-teal-500"
                          : "bg-teal-200 text-teal-800"
                      }
                    >
                      ₹{task.reward}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-teal-300 mx-auto mb-3" />
                  <p className="text-teal-600">No recent tasks found</p>
                  <p className="text-sm text-teal-500">
                    Start working on tasks to see them here!
                  </p>
                </div>
              )}
            </div>
            <Button
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-xs"
              aria-label="View all tasks"
              onClick={() => router.push("/dashboard/user/task")}
              size="sm"
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">Achievements</CardTitle>
            <CardDescription className="text-teal-600">
              Your progress and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {[
                {
                  name: "First Steps",
                  icon: Target,
                  earned: statistics.tasksCompleted > 0,
                  description: "Complete your first task",
                },
                {
                  name: "Streak Master",
                  icon: Zap,
                  earned: currentStreak >= 7,
                  description: "Maintain a 7-day streak",
                },
                {
                  name: "Social Butterfly",
                  icon: Star,
                  earned: activeReferrals >= 5,
                  description: "Refer 5 or more users",
                },
                {
                  name: "Task Expert",
                  icon: CheckCircle,
                  earned: statistics.tasksCompleted >= 50,
                  description: "Complete 50 tasks",
                },
                {
                  name: "High Earner",
                  icon: DollarSign,
                  earned: (user?.totalEarn || user?.walletBalance || 0) >= 1000,
                  description: "Earn ₹1000 or more",
                },
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.earned
                        ? "bg-teal-100 text-teal-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <achievement.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-teal-900 text-sm">
                      {achievement.name}
                    </p>
                    <p className="text-sm text-teal-600">
                      {achievement.earned
                        ? "Completed"
                        : achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-xs"
                aria-label="View all achievements"
                onClick={() => router.push("/dashboard/user")}
                size="sm"
              >
                View All Achievements
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
