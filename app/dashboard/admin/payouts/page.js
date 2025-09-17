"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  Loader2,
  Wallet,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import Swal from "sweetalert2";

export default function AdminPayoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [walletRequests, setWalletRequests] = useState([]); // New state for wallet requests
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [netBalance, setNetBalance] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [revenue, setRevenue] = useState({
    kycRevenue: 0,
    reactivationRevenue: 0,
    taskPlatformFees: 0,
    totalRevenue: 0,
  });
  const [periodRevenue, setPeriodRevenue] = useState({
    kycRevenue: 0,
    reactivationRevenue: 0,
    taskPlatformFees: 0,
    totalRevenue: 0,
  });
  const [revenuePeriod, setRevenuePeriod] = useState("all");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Wallet request states
  const [walletRequestsLoading, setWalletRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalData, setApprovalData] = useState({
    amount: "",
    notes: "",
  });

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        type: filterType,
        category: filterCategory,
        search: searchTerm,
        dateFrom,
        dateTo,
        revenuePeriod,
      });

      const response = await fetch(`/api/admin/payouts?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const data = await response.json();

      setTransactions(data.transactions);
      setPagination(data.pagination);
      setNetBalance(data.netBalance);
      setTotalCredits(data.totalWebsiteCredits);
      setTotalDebits(data.totalWebsiteDebits);
      setRevenue(data.revenue);
      setPeriodRevenue(data.periodRevenue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet requests
  const fetchWalletRequests = async () => {
    try {
      setWalletRequestsLoading(true);
      const response = await fetch("/api/admin/wallet-requests");
      const data = await response.json();

      if (response.ok) {
        setWalletRequests(data.requests);
      } else {
        throw new Error(data.error || "Failed to fetch wallet requests");
      }
    } catch (err) {
      console.error("Error fetching wallet requests:", err);
    } finally {
      setWalletRequestsLoading(false);
    }
  };

  // Handle approval of wallet request
  const handleApproveRequest = async (requestId) => {
    if (!approvalData.amount || parseFloat(approvalData.amount) <= 0) {
      Swal.fire({
        title: "Invalid Amount",
        text: "Please enter a valid amount",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/wallet-requests/${requestId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(approvalData.amount),
            notes: approvalData.notes,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Request Approved",
          text: "Wallet funding request has been approved and funds added to user's wallet.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchWalletRequests(); // Refresh requests
        setSelectedRequest(null);
        setApprovalData({ amount: "", notes: "" });
      } else {
        throw new Error(data.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to approve request",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Handle rejection of wallet request
  const handleRejectRequest = async (requestId) => {
    const { value: notes } = await Swal.fire({
      title: "Reject Request",
      text: "Please provide a reason for rejecting this request",
      input: "textarea",
      inputPlaceholder: "Enter rejection reason...",
      showCancelButton: true,
      confirmButtonText: "Reject",
      cancelButtonText: "Cancel",
    });

    if (notes === undefined) return; // User cancelled

    try {
      const response = await fetch(
        `/api/admin/wallet-requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Request Rejected",
          text: "Wallet funding request has been rejected.",
          icon: "success",
          confirmButtonText: "OK",
        });
        fetchWalletRequests(); // Refresh requests
      } else {
        throw new Error(data.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to reject request",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // Get status badge for wallet requests
  const getRequestStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchTransactions();
      fetchWalletRequests(); // Fetch wallet requests on initial load
    }
  }, [
    session,
    filterType,
    filterCategory,
    searchTerm,
    dateFrom,
    dateTo,
    revenuePeriod,
  ]);

  // Handle pagination
  const handlePageChange = (newPage) => {
    fetchTransactions(newPage);
  };

  // Handle export
  const handleExport = () => {
    // In a real implementation, this would export the data
    alert("Export functionality would be implemented here");
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    // Handle invalid or null dates
    if (
      !dateString ||
      dateString === "Invalid Date" ||
      isNaN(new Date(dateString))
    ) {
      return "Invalid Date";
    }

    try {
      return format(new Date(dateString), "dd MMM yyyy, h:mm a");
    } catch (error) {
      console.error(
        "Date formatting error:",
        error,
        "Date string:",
        dateString
      );
      return "Invalid Date";
    }
  };

  // Get transaction type display
  const getTransactionTypeDisplay = (type) => {
    switch (type) {
      case "advertiser_payment":
        return (
          <Badge className="bg-green-100 text-green-800">
            Advertiser Payment
          </Badge>
        );
      case "user_payout":
        return <Badge className="bg-red-100 text-red-800">User Payout</Badge>;
      case "user_reward":
        return (
          <Badge className="bg-orange-100 text-orange-800">User Reward</Badge>
        );
      case "kyc_payment":
        return <Badge className="bg-blue-100 text-blue-800">KYC Payment</Badge>;
      case "account_reactivation":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Account Reactivation
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type, websiteCredit, websiteDebit) => {
    // Based on whether it's a credit or debit to the website
    const isCreditToWebsite = websiteCredit > 0;
    const isDebitFromWebsite = websiteDebit > 0;

    if (isCreditToWebsite) {
      return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
    } else if (isDebitFromWebsite) {
      return <ArrowUpRight className="h-4 w-4 text-red-500" />;
    } else {
      return <div className="h-4 w-4" />; // Empty placeholder
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading transactions: {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => fetchTransactions()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">
            Payout Management
          </h1>
          <p className="text-teal-600">
            View all financial transactions and platform balance
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Total Website Credits
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totalCredits)}
            </div>
            <p className="text-xs text-green-600">
              All credits to website balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">
              Total Website Debits
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(totalDebits)}
            </div>
            <p className="text-xs text-red-600">
              All debits from website balance
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Net Website Balance
            </CardTitle>
            <div className="h-4 w-4 text-blue-600">
              {netBalance >= 0 ? (
                <ArrowDownLeft className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netBalance >= 0 ? "text-green-900" : "text-red-900"
              }`}
            >
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-blue-600">Current platform balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatCurrency(revenue.totalRevenue)}
            </div>
            <p className="text-xs text-purple-600">Company earnings</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">
              KYC Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">
              {formatCurrency(revenue.kycRevenue)}
            </div>
            <p className="text-xs text-indigo-600">
              Rs.50 per KYC (or full amount if no referrer)
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Reactivation Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {formatCurrency(revenue.reactivationRevenue)}
            </div>
            <p className="text-xs text-amber-600">Full amount</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-cyan-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-800">
              Task Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">
              {formatCurrency(revenue.taskPlatformFees)}
            </div>
            <p className="text-xs text-cyan-600">20% of task payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Period Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-200 bg-violet-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-800">
              {revenuePeriod === "monthly"
                ? "Monthly"
                : revenuePeriod === "weekly"
                ? "Weekly"
                : "Period"}{" "}
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-900">
              {formatCurrency(revenue.totalRevenue)}
            </div>
            <div className="flex items-center mt-2">
              <Select value={revenuePeriod} onValueChange={setRevenuePeriod}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-fuchsia-200 bg-fuchsia-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-fuchsia-800">
              Period KYC Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-fuchsia-900">
              {formatCurrency(periodRevenue.kycRevenue)}
            </div>
            <p className="text-xs text-fuchsia-600">
              Rs.50 per KYC (or full amount if no referrer)
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Period Reactivation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(periodRevenue.reactivationRevenue)}
            </div>
            <p className="text-xs text-orange-600">Full amount</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Period Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">
              {formatCurrency(periodRevenue.taskPlatformFees)}
            </div>
            <p className="text-xs text-emerald-600">20% of task payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Requests Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Wallet className="h-5 w-5" />
                Wallet Funding Requests
              </CardTitle>
              <CardDescription>
                Review and manage user wallet funding requests
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWalletRequests}
              disabled={walletRequestsLoading}
            >
              {walletRequestsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletRequestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading wallet requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : walletRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-gray-500"
                    >
                      No wallet requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  walletRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.userName}</div>
                          <div className="text-sm text-gray-500">
                            {request.userEmail}
                          </div>
                          <Badge
                            variant="secondary"
                            className="mt-1 capitalize"
                          >
                            {request.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{request.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {request.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRequestStatusBadge(request.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {request.status === "pending" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({
                                    amount: request.amount.toString(),
                                    notes: "",
                                  });
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovalData({
                                    amount: request.amount.toString(),
                                    notes: "",
                                  });
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRejectRequest(request._id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setApprovalData({
                                  amount: request.amount.toString(),
                                  notes:
                                    request.adminNotes ||
                                    request.rejectionReason ||
                                    "",
                                });
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Wallet Request Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User
                    </label>
                    <p className="font-medium">{selectedRequest.userName}</p>
                    <p className="text-sm text-gray-500">
                      {selectedRequest.userEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      User Type
                    </label>
                    <Badge variant="secondary" className="capitalize">
                      {selectedRequest.userType}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Amount Requested
                    </label>
                    <p className="font-medium">
                      ₹{selectedRequest.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1">
                      {getRequestStatusBadge(selectedRequest.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Description
                  </label>
                  <p className="mt-1">{selectedRequest.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Proof of Payment
                  </label>
                  <div className="mt-2 border rounded-lg p-2">
                    <img
                      src={selectedRequest.proofImageUrl}
                      alt="Proof"
                      className="w-full h-auto max-h-64 object-contain rounded"
                    />
                  </div>
                </div>

                {selectedRequest.status === "pending" && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-medium">Process Request</h4>
                    <div className="space-y-2">
                      <label
                        htmlFor="approvalAmount"
                        className="text-sm font-medium"
                      >
                        Amount to Add
                      </label>
                      <Input
                        id="approvalAmount"
                        type="number"
                        value={approvalData.amount}
                        onChange={(e) =>
                          setApprovalData({
                            ...approvalData,
                            amount: e.target.value,
                          })
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="approvalNotes"
                        className="text-sm font-medium"
                      >
                        Notes (Optional)
                      </label>
                      <textarea
                        id="approvalNotes"
                        value={approvalData.notes}
                        onChange={(e) =>
                          setApprovalData({
                            ...approvalData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Add any notes for the user..."
                        className="w-full p-2 border rounded-md"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectRequest(selectedRequest._id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() =>
                          handleApproveRequest(selectedRequest._id)
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Add Funds
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRequest.status === "approved" &&
                  selectedRequest.adminNotes && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-gray-500">
                        Admin Notes
                      </label>
                      <p className="mt-1 text-sm">
                        {selectedRequest.adminNotes}
                      </p>
                    </div>
                  )}

                {selectedRequest.status === "rejected" &&
                  selectedRequest.rejectionReason && (
                    <div className="pt-4 border-t">
                      <label className="text-sm font-medium text-gray-500">
                        Rejection Reason
                      </label>
                      <p className="mt-1 text-sm text-red-600">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-teal-800">Filter Transactions</CardTitle>
          <CardDescription>
            Search and filter transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Transaction Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="advertiser_payment">
                  Advertiser Payment
                </SelectItem>
                <SelectItem value="user_payout">User Payout</SelectItem>
                <SelectItem value="user_reward">User Reward</SelectItem>
                <SelectItem value="kyc_payment">KYC Payment</SelectItem>
                <SelectItem value="account_reactivation">
                  Account Reactivation
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setSearchTerm("");
                setFilterType("all");
                setFilterCategory("all");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-teal-800">
                Transaction History
              </CardTitle>
              <CardDescription>
                {pagination.totalTransactions} transactions found
              </CardDescription>
            </div>
            {loading && (
              <div className="flex items-center text-teal-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Website Impact</TableHead>
                  <TableHead>Referrer Cut</TableHead>
                  <TableHead>User/Advertiser</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionTypeDisplay(transaction.type)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(transaction.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTransactionIcon(
                            transaction.type,
                            transaction.websiteCredit,
                            transaction.websiteDebit
                          )}
                          <span className="ml-2">
                            {transaction.websiteCredit > 0 ? (
                              <span>
                                {formatCurrency(transaction.websiteCredit)}{" "}
                                credit
                              </span>
                            ) : transaction.websiteDebit > 0 ? (
                              <span>
                                {formatCurrency(transaction.websiteDebit)} debit
                              </span>
                            ) : (
                              <span>-</span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.type === "kyc_payment" ? (
                          <div className="font-medium text-blue-600">
                            {formatCurrency(transaction.referrerCut)}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {transaction.userEmail ||
                            transaction.adminEmail ||
                            "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {transaction.createdAt
                            ? formatDate(transaction.createdAt)
                            : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                          {transaction.reference}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
