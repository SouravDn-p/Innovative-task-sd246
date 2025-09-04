"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRegisterAdvertiserMutation } from "@/redux/api/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function BecomeAdvertiser() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [registerAdvertiser, { isLoading }] = useRegisterAdvertiserMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "",
    contactPerson: session?.user?.name || "",
    contactPhone: "",
    contactEmail: session?.user?.email || "",
    website: "",
    address: "",
    paymentMethod: "",
    businessRegistration: "",
    taxId: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.businessType) {
      newErrors.businessType = "Business type is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = "Contact phone is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Contact email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await registerAdvertiser(formData).unwrap();

      toast({
        title: "Success",
        description: "Your advertiser request has been submitted successfully!",
      });

      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error?.data?.error ||
          "Failed to submit advertiser request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border-teal-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-teal-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Advertiser Request Submitted
          </CardTitle>
          <CardDescription>Your request is under review</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription>
              Thank you for your interest in becoming an advertiser. Our team
              will review your request and get back to you within 24-48 hours.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => router.push("/dashboard/user")}
              variant="outline"
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-teal-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-teal-800">Become an Advertiser</CardTitle>
        <CardDescription>
          Fill out the form below to request advertiser access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-teal-700">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter your company name"
                className={`border-teal-200 focus:border-teal-500 ${
                  errors.companyName ? "border-red-500" : ""
                }`}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-teal-700">
                Business Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.businessType}
                onValueChange={(value) =>
                  handleSelectChange("businessType", value)
                }
              >
                <SelectTrigger
                  className={`border-teal-200 focus:border-teal-500 ${
                    errors.businessType ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="service">Service Provider</SelectItem>
                  <SelectItem value="saas">SaaS/Product</SelectItem>
                  <SelectItem value="content">Content/Media</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.businessType && (
                <p className="text-sm text-red-500">{errors.businessType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-teal-700">
                Contact Person <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
                className={`border-teal-200 focus:border-teal-500 ${
                  errors.contactPerson ? "border-red-500" : ""
                }`}
              />
              {errors.contactPerson && (
                <p className="text-sm text-red-500">{errors.contactPerson}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="text-teal-700">
                Contact Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="Enter contact phone number"
                className={`border-teal-200 focus:border-teal-500 ${
                  errors.contactPhone ? "border-red-500" : ""
                }`}
              />
              {errors.contactPhone && (
                <p className="text-sm text-red-500">{errors.contactPhone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-teal-700">
                Contact Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="Enter contact email"
                className={`border-teal-200 focus:border-teal-500 ${
                  errors.contactEmail ? "border-red-500" : ""
                }`}
              />
              {errors.contactEmail && (
                <p className="text-sm text-red-500">{errors.contactEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-teal-700">
                Website (Optional)
              </Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-teal-700">
              Business Address (Optional)
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your business address"
              className="border-teal-200 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-teal-700">
                Preferred Payment Method (Optional)
              </Label>
              <Input
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                placeholder="e.g., Bank Transfer, PayPal, etc."
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessRegistration" className="text-teal-700">
                Business Registration (Optional)
              </Label>
              <Input
                id="businessRegistration"
                name="businessRegistration"
                value={formData.businessRegistration}
                onChange={handleInputChange}
                placeholder="Registration number"
                className="border-teal-200 focus:border-teal-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId" className="text-teal-700">
              Tax ID (Optional)
            </Label>
            <Input
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="Tax identification number"
              className="border-teal-200 focus:border-teal-500"
            />
          </div>

          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              After submitting this form, our team will review your request. You
              will receive an email notification once your advertiser account is
              approved.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/user")}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
