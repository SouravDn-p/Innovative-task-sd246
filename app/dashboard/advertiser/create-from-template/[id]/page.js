"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertCircle,
  Wallet,
  DollarSign,
  Calculator,
  Info,
  FileText,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import PaymentBreakdown from "@/components/advertiser/PaymentBreakdown";
import {
  safeNumber,
  formatCurrencyINR,
  sanitizeInput,
  validateEmail,
  isValidObjectId,
} from "@/lib/utils";

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

export default function CreateTaskFromTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [formData, setFormData] = useState({
    rateToUser: "",
    limitCount: "",
    startAt: new Date().toISOString().slice(0, 16),
    endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16),
    requireKyc: true,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [userWallet, setUserWallet] = useState({ balance: 0, loading: true });
  const [paymentBreakdown, setPaymentBreakdown] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch selected template details
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId || status !== "authenticated") return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/advertiser/task-templates/${templateId}`
        );
        if (!response.ok) throw new Error("Failed to fetch template");

        const data = await response.json();
        setSelectedTemplate(data.template);

        // Set default values based on template
        setFormData((prev) => ({
          ...prev,
          rateToUser: data.template.minRateToUser?.toString() || "",
          limitCount: data.template.minLimitCount?.toString() || "",
        }));
      } catch (error) {
        console.error("Error fetching template:", error);
        setErrors({ fetch: error.message || "Failed to load template data" });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId, status]);

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
    if (!selectedTemplate) return null;

    const rateToUser = parseFloat(formData.rateToUser) || 0;
    const limitCount = parseInt(formData.limitCount) || 0;
    const advertiserCost = parseFloat((rateToUser * 1.2).toFixed(2)); // 20% platform fee
    const totalCost = parseFloat((advertiserCost * limitCount).toFixed(2));
    const platformFee = parseFloat(
      (totalCost - rateToUser * limitCount).toFixed(2)
    );

    return {
      rateToUser: parseFloat(rateToUser.toFixed(2)),
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
    if (formData.rateToUser && formData.limitCount && selectedTemplate) {
      const breakdown = calculatePaymentBreakdown();
      setPaymentBreakdown(breakdown);
    }
  }, [
    formData.rateToUser,
    formData.limitCount,
    userWallet.balance,
    selectedTemplate,
  ]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rateToUser || formData.rateToUser <= 0) {
      newErrors.rateToUser = "Reward must be a positive number";
    } else if (selectedTemplate) {
      const rate = parseFloat(formData.rateToUser);
      if (rate < selectedTemplate.minRateToUser) {
        newErrors.rateToUser = `Reward cannot be less than ₹${selectedTemplate.minRateToUser}`;
      }
      if (rate > selectedTemplate.maxRateToUser) {
        newErrors.rateToUser = `Reward cannot exceed ₹${selectedTemplate.maxRateToUser}`;
      }
    }

    if (!formData.limitCount || formData.limitCount <= 0) {
      newErrors.limitCount = "Limit must be a positive number";
    } else if (selectedTemplate) {
      const limit = parseInt(formData.limitCount);
      if (limit < selectedTemplate.minLimitCount) {
        newErrors.limitCount = `Limit cannot be less than ${selectedTemplate.minLimitCount}`;
      }
      if (limit > selectedTemplate.maxLimitCount) {
        newErrors.limitCount = `Limit cannot exceed ${selectedTemplate.maxLimitCount}`;
      }
    }

    if (new Date(formData.startAt) >= new Date(formData.endAt)) {
      newErrors.dates = "End date must be after start date";
    }

    // Validate that end date is not more than 1 year in the future
    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (new Date(formData.endAt) > maxEndDate) {
      newErrors.dates = "End date cannot be more than 1 year in the future";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus(null);

    try {
      // Prepare task data based on template
      const taskData = {
        title: selectedTemplate.title,
        type: selectedTemplate.type,
        description: selectedTemplate.description,
        proofRequirements: selectedTemplate.proofRequirements,
        rateToUser: parseFloat(formData.rateToUser),
        limitCount: parseInt(formData.limitCount),
        startAt: formData.startAt,
        endAt: formData.endAt,
        requireKyc: formData.requireKyc,
        templateId: templateId,
        status: "pending", // Default to pending for admin approval
        createdBy: "advertiser",
        paymentDone: false,
        // Add payment processing options
        payNow: false, // Defer payment to approval stage
        requirePayment: true,
        paymentMethod: "wallet",
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
      setSuccessMessage(
        "Task created successfully! Awaiting admin approval. Payment will be processed once approved."
      );

      // Reset form
      setFormData({
        rateToUser: "",
        limitCount: "",
        startAt: new Date().toISOString().slice(0, 16),
        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        requireKyc: true,
      });

      // Reset payment breakdown
      setPaymentBreakdown(null);

      // Redirect after a delay
      setTimeout(() => router.push("/dashboard/advertiser"), 5000);
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
    router.push("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading template...</span>
      </div>
    );
  }

  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Template Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested template could not be loaded.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() =>
                router.push("/dashboard/advertiser/create-from-template")
              }
            >
              Back to Templates
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
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
          <Button
            variant="ghost"
            className="absolute top-4 left-4 text-white hover:bg-white/20 hidden sm:flex"
            onClick={() =>
              router.push("/dashboard/advertiser/create-from-template")
            }
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Templates
          </Button>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Create Task from Template
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Customize your task within the template constraints
          </p>
        </motion.div>
      </motion.section>

      {/* Template Details Section */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="py-8 max-w-4xl mx-auto px-4"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-2">
            Template Details
          </h2>
          <p className="text-slate-600">
            Review the template information before creating your task
          </p>
        </div>

        {/* Template Info Card */}
        <Card className="border-teal-200 mb-8">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-teal-800 flex items-center">
                  {selectedTemplate.title}
                  <Badge
                    variant="secondary"
                    className="ml-3 bg-teal-100 text-teal-800 border-0 capitalize"
                  >
                    {selectedTemplate.type}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-slate-600 font-medium mb-1">Reward Range</p>
                <p className="font-bold text-teal-800">
                  ₹{selectedTemplate.minRateToUser} - ₹
                  {selectedTemplate.maxRateToUser}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-slate-600 font-medium mb-1">Limit Range</p>
                <p className="font-bold text-teal-800">
                  {selectedTemplate.minLimitCount} -{" "}
                  {selectedTemplate.maxLimitCount}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-slate-600 font-medium mb-1">Proof Type</p>
                <p className="font-bold capitalize text-teal-800">
                  {selectedTemplate.proofRequirements?.type || "Not specified"}
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <p className="text-slate-600 font-medium mb-1">Proof Details</p>
                <p className="font-bold text-teal-800 text-sm">
                  {selectedTemplate.proofRequirements?.details ||
                    "Not specified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Creation Form */}
        <motion.form
          onSubmit={handleSubmit}
          variants={fadeInUp}
          className="space-y-6 bg-white p-6 rounded-lg shadow-md border border-teal-100"
        >
          <h3 className="text-xl font-bold text-teal-800 mb-4">
            Create Your Task
          </h3>

          <div>
            <Label htmlFor="rateToUser" className="text-teal-800">
              Reward per User (₹) *
            </Label>
            <Input
              id="rateToUser"
              type="number"
              value={formData.rateToUser}
              onChange={(e) =>
                setFormData({ ...formData, rateToUser: e.target.value })
              }
              placeholder={`Enter reward amount (₹${selectedTemplate?.minRateToUser} - ₹${selectedTemplate?.maxRateToUser})`}
              className="bg-teal-50 border-teal-200 text-slate-800"
              min={selectedTemplate?.minRateToUser}
              max={selectedTemplate?.maxRateToUser}
              step="0.01"
            />
            {errors.rateToUser && (
              <p className="text-red-600 text-sm mt-1">{errors.rateToUser}</p>
            )}
          </div>

          <div>
            <Label htmlFor="limitCount" className="text-teal-800">
              Completion Limit *
            </Label>
            <Input
              id="limitCount"
              type="number"
              value={formData.limitCount}
              onChange={(e) =>
                setFormData({ ...formData, limitCount: e.target.value })
              }
              placeholder={`Enter completion limit (${selectedTemplate?.minLimitCount} - ${selectedTemplate?.maxLimitCount})`}
              className="bg-teal-50 border-teal-200 text-slate-800"
              min={selectedTemplate?.minLimitCount}
              max={selectedTemplate?.maxLimitCount}
              step="1"
            />
            {errors.limitCount && (
              <p className="text-red-600 text-sm mt-1">{errors.limitCount}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
          {errors.dates && (
            <p className="text-red-600 text-sm">{errors.dates}</p>
          )}

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
          <PaymentBreakdown
            paymentBreakdown={paymentBreakdown}
            userWallet={userWallet}
          />

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start text-green-600 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{successMessage}</p>
                <p className="text-sm mt-1">
                  You can view your pending tasks in the dashboard. The task
                  will be visible to users once approved by an admin.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => router.push("/dashboard/advertiser")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Reset form for creating another task
                      setSuccessMessage(null);
                      setSubmitStatus(null);
                      setFormData({
                        rateToUser:
                          selectedTemplate.minRateToUser?.toString() || "",
                        limitCount:
                          selectedTemplate.minLimitCount?.toString() || "",
                        startAt: new Date().toISOString().slice(0, 16),
                        endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .slice(0, 16),
                        requireKyc: true,
                      });
                    }}
                  >
                    Create Another
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          {submitStatus === "success" && !successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center text-green-600"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Task created successfully! Redirecting to dashboard...
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

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white order-first sm:order-last"
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
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push("/dashboard/advertiser/create-from-template")
              }
              className="flex-1 border-teal-600 text-teal-600 hover:bg-teal-50 order-last sm:order-first"
            >
              Back to Templates
            </Button>
          </div>
        </motion.form>
      </motion.section>
    </div>
  );
}
