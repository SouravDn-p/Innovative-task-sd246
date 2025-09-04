"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Target,
  Users,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useGetAdminAdvertiserRequestsQuery,
  useGetAdminActiveAdvertisersQuery,
  useUpdateAdminAdvertiserRequestMutation,
} from "@/redux/api/api";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAdvertisersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const [updateRequest, { isLoading: updatingRequest }] =
    useUpdateAdminAdvertiserRequestMutation();

  // API queries
  const requestsQueryParams = {
    page: currentPage,
    limit: pageSize,
    status: statusFilter !== "all" ? statusFilter : "",
    search: searchTerm,
  };

  const advertisersQueryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  };

  const {
    data: requestsData,
    isLoading: requestsLoading,
    error: requestsError,
    refetch: refetchRequests,
  } = useGetAdminAdvertiserRequestsQuery(requestsQueryParams, {
    skip:
      activeTab !== "requests" || !session || session.user?.role !== "admin",
  });

  const {
    data: advertisersData,
    isLoading: advertisersLoading,
    error: advertisersError,
    refetch: refetchAdvertisers,
  } = useGetAdminActiveAdvertisersQuery(advertisersQueryParams, {
    skip: activeTab !== "active" || !session || session.user?.role !== "admin",
  });

  const requests = requestsData?.requests || [];
  const advertisers = advertisersData?.advertisers || [];
  const requestsPagination = requestsData?.pagination || {};
  const advertisersPagination = advertisersData?.pagination || {};

  // Redirect if not admin
  if (status === "loading") return null;
  if (!session || session.user?.role !== "admin") {
    router.push("/unauthorized");
    return null;
  }

  const handleApproveRequest = async (requestId) => {
    try {
      await updateRequest({
        requestId,
        action: "approve",
        reviewNotes,
      }).unwrap();

      toast({
        title: "Success",
        description: "Advertiser request approved successfully",
      });

      setShowApproveModal(false);
      setReviewNotes("");
      refetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.error || "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await updateRequest({
        requestId,
        action: "reject",
        reviewNotes: rejectionReason,
      }).unwrap();

      toast({
        title: "Success",
        description: "Advertiser request rejected successfully",
      });

      setShowRejectModal(false);
      setRejectionReason("");
      refetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.error || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">
            Advertiser Management
          </h1>
          <p className="text-teal-600">
            Manage advertiser requests and active advertisers
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-teal-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab("requests");
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-teal-500 hover:text-teal-700 hover:border-teal-300"
            }`}
          >
            New Requests
            {requestsData?.pagination?.totalRequests > 0 && (
              <Badge className="ml-2 bg-teal-100 text-teal-800">
                {requestsData.pagination.totalRequests}
              </Badge>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab("active");
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "active"
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-teal-500 hover:text-teal-700 hover:border-teal-300"
            }`}
          >
            Active Advertisers
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 h-4 w-4" />
              <Input
                placeholder="Search by company name, contact person, or email..."
                className="pl-10 border-teal-200 focus:border-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === "requests" && (
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-teal-200 focus:border-teal-500">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (activeTab === "requests") {
                  refetchRequests();
                } else {
                  refetchAdvertisers();
                }
              }}
              disabled={requestsLoading || advertisersLoading}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              {requestsLoading || advertisersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "requests" ? (
        <motion.div variants={itemVariants}>
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-800">
                New Advertiser Requests
              </CardTitle>
              <CardDescription>
                Review and approve/reject pending advertiser requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="ml-2 text-teal-800">
                    Loading requests...
                  </span>
                </div>
              ) : requestsError ? (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Error loading requests:{" "}
                  {requestsError?.data?.error || "Unknown error"}
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-teal-600">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No advertiser requests found</p>
                  <p className="text-sm">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {request.companyName}
                                </p>
                                <p className="text-sm text-teal-600">
                                  {request.businessType}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {request.contactPerson}
                                </p>
                                <p className="text-sm text-teal-600">
                                  {request.contactEmail}
                                </p>
                                <p className="text-sm text-teal-600">
                                  {request.contactPhone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {request.user?.name}
                                </p>
                                <p className="text-sm text-teal-600">
                                  {request.user?.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4 text-teal-600" />
                                {new Date(
                                  request.submittedAt
                                ).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={getStatusBadgeColor(request.status)}
                              >
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {request.status === "pending" ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setShowApproveModal(true);
                                      }}
                                      className="bg-green-600 hover:bg-green-700 h-8"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        setSelectedRequest(request);
                                        setShowRejectModal(true);
                                      }}
                                      className="h-8"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-teal-200 text-teal-700 hover:bg-teal-50 h-8"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {(requestsPagination.hasPrev ||
                    requestsPagination.hasNext) && (
                    <div className="flex items-center justify-between py-4">
                      <div className="text-sm text-teal-600">
                        Showing{" "}
                        {(requestsPagination.page - 1) *
                          requestsPagination.limit +
                          1}{" "}
                        to{" "}
                        {Math.min(
                          requestsPagination.page * requestsPagination.limit,
                          requestsPagination.totalRequests
                        )}{" "}
                        of {requestsPagination.totalRequests} requests
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={!requestsPagination.hasPrev}
                          variant="outline"
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={!requestsPagination.hasNext}
                          variant="outline"
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border-teal-200">
            <CardHeader>
              <CardTitle className="text-teal-800">
                Active Advertisers
              </CardTitle>
              <CardDescription>
                View performance metrics for all approved advertisers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {advertisersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="ml-2 text-teal-800">
                    Loading advertisers...
                  </span>
                </div>
              ) : advertisersError ? (
                <div className="flex items-center justify-center py-8 text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Error loading advertisers:{" "}
                  {advertisersError?.data?.error || "Unknown error"}
                </div>
              ) : advertisers.length === 0 ? (
                <div className="text-center py-8 text-teal-600">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active advertisers found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Tasks</TableHead>
                          <TableHead>Expenses</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Approved</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {advertisers.map((advertiser) => (
                          <TableRow key={advertiser._id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {advertiser.companyName}
                                </p>
                                <p className="text-sm text-teal-600">
                                  {advertiser.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{advertiser.name}</p>
                                <p className="text-sm text-teal-600">
                                  {advertiser.phone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="font-medium">
                                    {advertiser.totalTasks}
                                  </p>
                                  <p className="text-xs text-teal-600">Total</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-blue-600">
                                    {advertiser.activeTasks}
                                  </p>
                                  <p className="text-xs text-teal-600">
                                    Active
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="font-medium text-green-600">
                                    {advertiser.completedTasks}
                                  </p>
                                  <p className="text-xs text-teal-600">
                                    Completed
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-teal-600" />
                                <span className="font-medium">
                                  ₹{advertiser.totalExpense.toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-teal-200 rounded-full h-2">
                                  <div
                                    className="bg-teal-600 h-2 rounded-full"
                                    style={{
                                      width: `${advertiser.performanceScore}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">
                                  {advertiser.performanceScore}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-4 w-4 text-teal-600" />
                                {advertiser.approvedAt
                                  ? new Date(
                                      advertiser.approvedAt
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {(advertisersPagination.hasPrev ||
                    advertisersPagination.hasNext) && (
                    <div className="flex items-center justify-between py-4">
                      <div className="text-sm text-teal-600">
                        Showing{" "}
                        {(advertisersPagination.page - 1) *
                          advertisersPagination.limit +
                          1}{" "}
                        to{" "}
                        {Math.min(
                          advertisersPagination.page *
                            advertisersPagination.limit,
                          advertisersPagination.totalAdvertisers
                        )}{" "}
                        of {advertisersPagination.totalAdvertisers} advertisers
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={!advertisersPagination.hasPrev}
                          variant="outline"
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          Previous
                        </Button>
                        <Button
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          disabled={!advertisersPagination.hasNext}
                          variant="outline"
                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-teal-800">
                Approve Advertiser Request
              </CardTitle>
              <CardDescription>
                Approve {selectedRequest.companyName} as an advertiser
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-teal-700">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full mt-1 border border-teal-200 rounded-md p-2 focus:border-teal-500 focus:ring-teal-500"
                  rows={3}
                  placeholder="Add any notes for this approval..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApproveModal(false)}
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApproveRequest(selectedRequest._id)}
                  disabled={updatingRequest}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updatingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Approve Request"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-teal-800">
                Reject Advertiser Request
              </CardTitle>
              <CardDescription>
                Reject {selectedRequest.companyName}'s advertiser request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-teal-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full mt-1 border border-teal-200 rounded-md p-2 focus:border-teal-500 focus:ring-teal-500"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRejectRequest(selectedRequest._id)}
                  disabled={updatingRequest || !rejectionReason.trim()}
                >
                  {updatingRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Reject Request"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
