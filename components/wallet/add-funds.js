"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CreditCard, Wallet, Plus, CheckCircle, AlertTriangle } from "lucide-react"

export function AddFunds({ onBack }) {
  const [fundData, setFundData] = useState({
    amount: "",
    method: "card",
  })

  const [step, setStep] = useState(1) // 1: Amount, 2: Payment, 3: Confirmation

  const minAmount = 1000
  const maxAmount = 100000
  const processingFee = 2.5 // 2.5% processing fee

  const handleInputChange = (field, value) => {
    setFundData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateFee = () => {
    const amount = Number.parseFloat(fundData.amount) || 0
    return (amount * processingFee) / 100
  }

  const calculateTotal = () => {
    const amount = Number.parseFloat(fundData.amount) || 0
    return amount + calculateFee()
  }

  const isValidAmount = () => {
    const amount = Number.parseFloat(fundData.amount) || 0
    return amount >= minAmount && amount <= maxAmount
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Add funds request:", fundData)
    // Handle payment processing
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Add Funds</h2>
              <p className="text-muted-foreground">Add money to your advertiser wallet</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Add</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={fundData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="pl-8"
                    min={minAmount}
                    max={maxAmount}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: ₹{minAmount}</span>
                  <span>Max: ₹{maxAmount}</span>
                </div>
              </div>

              {fundData.amount && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Amount to Add</span>
                        <span>₹{Number.parseFloat(fundData.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee ({processingFee}%)</span>
                        <span>₹{calculateFee().toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total to Pay</span>
                        <span>₹{calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!isValidAmount() && fundData.amount && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Amount must be between ₹{minAmount} and ₹{maxAmount}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => handleInputChange("amount", "5000")}>
                  ₹5,000
                </Button>
                <Button type="button" variant="outline" onClick={() => handleInputChange("amount", "10000")}>
                  ₹10,000
                </Button>
                <Button type="button" variant="outline" onClick={() => handleInputChange("amount", "25000")}>
                  ₹25,000
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
              <p className="text-muted-foreground">Choose your preferred payment method</p>
            </div>

            <div className="space-y-4">
              <Card className="border-primary bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Credit/Debit Card</h3>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                      </div>
                    </div>
                    <Badge>Recommended</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">UPI</h3>
                        <p className="text-sm text-muted-foreground">Pay using UPI apps</p>
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6" />
                      <div>
                        <h3 className="font-semibold">Net Banking</h3>
                        <p className="text-sm text-muted-foreground">Direct bank transfer</p>
                      </div>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment is secured with 256-bit SSL encryption. We use Cashfree for secure payment processing.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">Confirm Payment</h2>
              <p className="text-muted-foreground">Review your payment details</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Amount to Add</Label>
                    <p className="text-lg font-semibold">₹{Number.parseFloat(fundData.amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Processing Fee</Label>
                    <p className="text-lg font-semibold">₹{calculateFee().toFixed(2)}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Total to Pay</Label>
                  <p className="text-2xl font-bold text-primary">₹{calculateTotal().toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">Secure payment via Cashfree</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Funds will be added to your wallet immediately after successful payment. You'll receive a confirmation
                email.
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
            <h1 className="text-xl font-bold">Add Funds</h1>
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
                  <Button type="button" onClick={() => setStep(step + 1)} disabled={step === 1 && !isValidAmount()}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Proceed to Payment
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
