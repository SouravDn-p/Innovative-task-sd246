"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";

export function ExpenseTracking({ advertiserData }) {
  const totalSpent = advertiserData?.totalExpense || 0;
  const monthlyBudget = advertiserData?.monthlyBudget || 5000;
  const budgetUsed = Math.min(100, (totalSpent / monthlyBudget) * 100);

  const campaignExpenses = [
    { name: "Summer Campaign", amount: 1200, status: "active" },
    { name: "Product Launch", amount: 800, status: "active" },
    { name: "Brand Awareness", amount: 500, status: "completed" },
    { name: "Holiday Sale", amount: 1500, status: "active" },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Spending */}
      <Card className="relative overflow-hidden border-teal-200 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
        <CardHeader className="relative">
          <CardTitle className="text-teal-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Overview
          </CardTitle>
          <CardDescription className="text-teal-600">
            Track your advertising spend and budget utilization
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-teal-100">
              <p className="text-sm text-teal-600">Total Spent</p>
              <p className="text-2xl font-bold text-teal-900">
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-100">
              <p className="text-sm text-teal-600">Monthly Budget</p>
              <p className="text-2xl font-bold text-teal-900">
                ₹{monthlyBudget.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-teal-100">
              <p className="text-sm text-teal-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-teal-900">
                {budgetUsed.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-teal-700">Monthly Budget Progress</span>
              <span className="text-teal-600">
                ₹{totalSpent.toLocaleString()} / ₹
                {monthlyBudget.toLocaleString()}
              </span>
            </div>
            <Progress value={budgetUsed} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Breakdown */}
      <Card className="relative overflow-hidden border-teal-200 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
        <CardHeader className="relative">
          <CardTitle className="text-teal-800 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Expense Breakdown
          </CardTitle>
          <CardDescription className="text-teal-600">
            Detailed spending per advertising campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="space-y-3">
            {campaignExpenses.map((campaign, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-100"
              >
                <div>
                  <p className="font-medium text-teal-900">{campaign.name}</p>
                  <Badge
                    variant={
                      campaign.status === "active" ? "default" : "secondary"
                    }
                    className={
                      campaign.status === "active"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {campaign.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-teal-900">
                    ₹{campaign.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-teal-600">
                    {((campaign.amount / totalSpent) * 100).toFixed(1)}% of
                    total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
