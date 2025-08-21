"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, FileText, Camera, CheckCircle, AlertTriangle, CreditCard } from "lucide-react"

export function KYCForm({ onBack }) {
  const [currentStep, setCurrentStep] = useState(1) // 1: Personal Info, 2: Documents, 3: Payment, 4: Confirmation
  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      aadharNumber: "",
      panNumber: "",
    },
    documents: {
      aadhar: null,
      pan: null,
      selfie: null,
      bankStatement: null,
    },
    paymentMethod: "card",
  })

  const kycFee = 99

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  const handleFileUpload = (docType, file) => {
    setFormData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docType]: file },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("KYC Form submitted:", formData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Personal Information</h2>
              <p className="text-muted-foreground">Enter your personal details as per government documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="As per Aadhar Card"
                  value={formData.personalInfo.fullName}
                  onChange={(e) => handleInputChange("personalInfo", "fullName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  className="w-full p-2 border border-border rounded-md bg-background"
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleInputChange("personalInfo", "gender", e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aadharNumber">Aadhar Number *</Label>
                <Input
                  id="aadharNumber"
                  placeholder="1234 5678 9012"
                  value={formData.personalInfo.aadharNumber}
                  onChange={(e) => handleInputChange("personalInfo", "aadharNumber", e.target.value)}
                  maxLength={12}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="panNumber">PAN Number *</Label>
                <Input
                  id="panNumber"
                  placeholder="ABCDE1234F"
                  value={formData.personalInfo.panNumber}
                  onChange={(e) => handleInputChange("personalInfo", "panNumber", e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  placeholder="House/Flat No, Street, Area"
                  value={formData.personalInfo.address}
                  onChange={(e) => handleInputChange("personalInfo", "address", e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={formData.personalInfo.city}
                    onChange={(e) => handleInputChange("personalInfo", "city", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="Maharashtra"
                    value={formData.personalInfo.state}
                    onChange={(e) => handleInputChange("personalInfo", "state", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    value={formData.personalInfo.pincode}
                    onChange={(e) => handleInputChange("personalInfo", "pincode", e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Document Upload</h2>
              <p className="text-muted-foreground">Upload clear photos of your documents</p>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Ensure all documents are clear, well-lit, and all text is readable. Blurry
                or unclear images will be rejected.
              </AlertDescription>
            </Alert>

            <div className="space-y-6">
              {/* Aadhar Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aadhar Card (Required)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload front and back side of your Aadhar card</p>
                    <Button variant="outline" size="sm">
                      Choose Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max size: 5MB per file</p>
                  </div>
                </CardContent>
              </Card>

              {/* PAN Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PAN Card (Required)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Upload clear photo of your PAN card</p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Max size: 5MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Selfie with Aadhar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selfie with Aadhar (Required)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Take a clear selfie while holding your Aadhar card
                    </p>
                    <Button variant="outline" size="sm">
                      Take Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Face and Aadhar should be clearly visible</p>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Statement (Optional) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bank Statement (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload last 3 months bank statement (PDF format)
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Optional - helps with faster verification</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Payment</h2>
              <p className="text-muted-foreground">Pay verification fee to process your KYC</p>
            </div>

            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">₹{kycFee}</h3>
                  <p className="text-muted-foreground">One-time KYC verification fee</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border border-primary rounded-lg bg-primary/5">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">Credit/Debit Card</h4>
                      <p className="text-sm text-muted-foreground">Secure payment via Cashfree</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Secure Payment:</strong> Your payment is protected with 256-bit SSL encryption. We use Cashfree
                for secure payment processing.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">Review & Submit</h2>
              <p className="text-muted-foreground">Please review your information before submitting</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {formData.personalInfo.fullName}
                  </div>
                  <div>
                    <span className="font-medium">DOB:</span> {formData.personalInfo.dateOfBirth}
                  </div>
                  <div>
                    <span className="font-medium">Aadhar:</span> ****{formData.personalInfo.aadharNumber.slice(-4)}
                  </div>
                  <div>
                    <span className="font-medium">PAN:</span> {formData.personalInfo.panNumber}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Address:</span> {formData.personalInfo.address},{" "}
                  {formData.personalInfo.city}, {formData.personalInfo.state} - {formData.personalInfo.pincode}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents Uploaded</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Aadhar Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">PAN Card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Selfie with Aadhar</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span>KYC Verification Fee</span>
                  <span className="font-semibold">₹{kycFee}</span>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                By submitting this form, you confirm that all information provided is accurate and documents are
                genuine. False information may result in account suspension.
              </AlertDescription>
            </Alert>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">KYC Verification</h1>
            <p className="text-sm text-muted-foreground">Step {currentStep} of 4</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{currentStep}/4</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack())}
                >
                  {currentStep > 1 ? "Previous" : "Cancel"}
                </Button>
                {currentStep < 4 ? (
                  <Button type="button" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Submit KYC Application
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
