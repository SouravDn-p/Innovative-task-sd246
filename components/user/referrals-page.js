"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Copy,
  QrCode,
  Users,
  TrendingUp,
  ArrowLeft,
  Check,
  Calendar,
} from "lucide-react";
import {
  useGetReferralsQuery,
  useGetReferralStatsQuery,
} from "@/redux/api/api";

export function ReferralsPage() {
  const [copied, setCopied] = useState(false);

  const { data: referralStats = {}, isLoading: statsLoading } =
    useGetReferralStatsQuery("current-user-id");
  const { data: recentReferrals = [], isLoading: referralsLoading } =
    useGetReferralsQuery("current-user-id");

  const referralCode = referralStats.referralCode || "JOHN2024";
  const referralLink = `https://Innovative Task Earn.pro/join/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Innovative Task Earn",
        text: "Join me on Innovative Task Earn and start earning money by completing simple tasks!",
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (statsLoading || referralsLoading) {
    return <div className="p-4">Loading referral data...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Referrals</h1>
            <p className="text-sm text-muted-foreground">
              Earn ₹49 for each referral
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {referralStats.totalReferrals || 0}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Referrals
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">
                ₹{(referralStats.totalEarnings || 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Earned</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {referralStats.todayReferrals || 0}
                </p>
                <p className="text-sm text-muted-foreground">referrals today</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary">
                  ₹{((referralStats.todayReferrals || 0) * 49).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">earned today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Share Your Referral Link
            </CardTitle>
            <CardDescription>
              Share your unique link and earn ₹49 for each person who joins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex gap-2">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button variant="outline" size="sm" onClick={handleCopyCode}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Link</label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly className="text-xs" />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              <Button variant="outline">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{referral.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(referral.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(referral.status)}>
                      {referral.status}
                    </Badge>
                    <p className="text-sm font-semibold mt-1">
                      ₹{referral.earnings.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
