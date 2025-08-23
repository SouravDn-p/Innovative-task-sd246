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

// Mock data - replace with API calls in production
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
  // Safely access role from Redux state
  const role = useSelector((state) => state?.auth?.role || "user");
  const data = mockData[role] || mockData.user;

  // User Dashboard
  const renderUserDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.stats.totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <Target
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.tasksCompleted}
            </div>
            <p className="text-xs text-muted-foreground">+8 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Referrals
            </CardTitle>
            <Users
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.activeReferrals}
            </div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.currentStreak} days
            </div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest task activity</CardDescription>
          </CardHeader>
          <CardContent>
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
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === "completed" ? "default" : "secondary"
                    }
                    aria-label={`Reward: $${task.reward}`}
                  >
                    ${task.reward}
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              aria-label="View all tasks"
            >
              View All Tasks
            </Button>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your progress and milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.earned
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <achievement.icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.earned ? "Completed" : "In Progress"}
                    </p>
                  </div>
                  {achievement.earned && (
                    <CheckCircle
                      className="h-4 w-4 text-green-500"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              aria-label="View all achievements"
            >
              View All Achievements
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Advertiser Dashboard
  const renderAdvertiserDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.stats.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <BarChart3
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.activeCampaigns}
            </div>
            <p className="text-xs text-muted-foreground">2 launching soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <TrendingUp
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+25% this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.conversionRate}%
            </div>
            <p className="text-xs text-muted-foreground">+0.3% improvement</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Overview of your active campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.campaigns.map((campaign) => (
              <div key={campaign.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${campaign.spent.toFixed(2)} / $
                      {campaign.budget.toFixed(2)} •{" "}
                      {campaign.clicks.toLocaleString()} clicks
                    </p>
                  </div>
                  <Badge
                    variant={
                      campaign.status === "active" ? "default" : "secondary"
                    }
                    aria-label={`Status: ${campaign.status}`}
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <Progress
                  value={(campaign.spent / campaign.budget) * 100}
                  className="h-2"
                  aria-label={`Budget progress: ${
                    (campaign.spent / campaign.budget) * 100
                  }%`}
                />
              </div>
            ))}
          </div>
          <Button
            className="w-full mt-4"
            variant="outline"
            aria-label="View all campaigns"
          >
            <ArrowUpRight className="h-4 w-4 mr-2" aria-hidden="true" />
            View All Campaigns
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Admin Dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+245 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Target
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground">+12 today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">+22% this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Award
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
          <CardDescription>Recent platform metrics and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {activity.type === "user_signup" && (
                      <Users
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    )}
                    {activity.type === "task_completion" && (
                      <Target
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    )}
                    {activity.type === "revenue" && (
                      <DollarSign
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {activity.type.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.period}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {activity.count.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">{activity.change}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            className="w-full mt-4"
            variant="outline"
            aria-label="View detailed analytics"
          >
            <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
            View Detailed Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {role === "admin"
                ? "Admin Dashboard"
                : role === "advertiser"
                ? "Advertiser Dashboard"
                : "User Dashboard"}
            </h1>
            <p className="text-muted-foreground">
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
              aria-label="Select time range: Last 30 days"
            >
              <Calendar className="h-4 w-4 mr-2" aria-hidden="true" />
              Last 30 days
            </Button>
            <Button aria-label="View reports">
              <TrendingUp className="h-4 w-4 mr-2" aria-hidden="true" />
              View Reports
            </Button>
          </div>
        </div>

        {/* Role-specific content */}
        {role === "user" && renderUserDashboard()}
        {role === "advertiser" && renderAdvertiserDashboard()}
        {role === "admin" && renderAdminDashboard()}
      </div>
    </DashboardLayout>
  );
}
