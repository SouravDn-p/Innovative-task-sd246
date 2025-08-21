"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  Users,
  Eye,
  Plus,
  BarChart3,
  Settings,
  Bell,
  DollarSign,
  Target,
  Clock,
} from "lucide-react"

export function AdvertiserDashboard() {
  const [advertiser] = useState({
    name: "TechCorp Marketing",
    walletBalance: 15750.5,
    totalSpent: 45230.75,
    activeCampaigns: 8,
    totalCampaigns: 23,
    totalReach: 125430,
    avgCompletionRate: 87.5,
  })

  const activeCampaigns = [
    {
      id: 1,
      title: "Instagram Follow Campaign",
      type: "Social Media",
      budget: 5000,
      spent: 3250,
      completions: 130,
      maxCompletions: 200,
      status: "active",
      ctr: 12.5,
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      title: "App Download & Review",
      type: "App Store",
      budget: 8000,
      spent: 6400,
      completions: 128,
      maxCompletions: 160,
      status: "active",
      ctr: 15.8,
      createdAt: "2024-01-08",
    },
    {
      id: 3,
      title: "YouTube Channel Subscribe",
      type: "Video",
      budget: 3000,
      spent: 2850,
      completions: 95,
      maxCompletions: 100,
      status: "ending_soon",
      ctr: 18.2,
      createdAt: "2024-01-05",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "ending_soon":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active"
      case "ending_soon":
        return "Ending Soon"
      case "paused":
        return "Paused"
      default:
        return "Draft"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Advertiser Dashboard</h1>
            <p className="text-muted-foreground">{advertiser.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Wallet Balance */}
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Wallet Balance</p>
                <p className="text-3xl font-bold">₹{advertiser.walletBalance.toLocaleString()}</p>
                <p className="text-sm opacity-75 mt-1">Total Spent: ₹{advertiser.totalSpent.toLocaleString()}</p>
              </div>
              <Wallet className="h-10 w-10 opacity-80" />
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Add Funds
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Transaction History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{advertiser.activeCampaigns}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold">{advertiser.totalReach.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{advertiser.avgCompletionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{advertiser.totalCampaigns}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Campaigns */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Campaigns</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <Card key={campaign.id} className="border border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{campaign.title}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.type}</p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>{getStatusText(campaign.status)}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget</p>
                        <p className="font-semibold">₹{campaign.budget.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spent</p>
                        <p className="font-semibold">₹{campaign.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Completions</p>
                        <p className="font-semibold">
                          {campaign.completions}/{campaign.maxCompletions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CTR</p>
                        <p className="font-semibold">{campaign.ctr}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((campaign.completions / campaign.maxCompletions) * 100)}%</span>
                      </div>
                      <Progress value={(campaign.completions / campaign.maxCompletions) * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Analytics
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-2">Create New Campaign</h3>
              <p className="text-sm text-muted-foreground">Launch a new marketing campaign</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-3 text-accent" />
              <h3 className="font-semibold mb-2">View Analytics</h3>
              <p className="text-sm text-muted-foreground">Detailed campaign performance</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">Manage Wallet</h3>
              <p className="text-sm text-muted-foreground">Add funds and view transactions</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
