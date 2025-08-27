"use client";
import { useState, useEffect } from "react";
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
  Ban,
  CheckCircle,
  DollarSign,
  Key,
  Trash2,
  Download,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  Wallet,
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobiles";
import {
  useGetAdminUsersQuery,
  useGetAdminUserDetailsQuery,
  useSuspendUserMutation,
  useReactivateUserMutation,
  useAdjustUserWalletMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
  useBulkSuspendUsersMutation,
  useBulkReactivateUsersMutation,
  useSendUserNotificationMutation,
} from "@/redux/api/api";
import {
  UserDetailsModal,
  SuspendUserModal,
  ReactivateUserModal,
  WalletAdjustModal,
} from "@/components/admin/user-modals";

export default function AdminUsersPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isMobile = useIsMobile();

  // API queries and mutations
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
    role: roleFilter !== "all" ? roleFilter : "",
    status: statusFilter !== "all" ? statusFilter : "",
    kycStatus: kycFilter !== "all" ? kycFilter : "",
  };

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetAdminUsersQuery(queryParams);

  const { data: userDetailsData, isLoading: userDetailsLoading } =
    useGetAdminUserDetailsQuery(selectedUser?.id, {
      skip: !selectedUser?.id,
    });

  const [suspendUser, { isLoading: suspending }] = useSuspendUserMutation();
  const [reactivateUser, { isLoading: reactivating }] =
    useReactivateUserMutation();
  const [adjustWallet, { isLoading: adjustingWallet }] =
    useAdjustUserWalletMutation();
  const [resetPassword, { isLoading: resettingPassword }] =
    useResetUserPasswordMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [bulkSuspend, { isLoading: bulkSuspending }] =
    useBulkSuspendUsersMutation();
  const [bulkReactivate, { isLoading: bulkReactivating }] =
    useBulkReactivateUsersMutation();
  const [sendNotification, { isLoading: sendingNotification }] =
    useSendUserNotificationMutation();

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || {};
  const summary = usersData?.summary || {};

  // Utility functions
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "advertiser":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusBadgeColor = (user) => {
    if (user.isSuspended) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  const getKycBadgeColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user) => user._id)));
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const handleSuspendUser = (user) => {
    setSelectedUser(user);
    setShowSuspendModal(true);
  };

  const handleReactivateUser = (user) => {
    setSelectedUser(user);
    setShowReactivateModal(true);
  };

  const handleWalletAdjust = (user) => {
    setSelectedUser(user);
    setShowWalletModal(true);
  };

  const handleSendNotification = (user) => {
    setSelectedUser(user);
    setShowNotificationModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-teal-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">
                  Error Loading Users
                </h3>
                <p className="text-red-600">
                  {error?.data?.error || "Failed to load user data"}
                </p>
              </div>
              <Button
                onClick={() => refetch()}
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with Statistics */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-900">
              User Management
            </h1>
            <p className="text-teal-600 mt-1">
              Manage all platform users and their permissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-600">Total Users</p>
                  <p className="text-2xl font-bold text-teal-900">
                    {summary.totalUsers?.toLocaleString() || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-teal-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">
                    {summary.activeUsers?.toLocaleString() || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-900">
                    {summary.suspendedUsers?.toLocaleString() || 0}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">KYC Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {summary.pendingKyc?.toLocaleString() || 0}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-teal-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-teal-200 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32 border-teal-200">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="advertiser">Advertiser</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 border-teal-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-full sm:w-32 border-teal-200">
                  <SelectValue placeholder="KYC" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KYC</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="none">Not Started</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm text-teal-700">
                  {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""}{" "}
                  selected
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Bulk suspend logic
                    }}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Ban className="h-3 w-3 mr-1" />
                    Suspend Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Bulk reactivate logic
                    }}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Reactivate Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedUsers(new Set())}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-900">
            Users ({pagination.totalUsers || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-teal-200">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedUsers.size === users.length && users.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user._id}
                    className="border-teal-100 hover:bg-teal-50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user._id)}
                        onCheckedChange={() => handleSelectUser(user._id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="bg-teal-100 text-teal-700">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-teal-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-teal-600">{user.email}</p>
                          <Badge
                            className={getRoleBadgeColor(user.role)}
                            size="sm"
                          >
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.phone && (
                          <div className="flex items-center gap-1 text-sm text-teal-600">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-teal-600">
                          <Calendar className="h-3 w-3" />
                          {user.joinDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user)}>
                        {user.isSuspended ? "Suspended" : "Active"}
                      </Badge>
                      {user.suspendedReason && (
                        <p className="text-xs text-red-600 mt-1">
                          {user.suspendedReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getKycBadgeColor(user.kycStatus)}>
                        {user.kycStatus || "none"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-teal-900">
                          ₹{(user.walletBalance || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-teal-600">
                          Total: ₹{(user.totalEarn || 0).toFixed(2)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">
                          {user.tasksCompleted || 0} tasks
                        </p>
                        <p className="text-sm">
                          {user.totalReferrals || 0} referrals
                        </p>
                        <p className="text-xs text-teal-600">
                          Last: {user.lastActive || "N/A"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {user.isSuspended ? (
                            <DropdownMenuItem
                              onClick={() => handleReactivateUser(user)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleSuspendUser(user)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleWalletAdjust(user)}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Adjust Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSendNotification(user)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Notification
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-teal-200">
              <p className="text-sm text-teal-600">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, pagination.totalUsers)} of{" "}
                {pagination.totalUsers} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrev}
                  className="border-teal-200"
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
                  className="border-teal-200"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <UserDetailsModal
        open={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={userDetailsData?.user}
        loading={userDetailsLoading}
      />

      {/* Action Modals */}
      <SuspendUserModal
        open={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        user={selectedUser}
        onSuspend={suspendUser}
        loading={suspending}
      />

      <ReactivateUserModal
        open={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        user={selectedUser}
        onReactivate={reactivateUser}
        loading={reactivating}
      />

      <WalletAdjustModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        user={selectedUser}
        onAdjust={adjustWallet}
        loading={adjustingWallet}
      />
    </motion.div>
  );
}

// Modal Components would be added here but keeping file under 600 lines
// The modals can be implemented in separate component files for better maintainability
