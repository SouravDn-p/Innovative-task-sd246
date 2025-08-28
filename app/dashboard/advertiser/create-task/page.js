"use client";
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  AlertCircle,
  Wallet,
  CreditCard,
  DollarSign,
  Calculator,
  Info,
  ExternalLink,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function CreateTaskPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    type: "custom",
    description: "",
    proofRequirements: { type: "text", details: "" },
    rateToUser: "",
    limitCount: "",
    startAt: new Date().toISOString().slice(0, 16), // 2025-08-26T15:57
    endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16), // 2025-09-25T15:57
    requireKyc: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userWallet, setUserWallet] = useState({ balance: 0, loading: true });
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load user wallet balance
  useEffect(() => {
    const fetchWalletBalance = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/advertiser/wallet");
          if (response.ok) {
            const data = await response.json();
            setUserWallet({ balance: data.wallet.balance, loading: false });
          } else {
            setUserWallet({ balance: 0, loading: false });
          }
        } catch (error) {
          console.error("Failed to fetch wallet balance:", error);
          setUserWallet({ balance: 0, loading: false });
        }
      }
    };
    fetchWalletBalance();
  }, [session]);

  // Calculate payment breakdown
  const calculatePaymentBreakdown = () => {
    const rateToUser = parseFloat(formData.rateToUser) || 0;
    const limitCount = parseInt(formData.limitCount) || 0;
    const advertiserCost = rateToUser * 1.2; // 20% platform fee
    const totalCost = advertiserCost * limitCount;
    const platformFee = totalCost - rateToUser * limitCount;

    return {
      rateToUser,
      limitCount,
      advertiserCost,
      totalCost,
      platformFee,
      platformFeePercentage: 20,
      hasInsufficientFunds: totalCost > userWallet.balance,
    };
  };

  // Update payment breakdown when form data changes
  useEffect(() => {
    if (formData.rateToUser && formData.limitCount) {
      const breakdown = calculatePaymentBreakdown();
      setPaymentBreakdown(breakdown);
    }
  }, [
    formData.rateToUser,
    formData.limitCount,
    userWallet.balance,
    paymentMethod,
  ]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    else if (formData.title.length > 100)
      newErrors.title = "Title must be 100 characters or less";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    else if (formData.description.length > 1000)
      newErrors.description = "Description must be 1000 characters or less";
    if (!formData.rateToUser || formData.rateToUser <= 0)
      newErrors.rateToUser = "Reward must be a positive number";
    else if (formData.rateToUser > 10000)
      newErrors.rateToUser = "Reward cannot exceed ₹10,000";
    if (!formData.limitCount || formData.limitCount <= 0)
      newErrors.limitCount = "Limit must be a positive number";
    else if (formData.limitCount > 1000)
      newErrors.limitCount = "Limit cannot exceed 1000";
    if (!formData.proofRequirements.details.trim())
      newErrors.proofDetails = "Proof details are required";
    else if (formData.proofRequirements.details.length > 500)
      newErrors.proofDetails = "Proof details must be 500 characters or less";
    if (new Date(formData.startAt) >= new Date(formData.endAt))
      newErrors.dates = "End date must be after start date";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check payment requirements
    const breakdown = calculatePaymentBreakdown();

    // For insufficient funds, allow task creation but defer payment
    const deferPayment =
      paymentMethod === "wallet" && breakdown.hasInsufficientFunds;

    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus(null);

    try {
      const taskData = {
        ...formData,
        paymentMethod,
        payNow: !deferPayment, // Only pay now if funds are sufficient
        requirePayment: true,
        totalCost: breakdown.totalCost,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to create task");
      }

      setSubmitStatus("success");

      // Only update wallet balance if payment was processed immediately
      if (!deferPayment) {
        setUserWallet((prev) => ({
          ...prev,
          balance: prev.balance - breakdown.totalCost,
        }));
      }

      setFormData({
        title: "",
        type: "custom",
        description: "",
        proofRequirements: { type: "text", details: "" },
        rateToUser: "",
        limitCount: "",
        startAt: new Date().toISOString().slice(0, 16),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        requireKyc: true,
      });

      // Show different success messages based on payment status
      if (deferPayment) {
        setSuccessMessage(
          "Task created successfully! Payment will be processed when admin approves the task."
        );
      } else {
        setSuccessMessage("Task created and paid successfully!");
      }

      setTimeout(() => router.push("/dashboard/advertiser"), 3000);
    } catch (err) {
      setSubmitStatus("error");
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading...</span>
      </div>
    );
  }

  if (status !== "authenticated") {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Banner Section */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-center text-white shadow-lg my-12 mx-4"
      >
        <motion.div variants={fadeInUp} className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Create a New Task
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Engage your audience with exciting tasks and reward their efforts.
          </p>
        </motion.div>
      </motion.section>

      {/* Form Section */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="py-12 max-w-2xl mx-auto px-4"
      >
        <motion.form
          onSubmit={handleSubmit}
          variants={fadeInUp}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-teal-100"
        >
          <div>
            <Label htmlFor="title" className="text-teal-800">
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
              className="bg-teal-50 border-teal-200 text-slate-800"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type" className="text-teal-800">
              Task Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="bg-teal-50 border-teal-200 text-slate-800">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="install">Install</SelectItem>
                <SelectItem value="share">Share</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-teal-800">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the task"
              className="bg-teal-50 border-teal-200 text-slate-800"
              maxLength={1000}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label htmlFor="proofType" className="text-teal-800">
              Proof Type
            </Label>
            <Select
              value={formData.proofRequirements.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  proofRequirements: {
                    ...formData.proofRequirements,
                    type: value,
                  },
                })
              }
            >
              <SelectTrigger className="bg-teal-50 border-teal-200 text-slate-800">
                <SelectValue placeholder="Select proof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="proofDetails" className="text-teal-800">
              Proof Details
            </Label>
            <Input
              id="proofDetails"
              value={formData.proofRequirements.details}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proofRequirements: {
                    ...formData.proofRequirements,
                    details: e.target.value,
                  },
                })
              }
              placeholder="Specify proof requirements"
              className="bg-teal-50 border-teal-200 text-slate-800"
              maxLength={500}
            />
            {errors.proofDetails && (
              <p className="text-red-600 text-sm mt-1">{errors.proofDetails}</p>
            )}
          </div>

          <div>
            <Label htmlFor="rateToUser" className="text-teal-800">
              Reward (₹)
            </Label>
            <Input
              id="rateToUser"
              type="number"
              value={formData.rateToUser}
              onChange={(e) =>
                setFormData({ ...formData, rateToUser: e.target.value })
              }
              placeholder="Enter reward amount"
              className="bg-teal-50 border-teal-200 text-slate-800"
              min="0.01"
              step="0.01"
              max="10000"
            />
            {errors.rateToUser && (
              <p className="text-red-600 text-sm mt-1">{errors.rateToUser}</p>
            )}
          </div>

          <div>
            <Label htmlFor="limitCount" className="text-teal-800">
              Completion Limit
            </Label>
            <Input
              id="limitCount"
              type="number"
              value={formData.limitCount}
              onChange={(e) =>
                setFormData({ ...formData, limitCount: e.target.value })
              }
              placeholder="Enter completion limit"
              className="bg-teal-50 border-teal-200 text-slate-800"
              min="1"
              step="1"
              max="1000"
            />
            {errors.limitCount && (
              <p className="text-red-600 text-sm mt-1">{errors.limitCount}</p>
            )}
          </div>

          <div>
            <Label htmlFor="startAt" className="text-teal-800">
              Start Date & Time
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={formData.startAt}
              onChange={(e) =>
                setFormData({ ...formData, startAt: e.target.value })
              }
              className="bg-teal-50 border-teal-200 text-slate-800"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <Label htmlFor="endAt" className="text-teal-800">
              End Date & Time
            </Label>
            <Input
              id="endAt"
              type="datetime-local"
              value={formData.endAt}
              onChange={(e) =>
                setFormData({ ...formData, endAt: e.target.value })
              }
              className="bg-teal-50 border-teal-200 text-slate-800"
              min={formData.startAt}
            />
            {errors.dates && (
              <p className="text-red-600 text-sm mt-1">{errors.dates}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requireKyc"
              checked={formData.requireKyc}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requireKyc: checked })
              }
            />
            <Label htmlFor="requireKyc" className="text-teal-800">
              Require KYC
            </Label>
          </div>

          {/* Payment Section */}
          {paymentBreakdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t border-teal-200 pt-6"
            >
              <h3 className="text-lg font-semibold text-teal-800 flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Payment Details
              </h3>

              {/* Wallet Balance */}
              <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Wallet className="h-5 w-5 text-teal-600 mr-2" />
                      <span className="text-teal-800 font-medium">
                        Wallet Balance
                      </span>
                    </div>
                    <div className="text-right">
                      {userWallet.loading ? (
                        <div className="h-4 w-16 bg-teal-200 animate-pulse rounded" />
                      ) : (
                        <span className="text-lg font-bold text-teal-700">
                          ₹
                          {userWallet.balance.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Breakdown */}
              <Card className="border-teal-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-800 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Cost Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Reward per user:</span>
                    <span className="font-medium">
                      ₹{paymentBreakdown.rateToUser.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Number of users:</span>
                    <span className="font-medium">
                      {paymentBreakdown.limitCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">
                      ₹
                      {(
                        paymentBreakdown.rateToUser *
                        paymentBreakdown.limitCount
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      Platform fee ({paymentBreakdown.platformFeePercentage}%)
                      <Info className="h-3 w-3 ml-1 text-slate-400" />
                    </span>
                    <span className="font-medium">
                      ₹{paymentBreakdown.platformFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-teal-800">Total Cost:</span>
                      <span className="text-teal-700">
                        ₹{paymentBreakdown.totalCost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Balance Status */}
                  <div className="mt-3 p-3 rounded-lg border">
                    {paymentBreakdown.hasInsufficientFunds ? (
                      <div className="flex items-center text-orange-600">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">
                            Insufficient Balance - Payment Deferred
                          </p>
                          <p className="text-sm">
                            Task will be created, but payment (₹
                            {(
                              paymentBreakdown.totalCost - userWallet.balance
                            ).toFixed(2)}{" "}
                            more needed) will be processed when admin approves.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <div>
                          <p className="font-medium">Sufficient Balance</p>
                          <p className="text-sm">
                            Remaining after payment: ₹
                            {(
                              userWallet.balance - paymentBreakdown.totalCost
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card className="border-teal-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-teal-800">
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to pay for this task
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === "wallet"
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setPaymentMethod("wallet")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Wallet className="h-5 w-5 text-teal-600 mr-3" />
                          <div>
                            <p className="font-medium text-slate-800">
                              Wallet Payment
                            </p>
                            <p className="text-sm text-slate-600">
                              Pay from your wallet balance
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            paymentMethod === "wallet" ? "default" : "secondary"
                          }
                        >
                          {paymentMethod === "wallet"
                            ? "Selected"
                            : "Available"}
                        </Badge>
                      </div>
                    </div>

                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all opacity-50 ${
                        paymentMethod === "external"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200"
                      }`}
                      onClick={() => setPaymentMethod("external")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium text-slate-800">
                              External Payment
                            </p>
                            <p className="text-sm text-slate-600">
                              Pay with card or UPI (Coming Soon)
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Coming Soon</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-green-600 p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              {successMessage}
            </motion.div>
          )}
          {submitStatus === "success" && !successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-green-600"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Task created successfully! Redirecting...
            </motion.div>
          )}
          {submitStatus === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-red-600"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              {errors.submit || "Failed to create task"}
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-white border-t-transparent mr-2" />
                Creating...
              </span>
            ) : paymentBreakdown ? (
              paymentBreakdown.hasInsufficientFunds ? (
                <span className="flex items-center justify-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Create Task (Pay on Approval)
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Wallet className="h-5 w-5 mr-2" />
                  Create Task & Pay ₹{paymentBreakdown.totalCost.toFixed(2)}
                </span>
              )
            ) : (
              "Create Task"
            )}
          </Button>
        </motion.form>
      </motion.section>
    </div>
  );
}
