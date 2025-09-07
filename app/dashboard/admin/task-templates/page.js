"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import {
  useGetAdminTaskTemplatesQuery,
  useCreateAdminTaskTemplateMutation,
  useUpdateAdminTaskTemplateMutation,
  useDeleteAdminTaskTemplateMutation,
} from "@/redux/api/api";

export default function AdminTaskTemplatesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "custom",
    description: "",
    proofRequirements: { type: "text", details: "" },
    minRateToUser: "",
    maxRateToUser: "",
    minLimitCount: "",
    maxLimitCount: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    data: templatesData,
    isLoading,
    error,
    refetch,
  } = useGetAdminTaskTemplatesQuery();

  const [createTemplate] = useCreateAdminTaskTemplateMutation();
  const [updateTemplate] = useUpdateAdminTaskTemplateMutation();
  const [deleteTemplate] = useDeleteAdminTaskTemplateMutation();

  const templates = templatesData?.templates || [];

  // Filter and search templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || template.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && template.isActive) ||
      (filterStatus === "inactive" && !template.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.minRateToUser || formData.minRateToUser <= 0)
      newErrors.minRateToUser = "Minimum rate must be positive";
    if (!formData.maxRateToUser || formData.maxRateToUser <= 0)
      newErrors.maxRateToUser = "Maximum rate must be positive";
    if (parseFloat(formData.minRateToUser) > parseFloat(formData.maxRateToUser))
      newErrors.rateRange = "Min rate cannot be greater than max rate";
    if (!formData.minLimitCount || formData.minLimitCount <= 0)
      newErrors.minLimitCount = "Minimum limit must be positive";
    if (!formData.maxLimitCount || formData.maxLimitCount <= 0)
      newErrors.maxLimitCount = "Maximum limit must be positive";
    if (parseInt(formData.minLimitCount) > parseInt(formData.maxLimitCount))
      newErrors.limitRange = "Min limit cannot be greater than max limit";

    return newErrors;
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const templateData = {
        ...formData,
        minRateToUser: parseFloat(formData.minRateToUser),
        maxRateToUser: parseFloat(formData.maxRateToUser),
        minLimitCount: parseInt(formData.minLimitCount),
        maxLimitCount: parseInt(formData.maxLimitCount),
        proofRequirements: {
          type: formData.proofRequirements.type,
          details: formData.proofRequirements.details,
        },
      };

      await createTemplate(templateData).unwrap();
      setSuccessMessage("Template created successfully!");
      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (err) {
      setErrorMessage(err?.data?.error || "Failed to create template");
    }
  };

  const handleUpdateTemplate = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const templateData = {
        ...formData,
        minRateToUser: parseFloat(formData.minRateToUser),
        maxRateToUser: parseFloat(formData.maxRateToUser),
        minLimitCount: parseInt(formData.minLimitCount),
        maxLimitCount: parseInt(formData.maxLimitCount),
        proofRequirements: {
          type: formData.proofRequirements.type,
          details: formData.proofRequirements.details,
        },
      };

      await updateTemplate({
        templateId: editingTemplate._id,
        templateData,
      }).unwrap();

      setSuccessMessage("Template updated successfully!");
      setShowEditModal(false);
      setEditingTemplate(null);
      resetForm();
      refetch();
    } catch (err) {
      setErrorMessage(err?.data?.error || "Failed to update template");
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await deleteTemplate(templateId).unwrap();
      setSuccessMessage("Template deleted successfully!");
      refetch();
    } catch (err) {
      setErrorMessage(err?.data?.error || "Failed to delete template");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "custom",
      description: "",
      proofRequirements: { type: "text", details: "" },
      minRateToUser: "",
      maxRateToUser: "",
      minLimitCount: "",
      maxLimitCount: "",
      isActive: true,
    });
    setErrors({});
  };

  const openEditModal = (template) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      type: template.type,
      description: template.description,
      proofRequirements: template.proofRequirements || {
        type: "text",
        details: "",
      },
      minRateToUser: template.minRateToUser?.toString() || "",
      maxRateToUser: template.maxRateToUser?.toString() || "",
      minLimitCount: template.minLimitCount?.toString() || "",
      maxLimitCount: template.maxLimitCount?.toString() || "",
      isActive: template.isActive !== undefined ? template.isActive : true,
    });
    setShowEditModal(true);
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  // Task type options
  const taskTypes = [
    { value: "video", label: "Video (Watch/Upload)" },
    { value: "install", label: "Install (App/Software)" },
    { value: "share", label: "Share (Social Media)" },
    { value: "review", label: "Review (Product/Service)" },
    { value: "social", label: "Social (Follow/Like)" },
    { value: "custom", label: "Custom (Other Tasks)" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Task Templates</h1>
          <p className="text-teal-600">Manage task templates for advertisers</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Task Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <Label htmlFor="title">Template Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter template title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Task Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
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

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter template description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minRateToUser">Min Reward (₹) *</Label>
                  <Input
                    id="minRateToUser"
                    type="number"
                    value={formData.minRateToUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minRateToUser: e.target.value,
                      })
                    }
                    placeholder="Minimum reward per user"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.minRateToUser && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.minRateToUser}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxRateToUser">Max Reward (₹) *</Label>
                  <Input
                    id="maxRateToUser"
                    type="number"
                    value={formData.maxRateToUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRateToUser: e.target.value,
                      })
                    }
                    placeholder="Maximum reward per user"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.maxRateToUser && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.maxRateToUser}
                    </p>
                  )}
                </div>
              </div>
              {errors.rateRange && (
                <p className="text-red-600 text-sm">{errors.rateRange}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minLimitCount">Min Limit *</Label>
                  <Input
                    id="minLimitCount"
                    type="number"
                    value={formData.minLimitCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minLimitCount: e.target.value,
                      })
                    }
                    placeholder="Minimum task limit"
                    min="1"
                    step="1"
                  />
                  {errors.minLimitCount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.minLimitCount}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxLimitCount">Max Limit *</Label>
                  <Input
                    id="maxLimitCount"
                    type="number"
                    value={formData.maxLimitCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxLimitCount: e.target.value,
                      })
                    }
                    placeholder="Maximum task limit"
                    min="1"
                    step="1"
                  />
                  {errors.maxLimitCount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.maxLimitCount}
                    </p>
                  )}
                </div>
              </div>
              {errors.limitRange && (
                <p className="text-red-600 text-sm">{errors.limitRange}</p>
              )}

              <div>
                <Label htmlFor="proofType">Proof Type</Label>
                <Select
                  value={formData.proofRequirements?.type || "text"}
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
                  <SelectTrigger>
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
                <Label htmlFor="proofDetails">Proof Details</Label>
                <Textarea
                  id="proofDetails"
                  value={formData.proofRequirements?.details || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proofRequirements: {
                        ...formData.proofRequirements,
                        details: e.target.value,
                      },
                    })
                  }
                  placeholder="Specify proof requirements in detail"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Template</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  Create Template
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(successMessage || errorMessage) && (
        <div
          className={`p-4 rounded-lg ${
            successMessage
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {successMessage ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            {successMessage || errorMessage}
          </div>
        </div>
      )}

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
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          Error loading templates: {error?.data?.error || "Unknown error"}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {templates.length === 0
                ? "No templates found. Create your first template to get started."
                : "No templates match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div
              key={template._id}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg font-bold">
                      {template.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditModal(template)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTemplate(template._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <CardHeader className="pb-3 pt-4">
                  <CardDescription className="text-sm text-slate-600 line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="capitalize border-teal-300 text-teal-700 bg-teal-50"
                    >
                      {template.type}
                    </Badge>
                    <Badge
                      variant={template.isActive ? "default" : "secondary"}
                      className={
                        template.isActive
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-sm bg-teal-50 p-4 rounded-lg border border-teal-100">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">
                        Reward Range:
                      </span>
                      <span className="font-bold text-teal-800">
                        ₹{template.minRateToUser} - ₹{template.maxRateToUser}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">
                        Limit Range:
                      </span>
                      <span className="font-bold text-teal-800">
                        {template.minLimitCount} - {template.maxLimitCount}
                      </span>
                    </div>
                    {template.proofRequirements?.type && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">
                          Proof Type:
                        </span>
                        <span className="font-bold capitalize text-teal-800">
                          {template.proofRequirements.type}
                        </span>
                      </div>
                    )}
                    {template.proofRequirements?.details && (
                      <div className="pt-2 border-t border-teal-100">
                        <span className="text-slate-600 font-medium block mb-1">
                          Proof Details:
                        </span>
                        <p className="text-teal-800 text-sm">
                          {template.proofRequirements.details}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Template Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Template Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter template title"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-type">Task Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
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

              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter template description"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-minRateToUser">Min Reward (₹) *</Label>
                  <Input
                    id="edit-minRateToUser"
                    type="number"
                    value={formData.minRateToUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minRateToUser: e.target.value,
                      })
                    }
                    placeholder="Minimum reward per user"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.minRateToUser && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.minRateToUser}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-maxRateToUser">Max Reward (₹) *</Label>
                  <Input
                    id="edit-maxRateToUser"
                    type="number"
                    value={formData.maxRateToUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxRateToUser: e.target.value,
                      })
                    }
                    placeholder="Maximum reward per user"
                    min="0.01"
                    step="0.01"
                  />
                  {errors.maxRateToUser && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.maxRateToUser}
                    </p>
                  )}
                </div>
              </div>
              {errors.rateRange && (
                <p className="text-red-600 text-sm">{errors.rateRange}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-minLimitCount">Min Limit *</Label>
                  <Input
                    id="edit-minLimitCount"
                    type="number"
                    value={formData.minLimitCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minLimitCount: e.target.value,
                      })
                    }
                    placeholder="Minimum task limit"
                    min="1"
                    step="1"
                  />
                  {errors.minLimitCount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.minLimitCount}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="edit-maxLimitCount">Max Limit *</Label>
                  <Input
                    id="edit-maxLimitCount"
                    type="number"
                    value={formData.maxLimitCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxLimitCount: e.target.value,
                      })
                    }
                    placeholder="Maximum task limit"
                    min="1"
                    step="1"
                  />
                  {errors.maxLimitCount && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.maxLimitCount}
                    </p>
                  )}
                </div>
              </div>
              {errors.limitRange && (
                <p className="text-red-600 text-sm">{errors.limitRange}</p>
              )}

              <div>
                <Label htmlFor="edit-proofType">Proof Type</Label>
                <Select
                  value={formData.proofRequirements?.type || "text"}
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
                  <SelectTrigger>
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
                <Label htmlFor="edit-proofDetails">Proof Details</Label>
                <Textarea
                  id="edit-proofDetails"
                  value={formData.proofRequirements?.details || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proofRequirements: {
                        ...formData.proofRequirements,
                        details: e.target.value,
                      },
                    })
                  }
                  placeholder="Specify proof requirements in detail"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-isActive">Active Template</Label>
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                  Update Template
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
