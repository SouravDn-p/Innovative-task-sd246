"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Wallet,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Swal from "sweetalert2";

export function WalletRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });
  const [approvalData, setApprovalData] = useState({
    amount: "",
    notes: "",
  });

  // Fetch wallet requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/wallet-requests");
      const data = await response.json();

      if (response.ok) {
        setRequests(data.requests);
      } else {
        throw new Error(data.error || "Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching wallet requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wallet requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle approval
  const handleApprove = async (requestId) => {
    if (!approvalData.amount || parseFloat(approvalData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
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
        fetchRequests(); // Refresh requests
        setSelectedRequest(null);
        setApprovalData({ amount: "", notes: "" });
      } else {
        throw new Error(data.error || "Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve request",
        variant: "destructive",
      });
    }
  };

  // Handle rejection
  const handleReject = async (requestId) => {
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
        fetchRequests(); // Refresh requests
      } else {
        throw new Error(data.error || "Failed to reject request");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject request",
        variant: "destructive",
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  // Filter requests based on filters
  const filteredRequests = requests.filter((request) => {
    if (filters.status !== "all" && request.status !== filters.status) {
      return false;
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.userName.toLowerCase().includes(searchLower) ||
        request.userEmail.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Funding Requests
          </CardTitle>
          <CardDescription>
            Review and manage user wallet funding requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Requests Table */}
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
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No wallet requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.userEmail}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            {request.userType}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ₹{request.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-xs truncate">
                          {request.description}
                        </p>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
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
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              {selectedRequest && (
                                <>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Wallet Request Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>User</Label>
                                        <p className="font-medium">
                                          {selectedRequest.userName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedRequest.userEmail}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>User Type</Label>
                                        <Badge
                                          variant="secondary"
                                          className="mt-1 capitalize"
                                        >
                                          {selectedRequest.userType}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>Amount Requested</Label>
                                        <p className="font-medium">
                                          ₹{selectedRequest.amount.toFixed(2)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div className="mt-1">
                                          {getStatusBadge(
                                            selectedRequest.status
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <Label>Description</Label>
                                      <p className="mt-1">
                                        {selectedRequest.description}
                                      </p>
                                    </div>

                                    <div>
                                      <Label>Proof of Payment</Label>
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
                                        <h3 className="font-medium">
                                          Process Request
                                        </h3>
                                        <div className="space-y-2">
                                          <Label htmlFor="approvalAmount">
                                            Amount to Add
                                          </Label>
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
                                          <Label htmlFor="approvalNotes">
                                            Notes (Optional)
                                          </Label>
                                          <Textarea
                                            id="approvalNotes"
                                            value={approvalData.notes}
                                            onChange={(e) =>
                                              setApprovalData({
                                                ...approvalData,
                                                notes: e.target.value,
                                              })
                                            }
                                            placeholder="Add any notes for the user..."
                                          />
                                        </div>

                                        <div className="flex gap-2 justify-end">
                                          <Button
                                            variant="destructive"
                                            onClick={() =>
                                              handleReject(selectedRequest._id)
                                            }
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              handleApprove(selectedRequest._id)
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
                                          <Label>Admin Notes</Label>
                                          <p className="mt-1 text-sm">
                                            {selectedRequest.adminNotes}
                                          </p>
                                        </div>
                                      )}

                                    {selectedRequest.status === "rejected" &&
                                      selectedRequest.rejectionReason && (
                                        <div className="pt-4 border-t">
                                          <Label>Rejection Reason</Label>
                                          <p className="mt-1 text-sm text-red-600">
                                            {selectedRequest.rejectionReason}
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </div>
  );
}
