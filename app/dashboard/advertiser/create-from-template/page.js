"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, AlertCircle } from "lucide-react";
import { useGetAdvertiserTaskTemplatesQuery } from "@/redux/api/api";
import { useSession } from "next-auth/react";
import TemplateCard from "@/components/advertiser/TemplateCard";

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

export default function CreateFromTemplatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch templates
  const {
    data: templatesData,
    isLoading: templatesLoading,
    error: templatesError,
    refetch,
  } = useGetAdvertiserTaskTemplatesQuery();

  // Filter templates
  const templates = (templatesData?.templates || []).filter(
    (template) =>
      (template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      (filterType === "all" || template.type === filterType)
  );

  // Task type options
  const taskTypes = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Video (Watch/Upload)" },
    { value: "install", label: "Install (App/Software)" },
    { value: "share", label: "Share (Social Media)" },
    { value: "review", label: "Review (Product/Service)" },
    { value: "social", label: "Social (Follow/Like)" },
    { value: "custom", label: "Custom (Other Tasks)" },
  ];

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

  // Handle refetch on error
  if (templatesError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Error Loading Templates
          </h2>
          <p className="text-gray-600 mb-4">
            {templatesError?.data?.error ||
              "Failed to load templates. Please try again."}
          </p>
          <Button onClick={refetch} className="bg-teal-600 hover:bg-teal-700">
            Retry
          </Button>
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Create Task from Template
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Select a template to create your task
          </p>
        </motion.div>
      </motion.section>

      {/* Templates Section */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="py-8 max-w-6xl mx-auto px-4"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-2">
            Available Templates
          </h2>
          <p className="text-slate-600">
            Select a template to customize your task
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {templatesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-teal-700">Loading templates...</p>
          </div>
        ) : templatesError ? (
          <div className="text-center py-8 text-red-600">
            Error loading templates:{" "}
            {templatesError?.data?.error || "Unknown error"}
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {templatesData?.templates?.length === 0
                  ? "No templates available at the moment."
                  : "No templates match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <TemplateCard
                key={template._id}
                template={template}
                onCreateTask={(templateId) =>
                  router.push(
                    `/dashboard/advertiser/create-from-template/${templateId}`
                  )
                }
              />
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
