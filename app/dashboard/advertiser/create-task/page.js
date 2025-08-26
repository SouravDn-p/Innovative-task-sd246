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
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

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

    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus(null);

    try {
      const taskData = {
        ...formData,
        rateToUser: parseFloat(formData.rateToUser),
        advertiserCost: parseFloat(formData.rateToUser) * 1.2,
        limitCount: parseInt(formData.limitCount),
        completedCount: 0,
        status:
          session?.user?.role?.toLowerCase() === "admin"
            ? "approved"
            : "pending",
        createdBy: session?.user?.role?.toLowerCase() || "advertiser",
        gmail: session?.user?.email || "unknown@gmail.com",
        name: session?.user?.name || "Unknown",
        createdAt: new Date().toISOString(), // 2025-08-26T15:57:00.000+06:00
        updatedAt: new Date().toISOString(), // 2025-08-26T15:57:00.000+06:00
        paymentDone: false,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create task");
      }

      setSubmitStatus("success");
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
      setTimeout(() => router.push("/dashboard/tasks"), 2000);
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

          {submitStatus === "success" && (
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
            ) : (
              "Create Task"
            )}
          </Button>
        </motion.form>
      </motion.section>
    </div>
  );
}
