"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Share2,
  Gift,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  UserPlus,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Plus,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  useGetUserByEmailQuery,
  useSetReferralIdMutation,
  useAddReferralMutation,
} from "@/redux/api/api";

import Swal from "sweetalert2";

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

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

export default function UserReferralsPage() {
  const [copied, setCopied] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralError, setReferralError] = useState("");
  const { data: session, status } = useSession();
  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserByEmailQuery(session?.user?.email, {
    skip: !session?.user?.email,
  });
  const [setReferralId] = useSetReferralIdMutation();
  const [addReferral] = useAddReferralMutation();

  // Check if user already has a referral ID
  const hasReferralId = userData?.user?.referrerId;

  // Use user's own ID as their referral ID for sharing with others
  const userReferralId = userData?.user?._id;
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    // Set referral link only on client side
    if (userReferralId && typeof window !== "undefined") {
      setReferralLink(
        `${window.location.origin}/register?referrerId=${userReferralId}`
      );
    }
  }, [userReferralId]);

  useEffect(() => {
    // Check for referral ID in URL params (only on client side)
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get("ref");
      if (refParam && !hasReferralId) {
        setReferralInput(refParam);
        setShowReferralModal(true);
      }
    }
  }, [hasReferralId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateReferralId = async () => {
    const confirm = await Swal.fire({
      title: "Create Referral ID?",
      text: "This will set your referral ID to start inviting friends.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, create ID!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await setReferralId().unwrap();
        Swal.fire({
          icon: "success",
          title: "Referral ID Created!",
          text: `Your referral ID is now set. Share your link to start earning!`,
        });
        refetch();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            err?.data?.message ||
            "Failed to create referral ID. Please try again.",
        });
      }
    }
  };

  const handleAddReferral = async () => {
    if (!referralInput) {
      setReferralError("Please enter a referral ID");
      return;
    }

    try {
      const newUser = {
        name: session?.user?.name,
        email: session?.user?.email,
      };

      console.log("Attempting to add referral with ID:", referralInput);

      const res = await addReferral({
        referrerId: referralInput,
        newUser,
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "Referral Added!",
        text: "You've been successfully added as a referral.",
      });

      setShowReferralModal(false);
      setReferralInput("");
      setReferralError("");
      refetch();
    } catch (err) {
      console.error("Add referral error:", err);
      let errorMessage =
        "Failed to add referral. Please check the ID and try again.";

      // More specific error handling
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.status === 404) {
        errorMessage = "Referrer not found. Please check the referral ID.";
      } else if (err?.status === 400) {
        if (err?.data?.message?.includes("already has a referrer")) {
          errorMessage = "You have already been referred by someone else.";
        } else if (err?.data?.message?.includes("Invalid referrer ID format")) {
          errorMessage =
            "Invalid referral ID format. Please check the ID and try again.";
        } else {
          errorMessage = "Invalid request. Please check the referral ID.";
        }
      } else if (err?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      setReferralError(errorMessage);
    }
  };

  const referralStats = [
    {
      label: "Total Referrals",
      value: userData?.user?.totalReferralsCount || "0",
      icon: Users,
      color: "text-teal-600",
    },
    {
      label: "Active This Week",
      value: userData?.user?.dailyReferralsCount || "0",
      icon: TrendingUp,
      color: "text-teal-500",
    },
    {
      label: "Total Earned",
      value: `₹${userData?.user?.totalEarn || 0}`,
      icon: DollarSign,
      color: "text-teal-700",
    },
    {
      label: "Pending Rewards",
      value: `₹${userData?.user?.walletBalance || 0}`,
      icon: Gift,
      color: "text-teal-400",
    },
  ];

  // Format recent referrals data for display
  const recentReferrals = (userData?.user?.Recent_Referrals || []).map(
    (referral) => ({
      ...referral,
      joinDate:
        referral.joinDate || referral.createdAt || new Date().toISOString(),
      referralDate:
        referral.referralDate || referral.joinDate || new Date().toISOString(),
      status: referral.status || "Active",
      kycStatus: referral.kycStatus || "Not Verified",
      earned: referral.earned || "₹0",
      verifiedDate:
        referral.kycStatus === "Verified" ? referral.referralDate : null,
    })
  );

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your referrals.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] absolute inset-0 bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px]" />
        <div className="absolute -top-32 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-200/40 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-300/50 blur-3xl animate-pulse-slow" />
      </div>

      {/* Referral Input Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Referral ID</DialogTitle>
            <DialogDescription>
              You were referred by a friend. Enter their referral ID below to
              join their network.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="referralId">Referral ID</Label>
              <Input
                id="referralId"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="Enter referral ID"
                className="border-teal-200 focus:border-teal-500"
              />
              {referralError && (
                <p className="text-sm text-red-500">{referralError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddReferral}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                Submit
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowReferralModal(false)}
                className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Section with Inspiring Quote */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-center text-white shadow-lg mb-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_50%_-10%,white,transparent)]"
          />
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="relative space-y-4"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
              Together We Achieve More
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              - Helen Keller | Invite your friends to TaskEarn Pro and build a
              community of success.
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
            Share TaskEarn Pro with your friends. When they complete KYC
            verification, you earn ₹49!
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
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
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
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="border-teal-200 text-teal-700 hover:bg-teal-100"
                  >
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
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-teal-700">
                    Your Referral ID: {userReferralId}
                  </h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Share this ID with friends who want to join your network.
                  </p>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Friend signs up using your link</li>
                    <li>• They complete KYC verification (₹99)</li>
                    <li>• You instantly earn ₹49!</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Tiers or Add Referral ID */}
          <motion.div variants={fadeInRight}>
            {hasReferralId ? (
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
                    <motion.div
                      whileHover={hoverScale}
                      className="flex items-center justify-between p-3 bg-teal-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-teal-700">
                          Bronze (0-9 referrals)
                        </p>
                        <p className="text-sm text-slate-600">
                          ₹49 per referral
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-teal-200 text-teal-700"
                      >
                        Current
                      </Badge>
                    </motion.div>

                    <motion.div
                      whileHover={hoverScale}
                      className="flex items-center justify-between p-3 border border-teal-100 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-teal-700">
                          Silver (10-24 referrals)
                        </p>
                        <p className="text-sm text-slate-600">
                          ₹59 per referral
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-teal-200 text-teal-700"
                      >
                        Locked
                      </Badge>
                    </motion.div>

                    <motion.div
                      whileHover={hoverScale}
                      className="flex items-center justify-between p-3 border border-teal-100 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-teal-700">
                          Gold (25+ referrals)
                        </p>
                        <p className="text-sm text-slate-600">
                          ₹69 per referral
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-teal-200 text-teal-700"
                      >
                        Locked
                      </Badge>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-teal-100/60 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-700">
                    <UserPlus className="h-5 w-5" />
                    Add Referral ID
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Enter a referral ID to join a friend&#39;s network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      You haven&#39;t been referred by anyone yet. If you have a
                      referral ID from a friend, add it below!
                    </p>
                    <Button
                      onClick={() => setShowReferralModal(true)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Referral ID
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                {recentReferrals.length > 0 ? (
                  recentReferrals.map((referral, index) => (
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
                          <p className="font-medium text-slate-900">
                            {referral.name}
                          </p>
                          <div className="flex flex-col gap-1 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Joined{" "}
                                {new Date(
                                  referral.joinDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {referral.verifiedDate && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>
                                  Verified{" "}
                                  {new Date(
                                    referral.verifiedDate
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <Badge
                            variant={
                              referral.status === "Active"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              referral.status === "Active"
                                ? "bg-teal-600 text-white mb-1"
                                : "bg-teal-200 text-teal-700 mb-1"
                            }
                          >
                            {referral.status}
                          </Badge>
                          <Badge
                            variant={
                              referral.kycStatus === "Verified"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              referral.kycStatus === "Verified"
                                ? "bg-blue-600 text-white"
                                : "bg-amber-200 text-amber-700"
                            }
                          >
                            {referral.kycStatus === "Verified" ? (
                              <div className="flex items-center gap-1">
                                <ShieldCheck className="h-3 w-3" />
                                <span>KYC Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" />
                                <span>Not Verified</span>
                              </div>
                            )}
                          </Badge>
                        </div>
                        <p className="font-medium text-right text-slate-900">
                          {referral.earned}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">
                    No recent referrals yet. Start sharing your referral link!
                  </p>
                )}
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-700">
            Ready to Start Earning?
          </h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Share your referral link now and start building your passive income
            stream
          </p>
          <Button
            size="lg"
            onClick={handleCopyLink}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Copy Referral Link
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
