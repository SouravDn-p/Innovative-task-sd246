"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  CheckCircle,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  UserCheck,
  Shield,
  Activity,
} from "lucide-react"

export function AdminDashboard({ userRole }) {
  const stats = {
    activeUsers: 12450,
    totalEarnings: 2450000,
    pendingPayouts: 125000,
    activeCampaigns: 89,
    pendingReviews: 234,
    suspendedUsers: 45,
    kycPending: 67,
    fraudAlerts: 12,
  }

  const recentActivity = [
    {
      id: 1,
      type: "payout",
      message: "Payout approved for user #12345",
      amount: 3000,
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "fraud",
      message: "Suspicious activity detected for user #67890",
      time: "5 minutes ago",
      status: "warning",
    },
    {
      id: 3,
      type: "kyc",
      message: "KYC verification completed for user #54321",
      time: "10 minutes ago",
      status: "success",
    },
    {
      id: 4,
      type: "campaign",
      message: "New campaign created by advertiser #98765",
      time: "15 minutes ago",
      status: "info",
    },
    {
      id: 5,
      type: "task",
      message: "Task submission flagged for review",
      time: "20 minutes ago",
      status: "warning",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case "payout":
        return <Wallet className="h-4 w-4" />
      case "fraud":
        return <Shield className="h-4 w-4" />
      case "kyc":
        return <UserCheck className="h-4 w-4" />
      case "campaign":
        return <TrendingUp className="h-4 w-4" />
      case "task":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening on your platform today.</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {userRole.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">₹{(stats.totalEarnings / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+8.3% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">₹{(stats.pendingPayouts / 1000).toFixed(0)}K</p>
              </div>
              <Wallet className="h-8 w-8 text-accent" />
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs text-yellow-500">Requires attention</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+5.2% from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userRole === "super_admin" || userRole === "task_manager" ? (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pendingReviews}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full border-yellow-300 bg-transparent">
                Review Tasks
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {userRole === "super_admin" || userRole === "kyc_manager" ? (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">KYC Pending</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.kycPending}</p>
                </div>
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full border-blue-300 bg-transparent">
                Review KYC
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {userRole === "super_admin" || userRole === "payout_manager" ? (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Payout Queue</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ₹{(stats.pendingPayouts / 1000).toFixed(0)}K
                  </p>
                </div>
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full border-green-300 bg-transparent">
                Process Payouts
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {userRole === "super_admin" || userRole === "kyc_manager" ? (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Fraud Alerts</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.fraudAlerts}</p>
                </div>
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <Button size="sm" variant="outline" className="mt-2 w-full border-red-300 bg-transparent">
                Investigate
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.amount && (
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{activity.amount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Task Processing</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Payout Success Rate</span>
                <span>94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>User Satisfaction</span>
                <span>91%</span>
              </div>
              <Progress value={91} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stats.suspendedUsers}</p>
                <p className="text-xs text-muted-foreground">Suspended Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">98.5%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">2.3s</p>
                <p className="text-xs text-muted-foreground">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-500">156</p>
                <p className="text-xs text-muted-foreground">Daily Signups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
