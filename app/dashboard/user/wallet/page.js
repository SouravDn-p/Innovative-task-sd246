"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Activity,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  CheckCircle,
  ArrowLeft,
  X,
  Eye,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";
import { useGetWalletQuery } from "@/redux/api/api";
import { useToast } from "@/components/ui/use-toast";
import Swal from "sweetalert2";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export default function UserWalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Wallet request form state
  const [showWalletRequestForm, setShowWalletRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    amount: "",
    description: "",
    proofImage: null,
  });
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 20,
  });

  // Fetch wallet data
  const {
    data: walletResponse,
    isLoading: walletLoading,
    error: walletError,
    refetch,
  } = useGetWalletQuery();

  // Update state when wallet data changes
  useEffect(() => {
    if (walletResponse) {
      setWalletData(walletResponse.wallet);
      setTransactions(walletResponse.transactions || []);
      setPagination(
        walletResponse.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalTransactions: walletResponse.transactions?.length || 0,
          hasNext: false,
          hasPrev: false,
        }
      );
    }
  }, [walletResponse]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle wallet request input changes
  const handleRequestInputChange = (field, value) => {
    setRequestData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle file change for proof image
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

  // Validate wallet request form
  const isValidRequestForm = () => {
    const minAmount = 100;
    const maxAmount = 100000;
    const amount = Number.parseFloat(requestData.amount) || 0;

    return (
      requestData.amount &&
      amount >= minAmount &&
      amount <= maxAmount &&
      requestData.description.trim() &&
      requestData.proofImage
    );
  };

  // Submit wallet request
  const submitWalletRequest = async (e) => {
    e.preventDefault();

    if (!isValidRequestForm()) {
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
      formData.append("userType", "user");

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
          // Reset form and hide it
          setRequestData({
            amount: "",
            description: "",
            proofImage: null,
          });
          setPreview(null);
          setShowWalletRequestForm(false);

          // Refresh wallet data
          refetch();
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

  // Apply search and date filters
  const applyFilters = () => {
    refetch();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      type: "all",
      dateFrom: "",
      dateTo: "",
      page: 1,
      limit: 20,
    });
  };

  // Format transaction type
  const getTransactionTypeDisplay = (type, description) => {
    switch (type) {
      case "credit":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 text-xs py-0.5">
            <ArrowDownLeft className="mr-1 h-3 w-3" />
            Credit
          </Badge>
        );
      case "debit":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 text-xs py-0.5">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Debit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="capitalize text-xs py-0.5">
            {type}
          </Badge>
        );
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type) => {
    return type === "credit" ? (
      <ArrowDownLeft className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-red-500" />
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs py-0.5">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs py-0.5">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs py-0.5">
            <X className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs py-0.5">
            {status}
          </Badge>
        );
    }
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    switch (category) {
      case "task":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs py-0.5">
            Task
          </Badge>
        );
      case "referral":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs py-0.5">
            Referral
          </Badge>
        );
      case "withdrawal":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs py-0.5">
            Withdrawal
          </Badge>
        );
      case "fee":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs py-0.5">
            Fee
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs py-0.5">
            {category}
          </Badge>
        );
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = filters.search
      ? transaction.description
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        transaction.reference
          .toLowerCase()
          .includes(filters.search.toLowerCase())
      : true;

    const matchesType =
      filters.type === "all" || transaction.type === filters.type;

    return matchesSearch && matchesType;
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading" || walletLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading wallet...</span>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6 w-full max-w-full overflow-x-hidden"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Wallet
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            View your balance and transaction history
          </p>
        </div>
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white w-full">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm opacity-90">
                  Available Balance
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                  ₹{walletData?.balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <Wallet className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 opacity-80" />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div className="rounded-lg bg-white/10 p-2 sm:p-3">
                <p className="text-xs opacity-80">Total Earned</p>
                <p className="text-base sm:text-lg font-semibold">
                  ₹{walletData?.totalEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-2 sm:p-3">
                <p className="text-xs opacity-80">Total Credits</p>
                <p className="text-base sm:text-lg font-semibold">
                  ₹{walletData?.totalCredits?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-2 sm:p-3">
                <p className="text-xs opacity-80">Pending</p>
                <p className="text-base sm:text-lg font-semibold">₹0.00</p>
              </div>
            </div>
            {/* Add Balance Button */}
            <div className="mt-4 sm:mt-6">
              <Button
                className="w-full sm:w-auto bg-white text-teal-600 hover:bg-white/90"
                onClick={() => setShowWalletRequestForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Balance
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wallet Request Form */}
      {showWalletRequestForm && (
        <motion.div variants={fadeInUp}>
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4 md:p-6">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base sm:text-lg">
                    Add Balance Request
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Submit a request with payment proof to add funds to your
                    wallet
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWalletRequestForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6">
              <form onSubmit={submitWalletRequest} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Amount to Add (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={requestData.amount}
                        onChange={(e) =>
                          handleRequestInputChange("amount", e.target.value)
                        }
                        className="pl-8"
                        min="100"
                        max="100000"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Min: ₹100</span>
                      <span>Max: ₹100,000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description *</label>
                    <Input
                      placeholder="Describe the source of funds..."
                      value={requestData.description}
                      onChange={(e) =>
                        handleRequestInputChange("description", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Proof of Payment *
                  </label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="proofImage"
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
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
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
                  {requestData.proofImage && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>{requestData.proofImage.name} selected</span>
                    </div>
                  )}
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-yellow-800">Important</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Your request will be reviewed by an admin. Funds will be
                    added to your wallet after approval. This process typically
                    takes 24-48 hours.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowWalletRequestForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValidRequestForm()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Filter your transaction history
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-7 text-xs sm:text-sm h-8 sm:h-10"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                    <SelectValue placeholder="Transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs sm:text-sm">
                      All Types
                    </SelectItem>
                    <SelectItem value="credit" className="text-xs sm:text-sm">
                      Credits
                    </SelectItem>
                    <SelectItem value="debit" className="text-xs sm:text-sm">
                      Debits
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={applyFilters}
                    size="sm"
                    className="flex-1 text-xs sm:text-sm py-1 sm:py-2"
                  >
                    <Filter className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                    Apply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    size="sm"
                    className="text-xs sm:text-sm py-1 sm:py-2"
                  >
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div variants={fadeInUp}>
        <Card className="w-full">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg">
                  Transaction History
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {filteredTransactions.length > 0
                    ? `Showing ${filteredTransactions.length} transactions`
                    : "No transactions found"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm py-1 sm:py-2"
              >
                <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-3 md:p-6 pt-0">
            {/* Removed the local loading state check and rely only on walletLoading */}
            <>
              {/* Mobile View - Card Layout */}
              <div className="sm:hidden space-y-3 p-3">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <Card
                      key={transaction._id || transaction.id}
                      className="w-full"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-full bg-muted p-1.5">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {transaction.reference}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-sm ${
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}₹
                              {transaction.amount?.toFixed(2) || "0.00"}
                            </p>
                            {getStatusBadge(transaction.status)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {new Date(
                                transaction.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          {getCategoryBadge(transaction.category)}
                          {getTransactionTypeDisplay(transaction.type)}
                        </div>
                        {transaction.failureReason && (
                          <p className="text-xs text-red-600 mt-1">
                            {transaction.failureReason}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Activity className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    <h3 className="mt-3 sm:mt-4 font-medium text-sm sm:text-base">
                      No transactions found
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Your transaction history will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop View - Table Layout */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Transaction</TableHead>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction._id || transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="rounded-full bg-muted p-2">
                                {getTransactionIcon(transaction.type)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {transaction.description}
                                </p>
                                {transaction.failureReason && (
                                  <p className="text-xs text-red-600">
                                    {transaction.failureReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTransactionTypeDisplay(transaction.type)}
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(transaction.category)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                transaction.type === "credit"
                                  ? "text-green-600 text-sm"
                                  : "text-red-600 text-sm"
                              }
                            >
                              {transaction.type === "credit" ? "+" : "-"}₹
                              {transaction.amount?.toFixed(2) || "0.00"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(transaction.status)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {transaction.reference}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 font-medium">
                            No transactions found
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Your transaction history will appear here
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
