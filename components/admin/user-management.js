"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Eye, Ban, CheckCircle, Calendar, Wallet } from "lucide-react"

export function UserManagement({ userRole, section }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)

  const users = [
    {
      id: "USR001",
      name: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      joinDate: "2024-01-15",
      status: "active",
      kycStatus: "verified",
      walletBalance: 2450.5,
      totalEarnings: 12450.75,
      referrals: 23,
      tasksCompleted: 156,
      suspensionReason: null,
      lastActive: "2024-01-20",
    },
    {
      id: "USR002",
      name: "Sarah Smith",
      email: "sarah@example.com",
      phone: "+91 9876543211",
      joinDate: "2024-01-12",
      status: "suspended",
      kycStatus: "pending",
      walletBalance: 850.0,
      totalEarnings: 3200.25,
      referrals: 8,
      tasksCompleted: 45,
      suspensionReason: "Multiple account violation",
      lastActive: "2024-01-18",
    },
    {
      id: "USR003",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+91 9876543212",
      joinDate: "2024-01-10",
      status: "active",
      kycStatus: "rejected",
      walletBalance: 1200.75,
      totalEarnings: 5670.5,
      referrals: 15,
      tasksCompleted: 89,
      suspensionReason: null,
      lastActive: "2024-01-20",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getKycStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || user.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const handleSuspendUser = (userId, reason) => {
    console.log("Suspending user:", userId, "Reason:", reason)
  }

  const handleReactivateUser = (userId) => {
    console.log("Reactivating user:", userId)
  }

  const canManageUsers = userRole === "super_admin" || userRole === "manager"
  const canViewKyc = userRole === "super_admin" || userRole === "kyc_manager"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor user accounts</p>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>All registered users and their account status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    {user.suspensionReason && <p className="text-xs text-red-600 mt-1">{user.suspensionReason}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge className={getKycStatusColor(user.kycStatus)}>{user.kycStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">₹{user.walletBalance.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Total: ₹{user.totalEarnings.toFixed(2)}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{user.tasksCompleted} tasks</p>
                      <p>{user.referrals} referrals</p>
                      <p className="text-xs text-muted-foreground">Last: {user.lastActive}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details - {user.name}</DialogTitle>
                            <DialogDescription>Complete user information and activity</DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Personal Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <p>
                                      <span className="font-medium">Name:</span> {selectedUser.name}
                                    </p>
                                    <p>
                                      <span className="font-medium">Email:</span> {selectedUser.email}
                                    </p>
                                    <p>
                                      <span className="font-medium">Phone:</span> {selectedUser.phone}
                                    </p>
                                    <p>
                                      <span className="font-medium">Join Date:</span> {selectedUser.joinDate}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Account Status</h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">Status:</span>
                                      <Badge className={getStatusColor(selectedUser.status)}>
                                        {selectedUser.status}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">KYC:</span>
                                      <Badge className={getKycStatusColor(selectedUser.kycStatus)}>
                                        {selectedUser.kycStatus}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="p-3 text-center">
                                    <Wallet className="h-6 w-6 mx-auto mb-1 text-primary" />
                                    <p className="text-lg font-bold">₹{selectedUser.walletBalance.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Current Balance</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-3 text-center">
                                    <CheckCircle className="h-6 w-6 mx-auto mb-1 text-green-500" />
                                    <p className="text-lg font-bold">{selectedUser.tasksCompleted}</p>
                                    <p className="text-xs text-muted-foreground">Tasks Completed</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="p-3 text-center">
                                    <Calendar className="h-6 w-6 mx-auto mb-1 text-accent" />
                                    <p className="text-lg font-bold">{selectedUser.referrals}</p>
                                    <p className="text-xs text-muted-foreground">Referrals</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {canManageUsers && (
                                <div className="flex gap-2 pt-4 border-t">
                                  {selectedUser.status === "active" ? (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleSuspendUser(selectedUser.id, "Manual suspension")}
                                    >
                                      <Ban className="h-3 w-3 mr-1" />
                                      Suspend User
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() => handleReactivateUser(selectedUser.id)}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Reactivate User
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    View Wallet History
                                  </Button>
                                  {canViewKyc && (
                                    <Button variant="outline" size="sm">
                                      Review KYC
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {canManageUsers && (
                        <>
                          {user.status === "active" ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleSuspendUser(user.id, "Manual suspension")}
                            >
                              <Ban className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" onClick={() => handleReactivateUser(user.id)}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
