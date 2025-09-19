"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Wallet, CreditCard, Banknote, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Swal from "sweetalert2"

export function WithdrawalForm({ walletBalance = 2450.75, onBack }) {
  const { toast } = useToast()
  const [withdrawalData, setWithdrawalData] = useState({
    amount: "",
    method: "",
    upiId: "",
    bankAccount: "",
    ifscCode: "",
    accountHolder: "",
    notes: "",
    proofImage: null,
  })

  const [preview, setPreview] = useState(null)
  const [step, setStep] = useState(1) // 1: Amount, 2: Method, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false)

  const withdrawalFee = 25
  const minWithdrawal = 3000
  const maxWithdrawal = Math.min(walletBalance, 50000)

  const handleInputChange = (field, value) => {
    setWithdrawalData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setWithdrawalData((prev) => ({ ...prev, proofImage: file }))

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateNetAmount = () => {
    const amount = Number.parseFloat(withdrawalData.amount) || 0
    return Math.max(0, amount - withdrawalFee)
  }

  const isValidAmount = () => {
    const amount = Number.parseFloat(withdrawalData.amount) || 0
    return amount >= minWithdrawal && amount <= maxWithdrawal
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!withdrawalData.proofImage) {
      toast({
        title: "Proof required",
        description: "Please upload proof of your bank account or UPI ID",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("amount", withdrawalData.amount)
      formData.append("method", withdrawalData.method)
      formData.append("upiId", withdrawalData.upiId || "")
      formData.append("bankAccount", withdrawalData.bankAccount || "")
      formData.append("ifscCode", withdrawalData.ifscCode || "")
      formData.append("accountHolder", withdrawalData.accountHolder || "")
      formData.append("notes", withdrawalData.notes || "")
      formData.append("proofImage", withdrawalData.proofImage)

      const response = await fetch("/api/wallet/withdraw", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        Swal.fire({
          title: "Request Submitted",
          text: "Your withdrawal request has been submitted successfully and is pending admin approval.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reset form and go back
          setWithdrawalData({
            amount: "",
            method: "",
            upiId: "",
            bankAccount: "",
            ifscCode: "",
            accountHolder: "",
            notes: "",
            proofImage: null,
          })
          setPreview(null)
          setStep(1)
          onBack()
        })
      } else {
        throw new Error(result.error || "Failed to submit request")
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error)
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Withdraw Funds</h2>
              <p className="text-muted-foreground">Enter the amount you want to withdraw</p>
            </div>

            <Card className="bg-muted">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Available Balance</span>
                  <span className="text-lg font-bold">₹{walletBalance.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="3000"
                    value={withdrawalData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="pl-8"
                    min={minWithdrawal}
                    max={maxWithdrawal}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ₹{minWithdrawal}</span>
                  <span>Max: ₹{maxWithdrawal}</span>
                </div>
              </div>

              {withdrawalData.amount && (
                <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Withdrawal Amount</span>
                        <span>₹{Number.parseFloat(withdrawalData.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee</span>
                        <span>₹{withdrawalFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>You&apos;ll Receive</span>
                        <span>₹{calculateNetAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isValidAmount() && withdrawalData.amount && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Amount must be between ₹{minWithdrawal} and ₹{maxWithdrawal}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("amount", minWithdrawal.toString())}
                >
                  Min (₹{minWithdrawal})
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("amount", Math.floor(walletBalance).toString())}
                >
                  Max (₹{Math.floor(walletBalance)})
                </Button>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Payment Method</h2>
              <p className="text-muted-foreground">Choose how you want to receive your funds</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Card
                    className={`cursor-pointer transition-colors ${
                      withdrawalData.method === "upi" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("method", "upi")}
                  >
                    <CardContent className="p-4 text-center">
                      <Banknote className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">UPI</h3>
                      <p className="text-sm text-muted-foreground">Instant transfer</p>
                      <Badge variant="outline" className="mt-2">
                        Recommended
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card
                    className={`cursor-pointer transition-colors ${
                      withdrawalData.method === "bank" ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("method", "bank")}
                  >
                    <CardContent className="p-4 text-center">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <h3 className="font-semibold">Bank Transfer</h3>
                      <p className="text-sm text-muted-foreground">1-2 business days</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {withdrawalData.method === "upi" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      placeholder="yourname@paytm"
                      value={withdrawalData.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {withdrawalData.method === "bank" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">Account Holder Name</Label>
                    <Input
                      id="accountHolder"
                      placeholder="John Doe"
                      value={withdrawalData.accountHolder}
                      onChange={(e) => handleInputChange("accountHolder", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">Account Number</Label>
                    <Input
                      id="bankAccount"
                      placeholder="1234567890"
                      value={withdrawalData.bankAccount}
                      onChange={(e) => handleInputChange("bankAccount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ifscCode">IFSC Code</Label>
                    <Input
                      id="ifscCode"
                      placeholder="SBIN0001234"
                      value={withdrawalData.ifscCode}
                      onChange={(e) => handleInputChange("ifscCode", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={withdrawalData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proofImage">Proof of Account *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Input
                    id="proofImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="proofImage" className="cursor-pointer">
                    {preview ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-h-32 rounded-md mb-2 mx-auto"
                        />
                        <p className="text-xs text-muted-foreground">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Banknote className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Click to upload proof of account
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {withdrawalData.proofImage && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{withdrawalData.proofImage.name} selected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">Confirm Withdrawal</h2>
              <p className="text-muted-foreground">Please review your withdrawal details</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Amount</Label>
                    <p className="text-lg font-semibold">₹{Number.parseFloat(withdrawalData.amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Processing Fee</Label>
                    <p className="text-lg font-semibold">₹{withdrawalFee.toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Net Amount</Label>
                  <p className="text-2xl font-bold text-green-600">₹{calculateNetAmount().toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Method</Label>
                  <p className="capitalize">{withdrawalData.method}</p>
                </div>
                {withdrawalData.method === "upi" && (
                  <div>
                    <Label className="text-sm font-medium">UPI ID</Label>
                    <p>{withdrawalData.upiId}</p>
                  </div>
                )}
                {withdrawalData.method === "bank" && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Account Holder</Label>
                      <p>{withdrawalData.accountHolder}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Account Number</Label>
                      <p>****{withdrawalData.bankAccount.slice(-4)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">IFSC Code</Label>
                      <p>{withdrawalData.ifscCode}</p>
                    </div>
                  </>
                )}
                {withdrawalData.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes</Label>
                    <p className="text-sm text-muted-foreground">{withdrawalData.notes}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium">Proof of Account</Label>
                  {preview && (
                    <img
                      src={preview}
                      alt="Proof"
                      className="mt-2 max-h-48 rounded-md mx-auto"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Withdrawal requests are processed within 24-48 hours. Please ensure your payment details are correct.
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
            <h1 className="text-xl font-bold">Withdraw Funds</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : onBack())}>
                  {step > 1 ? "Previous" : "Cancel"}
                </Button>
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 && !isValidAmount()) ||
                      (step === 2 && !withdrawalData.method) ||
                      (step === 2 && withdrawalData.method === "upi" && !withdrawalData.upiId) ||
                      (step === 2 &&
                        withdrawalData.method === "bank" &&
                        (!withdrawalData.accountHolder || !withdrawalData.bankAccount || !withdrawalData.ifscCode)) ||
                      (step === 2 && !withdrawalData.proofImage)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Withdrawal"}
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