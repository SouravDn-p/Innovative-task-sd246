"use client";

import { useState, useRef } from "react"; // Added useRef import
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
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, useScroll, useTransform } from "framer-motion";

// Animation Presets
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "EARN2024XYZ";
  const referralLink = `https://taskearnpro.com/join/${referralCode}`;

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
      color: "text-teal-600",
    },
    {
      label: "Active This Month",
      value: "8",
      icon: TrendingUp,
      color: "text-teal-500",
    },
    {
      label: "Total Earned",
      value: "₹1,565",
      icon: DollarSign,
      color: "text-teal-700",
    },
    {
      label: "Pending Rewards",
      value: "₹240",
      icon: Gift,
      color: "text-teal-400",
    },
  ];

  const recentReferrals = [
    {
      name: "Alex Johnson",
      joinDate: "2024-01-15",
      status: "Active",
      earned: "₹125",
    },
    {
      name: "Sarah Chen",
      joinDate: "2024-01-12",
      status: "Active",
      earned: "₹87.5",
    },
    {
      name: "Mike Rodriguez",
      joinDate: "2024-01-10",
      status: "Pending",
      earned: "₹0",
    },
    {
      name: "Emma Wilson",
      joinDate: "2024-01-08",
      status: "Active",
      earned: "₹152.5",
    },
    {
      name: "David Kim",
      joinDate: "2024-01-05",
      status: "Active",
      earned: "₹220",
    },
  ];

  const bannerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: bannerRef });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {/* soft grid */}
        <div className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] absolute inset-0 bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px]" />
        {/* blobs */}
        <div className="absolute -top-32 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-200/40 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-300/50 blur-3xl animate-pulse-slow" />
      </div>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section with Inspiring Quote */}
        <section ref={bannerRef} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-center text-white shadow-lg mb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_50%_-10%,white,transparent)]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ y: yText }}
            className="relative space-y-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
              Together We Achieve More
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              - Helen Keller | Invite your friends to TaskEarn Pro and build a community of success.
            </p>
          </motion.div>
        </section>

        {/* Hero Section */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Invite Friends, Earn Together
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            Share TaskEarn Pro with your friends and earn 10% of their task rewards
            for life. The more friends you invite, the more you earn!
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {referralStats.map((stat, index) => (
            <motion.div key={index} variants={fadeInUp} whileHover={hoverScale}>
              <Card className="border border-teal-100/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-teal-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Referral Link and Tiers Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Referral Link Section */}
          <motion.div variants={fadeInLeft}>
            <Card className="border border-teal-100/60 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Share2 className="h-5 w-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Share this link with friends to start earning together
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="font-mono text-sm bg-teal-50 border-teal-200"
                  />
                  <Button onClick={handleCopyLink} variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-100">
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Link
                  </Button>
                  <Button variant="outline" className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-100">
                    Generate QR Code
                  </Button>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-teal-700">How it works:</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Friend signs up using your link</li>
                    <li>• They complete their first task</li>
                    <li>• You earn 10% of their task rewards</li>
                    <li>• Both of you get a ₹50 bonus!</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Tiers */}
          <motion.div variants={fadeInRight}>
            <Card className="border border-teal-100/60 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-teal-700">
                  <Gift className="h-5 w-5" />
                  Referral Tiers
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Unlock higher rewards as you refer more friends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div whileHover={hoverScale} className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                    <div>
                      <p className="font-medium text-teal-700">Bronze (0-9 referrals)</p>
                      <p className="text-sm text-slate-600">
                        10% commission
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-teal-200 text-teal-700">Current</Badge>
                  </motion.div>

                  <motion.div whileHover={hoverScale} className="flex items-center justify-between p-3 border border-teal-100 rounded-lg">
                    <div>
                      <p className="font-medium text-teal-700">Silver (10-24 referrals)</p>
                      <p className="text-sm text-slate-600">
                        15% commission
                      </p>
                    </div>
                    <Badge variant="outline" className="border-teal-200 text-teal-700">Locked</Badge>
                  </motion.div>

                  <motion.div whileHover={hoverScale} className="flex items-center justify-between p-3 border border-teal-100 rounded-lg">
                    <div>
                      <p className="font-medium text-teal-700">Gold (25+ referrals)</p>
                      <p className="text-sm text-slate-600">
                        20% commission
                      </p>
                    </div>
                    <Badge variant="outline" className="border-teal-200 text-teal-700">Locked</Badge>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Referrals */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Card className="border border-teal-100/60 bg-white shadow-sm mb-12">
            <CardHeader>
              <CardTitle className="text-teal-700">Recent Referrals</CardTitle>
              <CardDescription className="text-slate-600">
                Track your recent referrals and their activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReferrals.map((referral, index) => (
                  <motion.div
                    key={index}
                    whileHover={hoverScale}
                    className="flex items-center justify-between p-4 border border-teal-100 rounded-lg transition-all hover:bg-teal-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{referral.name}</p>
                        <p className="text-sm text-slate-600">
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
                        className={referral.status === "Active" ? "bg-teal-600 text-white" : "bg-teal-200 text-teal-700"}
                      >
                        {referral.status}
                      </Badge>
                      <p className="font-medium text-right text-slate-900">{referral.earned}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center p-8 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-700">Ready to Start Earning?</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Share your referral link now and start building your passive income
            stream
          </p>
          <Button size="lg" onClick={handleCopyLink} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Share2 className="h-5 w-5 mr-2" />
            Copy Referral Link
          </Button>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}