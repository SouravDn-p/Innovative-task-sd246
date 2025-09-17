"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useGetAdvertiserAnalyticsQuery } from "@/redux/api/api";
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
  BarChart,
  LineChart,
  PieChart,
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdvertiserAnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("line");

  // Convert time range to days for API
  const days =
    timeRange === "7d"
      ? 7
      : timeRange === "30d"
      ? 30
      : timeRange === "90d"
      ? 90
      : 365;

  // Fetch advertiser analytics data using Redux
  const {
    data: analyticsData,
    error,
    isLoading,
  } = useGetAdvertiserAnalyticsQuery({ days });

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
        Loading...
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="block md:flex justify-between items-center ">
        <div className="pb-4">
          <h1 className="text-2xl font-bold text-teal-900">
            Analytics Dashboard
          </h1>
          <p className="text-teal-600">
            Track the performance of your advertising campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 border-teal-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-32 border-teal-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-teal-800">Loading analytics data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">
            Error loading analytics data
          </h3>
          <p className="text-red-600 mb-4">
            {error?.data?.error || "Failed to fetch analytics data"}
          </p>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Overview Cards */}
      {!isLoading && !error && analyticsData?.overview && (
        <>
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Impressions
                </CardTitle>
                <Eye className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {analyticsData.overview.totalImpressions?.toLocaleString() ||
                    0}
                </div>
                <p className="text-xs text-teal-600">+12% from last period</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Clicks
                </CardTitle>
                <MousePointerClick className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {analyticsData.overview.totalClicks?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-teal-600">+8% from last period</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  Conversions
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {analyticsData.overview.completedSubmissions || 0}
                </div>
                <p className="text-xs text-teal-600">+15% from last period</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group border-teal-200 shadow-md hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100 transition-opacity"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-teal-800">
                  ROAS
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-teal-900">
                  {analyticsData.overview.roas || 0}x
                </div>
                <p className="text-xs text-teal-600">+0.3x from last period</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Chart */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-teal-200 shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100"></div>
              <CardHeader className="relative">
                <CardTitle className="text-teal-800">
                  Performance Overview
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Track impressions, clicks, and conversions over time
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="h-80 flex items-center justify-center bg-white rounded-lg border border-teal-100">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-teal-400 mx-auto mb-3" />
                    <p className="text-teal-700 font-medium">
                      Performance Chart
                    </p>
                    <p className="text-sm text-teal-500">
                      Visualization of campaign performance metrics
                    </p>
                    <p className="text-xs text-teal-400 mt-2">
                      (Chart implementation would go here)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campaign Performance */}
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden border-teal-200 shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-100"></div>
              <CardHeader className="relative">
                <CardTitle className="text-teal-800">
                  Campaign Performance
                </CardTitle>
                <CardDescription className="text-teal-600">
                  Detailed metrics for each advertising campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-4">
                  {analyticsData.campaignPerformance &&
                  analyticsData.campaignPerformance.length > 0 ? (
                    analyticsData.campaignPerformance.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-lg border border-teal-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-teal-900">
                              {campaign.name}
                            </h3>
                            <Badge
                              variant={
                                campaign.status === "approved"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                campaign.status === "approved"
                                  ? "bg-teal-500"
                                  : "bg-teal-200 text-teal-800"
                              }
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-teal-600">Impressions</p>
                              <p className="font-medium">
                                {campaign.impressions?.toLocaleString() || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-teal-600">Clicks</p>
                              <p className="font-medium">
                                {campaign.clicks?.toLocaleString() || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-teal-600">Conversions</p>
                              <p className="font-medium">
                                {campaign.conversions || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-teal-600">Spend</p>
                              <p className="font-medium">
                                ₹{campaign.cost || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-4 md:w-48">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-teal-600">CTR</span>
                            <span className="text-sm font-medium">
                              {campaign.ctr || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (campaign.ctr || 0) * 2
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-teal-600">ROAS</span>
                            <span className="text-sm font-medium">
                              {campaign.roas || 0}x
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No campaign performance data available
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700"
                  onClick={() =>
                    router.push("/dashboard/advertiser/active-tasks")
                  }
                >
                  View All Campaigns
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
