"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Wallet,
  Upload,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Swal from "sweetalert2";

export function WalletRequestForm({ onBack, userType = "user" }) {
  const { toast } = useToast();
  const [requestData, setRequestData] = useState({
    amount: "",
    description: "",
    proofImage: null,
  });

  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(1); // 1: Amount & Description, 2: Upload Proof, 3: Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);

  const minAmount = 100;
  const maxAmount = 100000;

  const handleInputChange = (field, value) => {
    setRequestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setRequestData((prev) => ({ ...prev, proofImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValidAmount = () => {
    const amount = Number.parseFloat(requestData.amount) || 0;
    return amount >= minAmount && amount <= maxAmount;
  };

  const isValidForm = () => {
    return (
      requestData.amount &&
      isValidAmount() &&
      requestData.description.trim() &&
      requestData.proofImage
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidForm()) {
      toast({
        title: "Invalid form",
        description: "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", requestData.amount);
      formData.append("description", requestData.description);
      formData.append("proofImage", requestData.proofImage);
      formData.append("userType", userType);

      const response = await fetch("/api/wallet/request", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          title: "Request Submitted",
          text: "Your wallet funding request has been submitted successfully and is pending admin approval.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          // Reset form and go back
          setRequestData({
            amount: "",
            description: "",
            proofImage: null,
          });
          setPreview(null);
          setStep(1);
          onBack();
        });
      } else {
        throw new Error(result.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting wallet request:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit wallet request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Wallet Funding Request</h2>
              <p className="text-muted-foreground">
                Request funds to be added to your wallet
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Request (₹)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="5000"
                    value={requestData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
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

              {requestData.amount && !isValidAmount() && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Amount must be between ₹{minAmount} and ₹{maxAmount}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the source of funds and reason for request..."
                  value={requestData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("amount", "1000")}
                >
                  ₹1,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("amount", "5000")}
                >
                  ₹5,000
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange("amount", "10000")}
                >
                  ₹10,000
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Upload Proof</h2>
              <p className="text-muted-foreground">
                Upload an image as proof of payment
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proofImage">Proof Image *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
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
                          className="max-h-48 rounded-md mb-2 mx-auto"
                        />
                        <p className="text-sm text-muted-foreground">
                          Click to change image
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          Click to upload proof image
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPEG, PNG up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {requestData.proofImage && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {requestData.proofImage.name} selected
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please ensure your proof image is clear and shows the payment
                  details. Requests without valid proof will be rejected.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">Confirm Request</h2>
              <p className="text-muted-foreground">
                Review your wallet funding request
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Amount Requested
                    </Label>
                    <p className="text-lg font-semibold">
                      ₹{Number.parseFloat(requestData.amount).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">User Type</Label>
                    <p className="text-lg font-semibold capitalize">
                      {userType}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1">{requestData.description}</p>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Proof Image</Label>
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
                Your request will be reviewed by an admin. Funds will be added
                to your wallet after approval. This process typically takes
                24-48 hours.
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Wallet Request</h1>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (step > 1 ? setStep(step - 1) : onBack())}
                >
                  {step > 1 ? "Previous" : "Cancel"}
                </Button>

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    disabled={
                      (step === 1 &&
                        (!requestData.amount ||
                          !isValidAmount() ||
                          !requestData.description.trim())) ||
                      (step === 2 && !requestData.proofImage)
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
