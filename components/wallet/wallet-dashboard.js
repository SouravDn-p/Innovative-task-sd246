"use client";
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
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Plus,
} from "lucide-react";
import { useGetWalletQuery, useGetTransactionsQuery } from "@/redux/api/api";

export function WalletDashboard({ userType = "user" }) {
  const { data: walletData = {}, isLoading: walletLoading } =
    useGetWalletQuery("current-user-id");
  const { data: transactions = [], isLoading: transactionsLoading } =
    useGetTransactionsQuery({
      userId: "current-user-id",
      limit: 5,
    });

  const getTransactionIcon = (type, category) => {
    if (type === "credit") {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "referral":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "task":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "withdrawal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "fee":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canWithdraw =
    walletData.balance >= walletData.minWithdrawal && walletData.kycStatus;

  if (walletLoading || transactionsLoading) {
    return <div className="p-6">Loading wallet data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-4xl font-bold">
                ₹{walletData.balance.toFixed(2)}
              </p>
              {walletData.pendingEarnings > 0 && (
                <p className="text-sm opacity-75 mt-1">
                  + ₹{walletData.pendingEarnings.toFixed(2)} pending
                </p>
              )}
            </div>
            <Wallet className="h-12 w-12 opacity-80" />
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              disabled={!canWithdraw}
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
            {userType === "advertiser" && (
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            )}
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

      {/* Withdrawal Requirements */}
      {!canWithdraw && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Withdrawal Requirements
                </p>
                <div className="mt-2 space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
                  {walletData.balance < walletData.minWithdrawal && (
                    <p>
                      • Minimum balance: ₹{walletData.minWithdrawal} (Current: ₹
                      {walletData.balance.toFixed(2)})
                    </p>
                  )}
                  {!walletData.kycStatus && <p>• Complete KYC verification</p>}
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress to minimum withdrawal</span>
                    <span>
                      {Math.min(
                        100,
                        (walletData.balance / walletData.minWithdrawal) * 100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      (walletData.balance / walletData.minWithdrawal) * 100
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">
                  ₹{walletData.totalEarnings.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+12.5% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Withdrawals
                </p>
                <p className="text-2xl font-bold">
                  ₹{walletData.totalWithdrawals.toFixed(2)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">
                Last withdrawal: Jan 19
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Earnings
                </p>
                <p className="text-2xl font-bold">
                  ₹{walletData.pendingEarnings.toFixed(2)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-xs text-muted-foreground">
                Under review
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-full">
                    {getTransactionIcon(transaction.type, transaction.category)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={getCategoryColor(transaction.category)}
                        variant="outline"
                      >
                        {transaction.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {transaction.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount.toFixed(2)}
                  </p>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
