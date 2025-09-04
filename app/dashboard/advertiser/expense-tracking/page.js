"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function ExpenseTrackingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("6m");
  const [expenseData, setExpenseData] = useState({
    totalSpent: 0,
    monthlyBudget: 15000, // Default value, should come from settings
    campaignExpenses: [],
    monthlySpending: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch expense data
  useEffect(() => {
    const fetchExpenseData = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        // Fetch advertiser wallet data which includes task statistics
        const response = await fetch(`/api/advertiser/wallet`);
        const data = await response.json();

        if (response.ok) {
          // Transform the data to match the expected format
          const totalSpent = data.taskStatistics?.totalSpent || 0;

          // Get campaign expenses from transactions
          const campaignExpenses =
            data.transactions
              ?.filter((transaction) => transaction.type === "debit")
              ?.slice(0, 10) // Get last 10 transactions
              ?.map((transaction, index) => ({
                id: transaction._id,
                name: transaction.description || "Campaign Expense",
                amount: transaction.amount,
                status: "completed",
                startDate: new Date(transaction.createdAt)
                  .toISOString()
                  .split("T")[0],
                endDate: new Date(transaction.createdAt)
                  .toISOString()
                  .split("T")[0],
              })) || [];

          // Get monthly spending from monthlySpending data
          const monthlySpending =
            data.monthlySpending?.map((monthData) => ({
              month: monthData.month,
              amount: monthData.amount,
            })) || [];

          setExpenseData({
            totalSpent,
            monthlyBudget: 15000, // Default value, should come from settings
            campaignExpenses,
            monthlySpending,
          });
        } else {
          setError(data.error || "Failed to fetch expense data");
        }
      } catch (err) {
        setError("Failed to fetch expense data");
        console.error("Error fetching expense data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchExpenseData();
    }
  }, [session, status]);

  const totalSpent = expenseData.totalSpent;
  const monthlyBudget = expenseData.monthlyBudget;
  const budgetUsed =
    monthlyBudget > 0 ? Math.min(100, (totalSpent / monthlyBudget) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Expense Tracking</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your advertising spend and budget utilization
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last 1 month</SelectItem>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last 1 year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <span className="ml-2 text-teal-800">Loading expense data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error loading expense data
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Overall Spending */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Spent
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Monthly Budget
                      </p>
                      <p className="text-2xl font-bold">
                        ₹{monthlyBudget.toLocaleString()}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Budget Utilization
                      </p>
                      <p className="text-2xl font-bold">
                        {budgetUsed.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Monthly Budget Progress
                </CardTitle>
                <CardDescription>
                  Track your spending against your monthly budget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">₹0</span>
                    <span className="font-medium">
                      ₹{totalSpent.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      ₹{monthlyBudget.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={budgetUsed} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Remaining Budget
                    </p>
                    <p className="font-bold">
                      ₹{(monthlyBudget - totalSpent).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Budget Status
                    </p>
                    <p className="font-bold">
                      {budgetUsed < 50
                        ? "On Track"
                        : budgetUsed < 80
                        ? "Caution"
                        : "Over Budget"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Campaign Expense Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed spending per advertising campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {expenseData.campaignExpenses.length > 0 ? (
                    expenseData.campaignExpenses.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-3 bg-card border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {campaign.startDate} to {campaign.endDate}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            ₹{campaign.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {totalSpent > 0
                              ? ((campaign.amount / totalSpent) * 100).toFixed(
                                  1
                                )
                              : 0}
                            % of total
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No campaign expenses found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Spending Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monthly Spending Trend
                </CardTitle>
                <CardDescription>
                  Your advertising spend over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseData.monthlySpending.length > 0 ? (
                    expenseData.monthlySpending.map((month, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">
                          {month.month}
                        </span>
                        <div className="flex items-center gap-2 w-3/4">
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (month.amount / 5000) * 100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-20 text-right">
                            ₹{month.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No monthly spending data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
