"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  Users,
  CheckCircle,
  TrendingUp,
  Share2,
  Bell,
  User,
  Settings,
} from "lucide-react";

export function UserDashboard() {
  const [user] = useState({
    name: "John Doe",
    walletBalance: 2450.5,
    weeklyGoal: 1500,
    weeklyEarned: 850,
    referralGoal: 5,
    referralsToday: 2,
    kycStatus: "pending",
    totalReferrals: 23,
    totalEarnings: 12450.75,
  });

  const weeklyProgress = (user.weeklyEarned / user.weeklyGoal) * 100;
  const referralProgress = (user.referralsToday / user.referralGoal) * 100;

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 w-full max-w-full overflow-x-hidden">
        {/* KYC Status Alert */}
        {user.kycStatus === "pending" && (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 w-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Complete KYC Verification
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 break-words">
                    Verify your identity to unlock withdrawals
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 bg-transparent whitespace-nowrap"
                >
                  Verify Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Balance */}
        <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-full">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm opacity-90">Total Balance</p>
                <p className="text-2xl md:text-3xl font-bold">
                  ₹{user.walletBalance.toFixed(2)}
                </p>
              </div>
              <Wallet className="h-8 w-8 opacity-80" />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 whitespace-nowrap"
              >
                Withdraw
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 whitespace-nowrap"
              >
                View History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Weekly Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>
                    ₹{user.weeklyEarned} / ₹{user.weeklyGoal}
                  </span>
                  <span className="text-muted-foreground">
                    {weeklyProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={weeklyProgress} className="h-2" />
                <p className="text-xs text-muted-foreground break-words">
                  ₹{(user.weeklyGoal - user.weeklyEarned).toFixed(2)} left to
                  reach goal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Daily Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>
                    {user.referralsToday} / {user.referralGoal}
                  </span>
                  <span className="text-muted-foreground">
                    {referralProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={referralProgress} className="h-2" />
                <p className="text-xs text-muted-foreground break-words">
                  {user.referralGoal - user.referralsToday} more referrals
                  needed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Card className="w-full">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {user.totalReferrals}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Referrals
              </div>
            </CardContent>
          </Card>
          <Card className="w-full">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                ₹{user.totalEarnings.toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Earnings
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">View Tasks</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Share Referral</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
