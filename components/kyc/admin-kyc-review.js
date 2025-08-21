"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CheckCircle, X, Eye, Clock, AlertTriangle, FileText, User, Calendar, CreditCard, Download } from "lucide-react"

export function AdminKYCReview({ userRole }) {
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewNotes, setReviewNotes] = useState("")

  const kycApplications = [
    {
      id: "KYC001",
      userId: "USR001",
      userName: "John Doe",
      email: "john@example.com",
      phone: "+91 9876543210",
      submittedAt: "2024-01-20 14:30",
      status: "pending",
      paymentStatus: "paid",
      documents: {
        aadhar: { uploaded: true, url: "aadhar_001.jpg" },
        pan: { uploaded: true, url: "pan_001.jpg" },
        selfie: { uploaded: true, url: "selfie_001.jpg" },
        bankStatement: { uploaded: false, url: null },
      },
      personalInfo: {
        fullName: "John Doe",
        dateOfBirth: "1990-05-15",
        gender: "male",
        aadharNumber: "1234567890123",
        panNumber: "ABCDE1234F",
        address: "123 Main Street, Andheri West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400058",
      },
      priority: "normal",
    },
    {
      id: "KYC002",
      userId: "USR002",
      userName: "Sarah Smith",
      email: "sarah@example.com",
      phone: "+91 9876543211",
      submittedAt: "2024-01-19 16:45",
      status: "under_review",
      paymentStatus: "paid",
      documents: {
        aadhar: { uploaded: true, url: "aadhar_002.jpg" },
        pan: { uploaded: true, url: "pan_002.jpg" },
        selfie: { uploaded: true, url: "selfie_002.jpg" },
        bankStatement: { uploaded: true, url: "bank_002.pdf" },
      },
      personalInfo: {
        fullName: "Sarah Smith",
        dateOfBirth: "1985-08-22",
        gender: "female",
        aadharNumber: "9876543210987",
        panNumber: "XYZAB5678C",
        address: "456 Park Avenue, Bandra East",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400051",
      },
      priority: "high",
      assignedTo: "Admin User",
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const handleApprove = (applicationId) => {
    console.log("Approving KYC:", applicationId, "Notes:", reviewNotes)
  }

  const handleReject = (applicationId) => {
    console.log("Rejecting KYC:", applicationId, "Notes:", reviewNotes)
  }

  const canReviewKYC = userRole === "super_admin" || userRole === "kyc_manager"

  if (!canReviewKYC) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">You don&apos;t have permission to access KYC review features.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KYC Review</h1>
          <p className="text-muted-foreground">Review and approve user KYC applications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-50">
            {kycApplications.filter((app) => app.status === "pending").length} Pending
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            {kycApplications.filter((app) => app.status === "under_review").length} Under Review
          </Badge>
        </div>
      </div>

      {/* KYC Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Applications</CardTitle>
          <CardDescription>Review pending KYC verification requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{application.userName}</p>
                      <p className="text-sm text-muted-foreground">{application.email}</p>
                      <p className="text-xs text-muted-foreground">{application.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{application.submittedAt}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(application.priority)}>{application.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>KYC Review - {application.userName}</DialogTitle>
                            <DialogDescription>Application ID: {application.id}</DialogDescription>
                          </DialogHeader>
                          {selectedApplication && (
                            <div className="space-y-6">
                              {/* Personal Information */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Personal Information
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Full Name:</span>{" "}
                                      {selectedApplication.personalInfo.fullName}
                                    </div>
                                    <div>
                                      <span className="font-medium">Date of Birth:</span>{" "}
                                      {selectedApplication.personalInfo.dateOfBirth}
                                    </div>
                                    <div>
                                      <span className="font-medium">Gender:</span>{" "}
                                      {selectedApplication.personalInfo.gender}
                                    </div>
                                    <div>
                                      <span className="font-medium">Phone:</span> {selectedApplication.phone}
                                    </div>
                                    <div>
                                      <span className="font-medium">Aadhar:</span>{" "}
                                      {selectedApplication.personalInfo.aadharNumber}
                                    </div>
                                    <div>
                                      <span className="font-medium">PAN:</span>{" "}
                                      {selectedApplication.personalInfo.panNumber}
                                    </div>
                                  </div>
                                  <div className="mt-3 text-sm">
                                    <span className="font-medium">Address:</span>{" "}
                                    {selectedApplication.personalInfo.address}, {selectedApplication.personalInfo.city},{" "}
                                    {selectedApplication.personalInfo.state} -{" "}
                                    {selectedApplication.personalInfo.pincode}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Documents */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(selectedApplication.documents).map(([docType, doc]) => (
                                      <div key={docType} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium capitalize">
                                            {docType.replace(/([A-Z])/g, " $1")}
                                          </h4>
                                          {doc.uploaded ? (
                                            <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
                                          ) : (
                                            <Badge variant="outline">Not Uploaded</Badge>
                                          )}
                                        </div>
                                        {doc.uploaded && (
                                          <div className="flex gap-2">
                                            <Button variant="outline" size="sm">
                                              <Eye className="h-3 w-3 mr-1" />
                                              View
                                            </Button>
                                            <Button variant="outline" size="sm">
                                              <Download className="h-3 w-3 mr-1" />
                                              Download
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Payment Status */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment Status
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      className={
                                        selectedApplication.paymentStatus === "paid"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }
                                    >
                                      {selectedApplication.paymentStatus}
                                    </Badge>
                                    <span className="text-sm">KYC Fee: ₹99</span>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Review Section */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base">Review Decision</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Review Notes</label>
                                    <Textarea
                                      placeholder="Add your review comments..."
                                      value={reviewNotes}
                                      onChange={(e) => setReviewNotes(e.target.value)}
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <Button
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleApprove(selectedApplication.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve KYC
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleReject(selectedApplication.id)}>
                                      <X className="h-4 w-4 mr-2" />
                                      Reject KYC
                                    </Button>
                                    <Button variant="outline">
                                      <Clock className="h-4 w-4 mr-2" />
                                      Request More Info
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(application.id)}
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(application.id)}>
                        <X className="h-3 w-3" />
                      </Button>
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
