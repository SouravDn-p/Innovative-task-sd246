"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Share2,
  Gift,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "EARN2024XYZ";
  const referralLink = `https://earnhub.com/join/${referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralStats = [
    {
      label: "Total Referrals",
      value: "23",
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Active This Month",
      value: "8",
      icon: TrendingUp,
      color: "text-accent",
    },
    {
      label: "Total Earned",
      value: "$156.50",
      icon: DollarSign,
      color: "text-secondary",
    },
    {
      label: "Pending Rewards",
      value: "$24.00",
      icon: Gift,
      color: "text-muted-foreground",
    },
  ];

  const recentReferrals = [
    {
      name: "Alex Johnson",
      joinDate: "2024-01-15",
      status: "Active",
      earned: "$12.50",
    },
    {
      name: "Sarah Chen",
      joinDate: "2024-01-12",
      status: "Active",
      earned: "$8.75",
    },
    {
      name: "Mike Rodriguez",
      joinDate: "2024-01-10",
      status: "Pending",
      earned: "$0.00",
    },
    {
      name: "Emma Wilson",
      joinDate: "2024-01-08",
      status: "Active",
      earned: "$15.25",
    },
    {
      name: "David Kim",
      joinDate: "2024-01-05",
      status: "Active",
      earned: "$22.00",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Invite Friends, Earn Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share EarnHub with your friends and earn 10% of their task rewards
            for life. The more friends you invite, the more you earn!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {referralStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Link Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link with friends to start earning together
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Link
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Generate QR Code
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">How it works:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Friend signs up using your link</li>
                  <li>• They complete their first task</li>
                  <li>• You earn 10% of their task rewards</li>
                  <li>• Both of you get a $5 bonus!</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Referral Tiers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Tiers
              </CardTitle>
              <CardDescription>
                Unlock higher rewards as you refer more friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Bronze (0-9 referrals)</p>
                    <p className="text-sm text-muted-foreground">
                      10% commission
                    </p>
                  </div>
                  <Badge variant="secondary">Current</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Silver (10-24 referrals)</p>
                    <p className="text-sm text-muted-foreground">
                      15% commission
                    </p>
                  </div>
                  <Badge variant="outline">Locked</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Gold (25+ referrals)</p>
                    <p className="text-sm text-muted-foreground">
                      20% commission
                    </p>
                  </div>
                  <Badge variant="outline">Locked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
            <CardDescription>
              Track your recent referrals and their activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReferrals.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{referral.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {new Date(referral.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        referral.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {referral.status}
                    </Badge>
                    <p className="font-medium text-right">{referral.earned}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-primary/5 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Share your referral link now and start building your passive income
            stream
          </p>
          <Button size="lg" onClick={handleCopyLink}>
            <Share2 className="h-5 w-5 mr-2" />
            Copy Referral Link
          </Button>
        </div>
      </main>
    </div>
  );
}
