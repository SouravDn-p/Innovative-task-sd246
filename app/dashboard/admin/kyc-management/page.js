"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  X,
  XCircle,
  Clock,
  Download,
  Users,
  Calendar,
  Phone,
  Mail,
  Shield,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  AlertTriangle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  User,
  CreditCard,
  UserCheck,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobiles";
import {
  useGetAdminKYCApplicationsQuery,
  useGetAdminKYCApplicationDetailsQuery,
  useApproveKYCApplicationMutation,
  useUpdateKYCApplicationMutation,
} from "@/redux/api/api";
import { AdminKYCDetails } from "@/components/kyc/admin-kyc-details";
import { useToast } from "@/hooks/use-toast";

export default function AdminKYCManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedApplications, setSelectedApplications] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isMobile = useIsMobile();

  // API queries and mutations
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : "",
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  };

  const {
    data: kycData,
    isLoading,
    error,
    refetch,
  } = useGetAdminKYCApplicationsQuery(queryParams);

  const { data: applicationDetails, isLoading: applicationDetailsLoading } =
    useGetAdminKYCApplicationDetailsQuery(selectedApplication?._id, {
      skip: !selectedApplication?._id,
    });

  const [approveKYC, { isLoading: approving }] =
    useApproveKYCApplicationMutation();
  const [updateKYC, { isLoading: updating }] =
    useUpdateKYCApplicationMutation();

  const applications = kycData?.applications || [];
  const pagination = kycData?.pagination || {};
  const statistics = kycData?.statistics || {};

  // Utility functions
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getPaymentBadgeColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "not_paid":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectApplication = (applicationId) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(applicationId)) {
      newSelected.delete(applicationId);
    } else {
      newSelected.add(applicationId);
    }
    setSelectedApplications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedApplications.size === applications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(applications.map((app) => app._id)));
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const handleApproveApplication = async (applicationId, notes) => {
    try {
      await approveKYC({
        applicationId,
        action: "approve",
        notes,
      }).unwrap();

      toast({
        title: "KYC Approved",
        description: "KYC application has been approved successfully.",
      });

      setShowApplicationDetails(false);
      setReviewNotes("");
      refetch();
    } catch (error) {
      console.error("Failed to approve KYC:", error);
      toast({
        title: "Approval Failed",
        description:
          error?.data?.message || "Failed to approve KYC application.",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (
    applicationId,
    rejectionReason,
    notes
  ) => {
    try {
      await approveKYC({
        applicationId,
        action: "reject",
        rejectionReason,
        notes,
      }).unwrap();

      toast({
        title: "KYC Rejected",
        description: "KYC application has been rejected.",
      });

      setShowApplicationDetails(false);
      setRejectionReason("");
      setReviewNotes("");
      refetch();
    } catch (error) {
      console.error("Failed to reject KYC:", error);
      toast({
        title: "Rejection Failed",
        description:
          error?.data?.message || "Failed to reject KYC application.",
        variant: "destructive",
      });
    }
  };

  // Original approval function for the existing modal
  const handleApproveApplicationOriginal = async () => {
    if (!selectedApplication) return;

    try {
      await approveKYC({
        applicationId: selectedApplication._id,
        action: "approve",
        notes: reviewNotes,
      }).unwrap();

      setShowApprovalModal(false);
      setShowApplicationDetails(false);
      setReviewNotes("");
      refetch();
      toast({
        title: "KYC Approved",
        description: "KYC application has been approved successfully.",
      });
    } catch (error) {
      console.error("Failed to approve KYC:", error);
      toast({
        title: "Approval Failed",
        description:
          error?.data?.message || "Failed to approve KYC application.",
        variant: "destructive",
      });
    }
  };

  // Original rejection function for the existing modal
  const handleRejectApplicationOriginal = async () => {
    if (!selectedApplication || !rejectionReason) return;

    try {
      await approveKYC({
        applicationId: selectedApplication._id,
        action: "reject",
        rejectionReason,
        notes: reviewNotes,
      }).unwrap();

      setShowRejectModal(false);
      setShowApplicationDetails(false);
      setRejectionReason("");
      setReviewNotes("");
      refetch();
      toast({
        title: "KYC Rejected",
        description: "KYC application has been rejected.",
      });
    } catch (error) {
      console.error("Failed to reject KYC:", error);
      toast({
        title: "Rejection Failed",
        description:
          error?.data?.message || "Failed to reject KYC application.",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setPaymentFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-900 mb-2">
              Error Loading KYC Applications
            </h2>
            <p className="text-sm sm:text-base text-red-600 mb-4">
              {error?.data?.message || "Failed to load KYC applications"}
            </p>
            <Button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-900">
              KYC Management
            </h1>
            <p className="text-sm sm:text-base text-teal-600 mt-1">
              {isMobile
                ? "Manage KYC applications"
                : "Review and manage all user KYC verification applications"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 flex-1 sm:flex-initial"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {isMobile ? "Export" : "Export CSV"}
            </Button>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-teal-200 text-teal-700 hover:bg-teal-50 flex-1 sm:flex-initial"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {isMobile ? "Refresh" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="border-teal-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-teal-600 truncate">
                    Total Applications
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-teal-900">
                    {statistics.totalApplications || 0}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-teal-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-yellow-600 truncate">
                    Pending Review
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                    {statistics.pendingApplications || 0}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-green-600 truncate">
                    Approved
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-green-900">
                    {statistics.approvedApplications || 0}
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-red-600 truncate">
                    Rejected
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-red-900">
                    {statistics.rejectedApplications || 0}
                  </p>
                </div>
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-blue-600 truncate">
                    Payment Complete
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-900">
                    {statistics.paidApplications || 0}
                  </p>
                </div>
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-teal-50 border-teal-200 text-sm"
                />
              </div>
              {!isMobile && (
                <>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-teal-200 text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={paymentFilter}
                    onValueChange={setPaymentFilter}
                  >
                    <SelectTrigger className="w-40 border-teal-200 text-sm">
                      <SelectValue placeholder="Payment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="not_paid">Not Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>

            {/* Mobile Filters */}
            {isMobile && (
              <div className="grid grid-cols-2 gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-teal-200 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="border-teal-200 text-sm">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payment</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="not_paid">Not Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <Label htmlFor="dateFrom" className="text-xs text-teal-700">
                  From Date
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-teal-50 border-teal-200 text-sm"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="dateTo" className="text-xs text-teal-700">
                  To Date
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-teal-50 border-teal-200 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full sm:w-auto border-teal-200 text-teal-700 hover:bg-teal-50 text-sm"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-teal-200">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-sm sm:text-base md:text-lg text-teal-900">
            KYC Applications ({pagination.totalApplications || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-teal-700">Loading KYC applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <>
              {isMobile ? (
                // Mobile Card View
                <div className="space-y-3 p-3">
                  {applications.map((application) => (
                    <Card key={application._id} className="border-teal-100">
                      <CardContent className="p-3">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                  {application.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1 break-words">
                                <p className="text-sm font-medium text-slate-900">
                                  {application.userName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {application.email}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={getStatusBadgeColor(
                                application.kycStatus
                              )}
                            >
                              {application.kycStatus}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>
                              Payment:{" "}
                              {application.paymentStatus === "paid"
                                ? "Paid"
                                : "Not Paid"}
                            </span>
                            <span>Priority: {application.priority}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Submitted: {formatDate(application.submittedAt)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              className="flex-1"
                            >
                              View Details
                            </Button>
                            {application.kycStatus === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 flex-1"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowApprovalModal(true);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 flex-1"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowRejectModal(true);
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop Table View
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-teal-100 text-teal-700">
                                {application.userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900">
                                {application.userName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {application.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(
                              application.kycStatus
                            )}
                          >
                            {application.kycStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPaymentBadgeColor(
                              application.paymentStatus
                            )}
                          >
                            {application.paymentStatus === "paid"
                              ? "Paid"
                              : "Not Paid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getPriorityBadgeColor(
                              application.priority
                            )}
                          >
                            {application.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(application.submittedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(application)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/dashboard/admin/kyc-management/${application._id}`
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Page
                            </Button>
                            {application.kycStatus === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowApprovalModal(true);
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setShowRejectModal(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4 pb-4">
                  <div className="text-sm text-teal-600">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(
                      currentPage * pageSize,
                      pagination.totalApplications
                    )}{" "}
                    of {pagination.totalApplications} applications
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-teal-700">
                      Page {currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(pagination.totalPages, prev + 1)
                        )
                      }
                      disabled={!pagination.hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-teal-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-teal-900 mb-2">
                No KYC Applications Found
              </h3>
              <p className="text-teal-600">
                No KYC applications match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Modal - Mobile Responsive */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Approve KYC Application
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve the KYC application for{" "}
              <span className="font-semibold">
                {selectedApplication?.userName}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalNotes">Review Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes about this approval..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveApplicationOriginal}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              {approving ? "Approving..." : "Approve KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal - Mobile Responsive */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-md sm:max-w-lg lg:max-w-xl mx-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Reject KYC Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting the KYC application for{" "}
              <span className="font-semibold">
                {selectedApplication?.userName}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Select
                value={rejectionReason}
                onValueChange={setRejectionReason}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select rejection reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invalid_documents">
                    Invalid Documents
                  </SelectItem>
                  <SelectItem value="poor_quality">
                    Poor Image Quality
                  </SelectItem>
                  <SelectItem value="information_mismatch">
                    Information Mismatch
                  </SelectItem>
                  <SelectItem value="incomplete_documents">
                    Incomplete Documents
                  </SelectItem>
                  <SelectItem value="suspicious_activity">
                    Suspicious Activity
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rejectionNotes">
                Additional Notes (Optional)
              </Label>
              <Textarea
                id="rejectionNotes"
                placeholder="Provide additional details about the rejection..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectApplicationOriginal}
              disabled={approving || !rejectionReason}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {approving ? "Rejecting..." : "Reject KYC"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Details Modal - Mobile Responsive */}
      <Dialog
        open={showApplicationDetails}
        onOpenChange={setShowApplicationDetails}
      >
        <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              KYC Application Details
            </DialogTitle>
            <DialogDescription>
              Application ID: {selectedApplication?._id}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Name
                      </Label>
                      <p className="font-medium">
                        {selectedApplication.userName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Email
                      </Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {selectedApplication.email}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Phone
                      </Label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {selectedApplication.phone}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Status
                      </Label>
                      <Badge
                        className={getStatusBadgeColor(
                          selectedApplication.kycStatus
                        )}
                      >
                        {selectedApplication.kycStatus.replace("_", " ")}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Submitted At
                      </Label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {formatDate(selectedApplication.submittedAt)}
                        </p>
                      </div>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Reviewed At
                        </Label>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {formatDate(selectedApplication.reviewedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedApplication.documents || {}).map(
                      ([docType, doc]) => (
                        <div
                          key={docType}
                          className="border rounded-lg p-4 flex flex-col gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {docType === "bankStatement" ? (
                                <FileIcon className="h-5 w-5" />
                              ) : (
                                <ImageIcon className="h-5 w-5" />
                              )}
                              <h4 className="font-medium capitalize">
                                {docType.replace(/([A-Z])/g, " $1")}
                              </h4>
                            </div>
                            {doc.uploaded || doc.url ? (
                              <Badge className="bg-green-100 text-green-800">
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Uploaded</Badge>
                            )}
                          </div>

                          {doc.uploaded || doc.url ? (
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (doc.url) {
                                    if (doc.url.endsWith(".pdf")) {
                                      window.open(doc.url, "_blank");
                                    } else {
                                      setPreviewDocument({
                                        type: docType,
                                        ...doc,
                                      });
                                      setPreviewOpen(true);
                                    }
                                  }
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                {doc.url.endsWith(".pdf") ? "View" : "Preview"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(doc.url, "_blank")}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No document uploaded
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status */}
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        selectedApplication.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedApplication.paymentStatus.replace("_", " ")}
                    </Badge>
                    <span className="text-sm">KYC Fee: ₹99</span>
                  </div>
                </CardContent>
              </Card>

              {/* Review Notes */}
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Review Notes</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Add any notes about this KYC application..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationDetails(false)}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>

                {selectedApplication.kycStatus === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                      onClick={() => {
                        setShowApplicationDetails(false);
                        setSelectedApplication(selectedApplication);
                        setShowRejectModal(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      onClick={() => {
                        handleApproveApplication(
                          selectedApplication._id,
                          reviewNotes
                        );
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl sm:max-w-5xl lg:max-w-6xl max-h-[90vh] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {previewDocument?.type?.replace(/([A-Z])/g, " $1")}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-[70vh] bg-gray-50 rounded-lg">
            {previewDocument?.url ? (
              previewDocument.url.endsWith(".pdf") ? (
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full rounded-lg"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewDocument.url}
                  alt="Document Preview"
                  className="max-h-full max-w-full object-contain"
                />
              )
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>No preview available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
