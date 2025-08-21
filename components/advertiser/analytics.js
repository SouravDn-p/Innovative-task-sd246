"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ArrowLeft, TrendingUp, TrendingDown, Users, Eye, DollarSign, Download } from "lucide-react"

export function AdvertiserAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")
  const [selectedCampaign, setSelectedCampaign] = useState("all")

  const performanceData = [
    { date: "Jan 10", completions: 12, spend: 300, reach: 450 },
    { date: "Jan 11", completions: 18, spend: 450, reach: 680 },
    { date: "Jan 12", completions: 15, spend: 375, reach: 520 },
    { date: "Jan 13", completions: 22, spend: 550, reach: 780 },
    { date: "Jan 14", completions: 28, spend: 700, reach: 920 },
    { date: "Jan 15", completions: 25, spend: 625, reach: 850 },
    { date: "Jan 16", completions: 30, spend: 750, reach: 1100 },
  ]

  const campaignTypeData = [
    { name: "Social Media", value: 45, color: "#3b82f6" },
    { name: "App Store", value: 30, color: "#10b981" },
    { name: "Video", value: 15, color: "#f59e0b" },
    { name: "Survey", value: 10, color: "#ef4444" },
  ]

  const topPerformers = [
    { campaign: "Instagram Follow Campaign", completions: 156, ctr: 18.5, spend: 3900 },
    { campaign: "App Download & Review", completions: 128, ctr: 15.8, spend: 3200 },
    { campaign: "YouTube Subscribe", completions: 95, ctr: 12.3, spend: 2375 },
    { campaign: "Website Survey", completions: 67, ctr: 9.8, spend: 1675 },
  ]

  const metrics = {
    totalSpend: 45230,
    totalCompletions: 1247,
    avgCTR: 14.2,
    totalReach: 125430,
    costPerCompletion: 36.3,
    conversionRate: 11.8,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Campaign Analytics</h1>
              <p className="text-sm text-muted-foreground">Performance insights and metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Spend</p>
                  <p className="text-lg font-bold">₹{metrics.totalSpend.toLocaleString()}</p>
                </div>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completions</p>
                  <p className="text-lg font-bold">{metrics.totalCompletions}</p>
                </div>
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+8.3%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg CTR</p>
                  <p className="text-lg font-bold">{metrics.avgCTR}%</p>
                </div>
                <Eye className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                <span className="text-xs text-red-500">-2.1%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Reach</p>
                  <p className="text-lg font-bold">{metrics.totalReach.toLocaleString()}</p>
                </div>
                <Users className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+15.7%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Cost/Completion</p>
                  <p className="text-lg font-bold">₹{metrics.costPerCompletion}</p>
                </div>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">-5.2%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                  <p className="text-lg font-bold">{metrics.conversionRate}%</p>
                </div>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500">+3.4%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Daily completions, spend, and reach metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completions" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Types</CardTitle>
              <CardDescription>Distribution by campaign category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={campaignTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {campaignTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performing Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Best campaigns by completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((campaign, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{campaign.campaign}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground">{campaign.completions} completions</span>
                        <span className="text-xs text-muted-foreground">CTR: {campaign.ctr}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{campaign.spend.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
