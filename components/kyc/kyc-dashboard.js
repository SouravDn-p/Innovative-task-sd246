"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  UserCheck,
  FileText,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Upload,
  Eye,
  RefreshCw,
} from "lucide-react"

export function KYCDashboard({ userRole = "user" }) {
  const [kycData] = useState({
    status: "pending", // not_started, pending, under_review, verified, rejected
    submittedAt: "2024-01-20 14:30",
    reviewedAt: null,
    documents: {
      aadhar: { uploaded: true, status: "approved", url: "aadhar.jpg" },
      pan: { uploaded: true, status: "pending", url: "pan.jpg" },
      selfie: { uploaded: true, status: "rejected", url: "selfie.jpg", reason: "Image not clear" },
      bankStatement: { uploaded: false, status: "not_uploaded", url: null },
    },
    paymentStatus: "paid", // not_paid, paid, failed
    paymentAmount: 99,
    rejectionReason: null,
    completionPercentage: 75,
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "not_started":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "rejected":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "not_uploaded":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const documentTypes = [
    {
      key: "aadhar",
      name: "Aadhar Card",
      description: "Government issued identity proof",
      required: true,
    },
    {
      key: "pan",
      name: "PAN Card",
      description: "Permanent Account Number card",
      required: true,
    },
    {
      key: "selfie",
      name: "Selfie with Aadhar",
      description: "Clear selfie holding your Aadhar card",
      required: true,
    },
    {
      key: "bankStatement",
      name: "Bank Statement",
      description: "Last 3 months bank statement (Optional)",
      required: false,
    },
  ]

  const canStartKYC = kycData.status === "not_started"
  const canResubmit = kycData.status === "rejected"
  const isUnderReview = kycData.status === "under_review" || kycData.status === "pending"
  const isVerified = kycData.status === "verified"

  return (
    <div className="p-6 space-y-6">
      {/* KYC Status Header */}
      <Card
        className={`border-2 ${isVerified ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : isUnderReview ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950" : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"}`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-background rounded-full">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">KYC Verification</h2>
                <p className="text-muted-foreground">Complete your identity verification to unlock withdrawals</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(kycData.status)} variant="outline">
                <div className="flex items-center gap-2">
                  {getStatusIcon(kycData.status)}
                  {kycData.status.replace("_", " ").toUpperCase()}
                </div>
              </Badge>
              {kycData.submittedAt && (
                <p className="text-sm text-muted-foreground mt-1">Submitted: {kycData.submittedAt}</p>
              )}
            </div>
          </div>

          {kycData.status !== "not_started" && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Progress</span>
                <span>{kycData.completionPercentage}%</span>
              </div>
              <Progress value={kycData.completionPercentage} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status-specific Alerts */}
      {kycData.status === "not_started" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Complete KYC verification to unlock withdrawal features. Verification fee: ₹{kycData.paymentAmount}
          </AlertDescription>
        </Alert>
      )}

      {kycData.status === "rejected" && kycData.rejectionReason && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>
            <strong>KYC Rejected:</strong> {kycData.rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      {kycData.status === "verified" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Congratulations!</strong> Your KYC verification is complete. You can now withdraw funds.
          </AlertDescription>
        </Alert>
      )}

      {isUnderReview && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Your KYC documents are under review. We&apos;ll notify you once the verification is complete (usually within
            24-48 hours).
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Status */}
      {kycData.paymentStatus !== "paid" && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">KYC Verification Fee</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Pay ₹{kycData.paymentAmount} to start verification process
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Upload Status */}
      <Card>
        <CardHeader>
          <CardTitle>Document Verification</CardTitle>
          <CardDescription>Upload required documents for identity verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentTypes.map((docType) => {
              const doc = kycData.documents[docType.key]
              return (
                <div key={docType.key} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-background rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{docType.name}</h3>
                        {docType.required && <Badge variant="outline">Required</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{docType.description}</p>
                      {doc.status === "rejected" && doc.reason && (
                        <p className="text-sm text-red-600 mt-1">Reason: {doc.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getDocumentStatusColor(doc.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(doc.status)}
                        {doc.status.replace("_", " ")}
                      </div>
                    </Badge>
                    <div className="flex gap-2">
                      {doc.uploaded && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      {(doc.status === "not_uploaded" || doc.status === "rejected") && (
                        <Button variant="outline" size="sm">
                          <Upload className="h-3 w-3" />
                        </Button>
                      )}
                      {doc.status === "rejected" && (
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {canStartKYC && (
          <Button className="bg-primary hover:bg-primary/90">
            <UserCheck className="h-4 w-4 mr-2" />
            Start KYC Verification
          </Button>
        )}
        {canResubmit && (
          <Button className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Resubmit Documents
          </Button>
        )}
        {kycData.status !== "not_started" && (
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Submission
          </Button>
        )}
      </div>

      {/* KYC Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of KYC Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Unlock withdrawal features</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Higher task limits</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Priority customer support</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">Enhanced account security</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
