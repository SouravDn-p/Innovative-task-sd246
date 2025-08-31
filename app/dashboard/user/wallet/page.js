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
} from "lucide-react";
import { useGetUserByEmailQuery } from "@/redux/api/api";

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
  const [loading, setLoading] = useState(true);
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

  // Fetch user data (which includes wallet info)
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByEmailQuery(session?.user?.email, {
    skip: !session?.user?.email,
  });

  // Fetch wallet data
  const fetchWalletData = async (newFilters = filters) => {
    try {
      setLoading(true);
      
      // For now, we'll use the user data from Redux which includes wallet info
      if (userData?.user) {
        // Simulate API response structure
        const walletInfo = {
          balance: userData.user.walletBalance || 0,
          totalEarnings: userData.user.totalEarn || 0,
          totalSpent: 0, // Users don't spend, they earn
          totalCredits: userData.user.totalEarn || 0,
        };
        
        // Get transactions from user data
        const userTransactions = userData.user.transactions || [];
        
        setWalletData(walletInfo);
        setTransactions(userTransactions);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTransactions: userTransactions.length,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when user data changes
  useEffect(() => {
    if (session?.user && userData?.user) {
      fetchWalletData();
    }
  }, [session, userData]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Apply search and date filters
  const applyFilters = () => {
    fetchWalletData();
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
            <ArrowDownLeft className="mr-1 h-3 w-3" />
            Credit
          </Badge>
        );
      case "debit":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-200">
            <ArrowUpRight className="mr-1 h-3 w-3" />
            Debit
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="capitalize">
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
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <X className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    switch (category) {
      case "task":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Task
          </Badge>
        );
      case "referral":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Referral
          </Badge>
        );
      case "withdrawal":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            Withdrawal
          </Badge>
        );
      case "fee":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Fee
          </Badge>
        );
      default:
        return <Badge variant="secondary">{category}</Badge>;
    }
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = filters.search
      ? transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(filters.search.toLowerCase())
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
  if (status === "loading" || userLoading) {
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
      className="space-y-6 p-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
          <p className="text-muted-foreground">
            View your balance and transaction history
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/user")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      {/* Wallet Balance Card */}
      <motion.div variants={fadeInUp}>
        <Card className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Available Balance</p>
                <p className="text-4xl font-bold">
                  ₹{walletData?.balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <Wallet className="h-12 w-12 opacity-80" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs opacity-80">Total Earned</p>
                <p className="text-lg font-semibold">
                  ₹{walletData?.totalEarnings?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs opacity-80">Total Credits</p>
                <p className="text-lg font-semibold">
                  ₹{walletData?.totalCredits?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs opacity-80">Pending</p>
                <p className="text-lg font-semibold">₹0.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter your transaction history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10"
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credits</SelectItem>
                    <SelectItem value="debit">Debits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  <Filter className="mr-2 h-4 w-4" />
                  Apply
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions Table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  {filteredTransactions.length > 0
                    ? `Showing ${filteredTransactions.length} transactions`
                    : "No transactions found"}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-teal-600" />
                <span className="ml-2 text-teal-800">Loading transactions...</span>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
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
                                <p className="font-medium">{transaction.description}</p>
                                {transaction.failureReason && (
                                  <p className="text-xs text-red-600">
                                    {transaction.failureReason}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getTransactionTypeDisplay(transaction.type)}</TableCell>
                          <TableCell>{getCategoryBadge(transaction.category)}</TableCell>
                          <TableCell>
                            <span
                              className={
                                transaction.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {transaction.type === "credit" ? "+" : "-"}₹
                              {transaction.amount?.toFixed(2) || "0.00"}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {new Date(transaction.createdAt).toLocaleDateString()}
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
                          <h3 className="mt-4 font-medium">No transactions found</h3>
                          <p className="text-sm text-muted-foreground">
                            Your transaction history will appear here
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}