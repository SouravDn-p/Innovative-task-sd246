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
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  BarChart3,
  TrendingUp,
  Target,
  ArrowUpRight,
} from "lucide-react";

const mockData = {
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
};

export default function AdvertiserDashboard() {
  const data = mockData.advertiser;

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
}
