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
} from "lucide-react";
import { useGetWalletQuery } from "@/redux/api/api";

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
          </CardContent>
        </Card>
      </motion.div>

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