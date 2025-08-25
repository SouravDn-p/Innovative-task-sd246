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
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Target,
  Users,
  Zap,
  CheckCircle,
  Star,
} from "lucide-react";

const mockData = {
  user: {
    stats: {
      totalEarned: 1247.5,
      tasksCompleted: 156,
      activeReferrals: 23,
      currentStreak: 12,
    },
    recentTasks: [
      {
        id: 1,
        title: "Product Review",
        reward: 15,
        status: "completed",
        date: "2024-01-15",
      },
      {
        id: 2,
        title: "Survey Completion",
        reward: 8,
        status: "in-progress",
        date: "2024-01-14",
      },
      {
        id: 3,
        title: "Data Entry",
        reward: 25,
        status: "completed",
        date: "2024-01-13",
      },
    ],
    achievements: [
      { name: "First Steps", icon: Target, earned: true },
      { name: "Streak Master", icon: Zap, earned: true },
      { name: "Social Butterfly", icon: Star, earned: false },
    ],
  },
};

export default function UserDashboard() {
  const data = mockData.user;

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
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Earned
            </CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              ₹{data.stats.totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-teal-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Tasks Completed
            </CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.tasksCompleted}
            </div>
            <p className="text-xs text-teal-600">+8 this week</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Active Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.activeReferrals}
            </div>
            <p className="text-xs text-teal-600">+3 this month</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.currentStreak} days
            </div>
            <p className="text-xs text-teal-600">Keep it up!</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">Recent Tasks</CardTitle>
            <CardDescription className="text-teal-600">
              Your latest task activity
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {data.recentTasks.map((task) => (
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
                      <p className="font-medium text-teal-900">{task.title}</p>
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
              ))}
            </div>
            <Button
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
              aria-label="View all tasks"
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">Achievements</CardTitle>
            <CardDescription className="text-teal-600">
              Your progress and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {data.achievements.map((achievement, index) => (
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
                    <p className="font-medium text-teal-900">
                      {achievement.name}
                    </p>
                    <p className="text-sm text-teal-600">
                      {achievement.earned ? "Completed" : "In Progress"}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
              aria-label="View all achievements"
            >
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
