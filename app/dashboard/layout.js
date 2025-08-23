"use client";

import { useSelector } from "react-redux";
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
import DashboardLayout from "@/components/layout/dashboard-layout";
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
  BarChart3,
  Zap,
  Star,
  ArrowUpRight,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

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
  advertiser: {
    stats: {
      totalSpent: 5420.0,
      activeCampaigns: 8,
      totalClicks: 12450,
      conversionRate: 3.2,
    },
    campaigns: [
      {
        id: 1,
        name: "Summer Sale Campaign",
        budget: 1200,
        spent: 890,
        clicks: 3420,
        status: "active",
      },
      {
        id: 2,
        name: "Product Launch",
        budget: 800,
        spent: 650,
        clicks: 2100,
        status: "active",
      },
      {
        id: 3,
        name: "Brand Awareness",
        budget: 500,
        spent: 500,
        clicks: 1800,
        status: "completed",
      },
    ],
  },
  admin: {
    stats: {
      totalUsers: 15420,
      activeTasks: 342,
      totalRevenue: 125000,
      systemHealth: 98.5,
    },
    recentActivity: [
      { type: "user_signup", count: 45, change: "+12%", period: "today" },
      { type: "task_completion", count: 234, change: "+8%", period: "today" },
      { type: "revenue", count: 3420, change: "+15%", period: "this week" },
    ],
  },
};

export default function DashboardPage() {
  const role = useSelector((state) => state?.auth?.role || "user");
  const data = mockData[role] || mockData.user;

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

  const renderUserDashboard = () => (
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

  const renderAdvertiserDashboard = () => (
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
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              ₹{data.stats.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-teal-600">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Active Campaigns
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.activeCampaigns}
            </div>
            <p className="text-xs text-teal-600">2 launching soon</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Total Clicks
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-teal-600">+25% this week</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium text-teal-800">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.conversionRate}%
            </div>
            <p className="text-xs text-teal-600">+0.3% improvement</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="relative overflow-hidden border-teal-200 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
          <CardHeader className="relative">
            <CardTitle className="text-teal-800">
              Campaign Performance
            </CardTitle>
            <CardDescription className="text-teal-600">
              Overview of your active campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              {data.campaigns.map((campaign) => (
                <div key={campaign.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-teal-900">
                        {campaign.name}
                      </p>
                      <p className="text-sm text-teal-600">
                        ₹{campaign.spent.toFixed(2)} / ₹
                        {campaign.budget.toFixed(2)} •{" "}
                        {campaign.clicks.toLocaleString()} clicks
                      </p>
                    </div>
                    <Badge
                      variant={
                        campaign.status === "active" ? "default" : "secondary"
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
                    value={(campaign.spent / campaign.budget) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View All Campaigns
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  const renderAdminDashboard = () => (
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
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold text-teal-900">
              {data.stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-teal-600">+245 this week</p>
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
              {data.stats.activeTasks}
            </div>
            <p className="text-xs text-teal-600">+12 today</p>
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
              ₹{data.stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-teal-600">+22% this month</p>
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
              {data.stats.systemHealth}%
            </div>
            <p className="text-xs text-teal-600">All systems operational</p>
          </CardContent>
        </Card>
      </motion.div>

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
              {data.recentActivity.map((activity, index) => (
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
                      <p className="text-sm text-teal-600">{activity.period}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-teal-900">
                      {activity.count.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600">{activity.change}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-teal-800">
              {role === "admin"
                ? "Admin Dashboard"
                : role === "advertiser"
                ? "Advertiser Dashboard"
                : "User Dashboard"}
            </h1>
            <p className="text-teal-600">
              {role === "admin"
                ? "Monitor platform performance and manage users"
                : role === "advertiser"
                ? "Track your campaigns and advertising performance"
                : "Track your earnings and complete tasks"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="border-teal-200 text-teal-600 hover:bg-teal-50"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>

        {role === "user" && renderUserDashboard()}
        {role === "advertiser" && renderAdvertiserDashboard()}
        {role === "admin" && renderAdminDashboard()}
      </motion.div>
    </DashboardLayout>
  );
}
