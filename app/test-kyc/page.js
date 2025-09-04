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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetAdvertiserWalletQuery,
  useAddAdvertiserFundsMutation,
} from "@/redux/api/api";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
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
} from "lucide-react";

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

export default function AdvertiserWalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State management
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

  // Add funds dialog
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [addFundsData, setAddFundsData] = useState({
    amount: "",
    description: "",
  });

  // Redux hooks
  const {
    data: walletData,
    isLoading,
    isError,
    refetch,
  } = useGetAdvertiserWalletQuery(filters);

  const [addFunds, { isLoading: isAddingFunds }] = useAddAdvertiserFundsMutation();

  // Update local state when data changes
  useEffect(() => {
    if (walletData?.pagination) {
      setPagination(walletData.pagination);
    }
  }, [walletData]);

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

  // Handle add funds
  const handleAddFunds = async () => {
    if (!addFundsData.amount || parseFloat(addFundsData.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await addFunds({
        amount: parseFloat(addFundsData.amount),
        description: addFundsData.description || "Wallet top-up",
      }).unwrap();

      toast({
        title: "Success",
        description: "Funds added successfully!",
      });

      setShowAddFunds(false);
      setAddFundsData({ amount: "", description: "" });
      refetch(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: error?.data?.error || "Failed to add funds",
        variant: "destructive",
      });
    }
  };

  // Format transaction type
  const getTransactionTypeDisplay = (type, description) => {
    switch (type) {
      case "credit":
        return (
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Credit
          </Badge>
        );
      case "debit":
        return (
          <Badge
            variant="outline"
            className="text-red-600 border-red-200 bg-red-50"
          >
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Debit
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const transactions = walletData?.transactions || [];
  const wallet = walletData?.wallet || null;

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-teal-800">Loading...</span>
      </div>
    );
  }

  if (status !== "authenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header Section */}
      <motion.section
        initial="hidden"
        animate="show"
        variants={fadeInUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-white shadow-lg my-12 mx-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
              Advertiser Wallet
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Manage your wallet balance and track your task spending.
            </p>
          </div>

          {wallet && (
            <div className="lg:text-right">
              <p className="text-white/80 text-sm mb-2">Current Balance</p>
              <p className="text-4xl lg:text-5xl font-bold">
                ₹
                {wallet.balance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          )}
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Wallet Overview Cards */}
        {wallet && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <motion.div variants={fadeInUp}>
              <Card className="border-teal-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Current Balance
                      </p>
                      <p className="text-2xl font-bold text-teal-700">
                        ₹
                        {wallet.balance.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-teal-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold text-blue-700">
                        ₹
                        {wallet.totalSpent.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">
                        Total Credits
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹
                        {wallet.totalCredits.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="border-orange-200">
                <CardContent className="p-6 flex items-center justify-center">
                  <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Funds
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Funds to Wallet</DialogTitle>
                        <DialogDescription>
                          Add money to your advertiser wallet to create tasks.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="amount">Amount (₹)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={addFundsData.amount}
                            onChange={(e) =>
                              setAddFundsData((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                            min="1"
                            max="100000"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">
                            Description (Optional)
                          </Label>
                          <Input
                            id="description"
                            placeholder="Enter description"
                            value={addFundsData.description}
                            onChange={(e) =>
                              setAddFundsData((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddFunds(false)}
                          disabled={isAddingFunds}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAddFunds}
                          disabled={isAddingFunds || !addFundsData.amount}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          {isAddingFunds ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Funds
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Filters and Controls */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="bg-white border border-slate-200 rounded-lg p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="From Date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                className="w-full sm:w-40"
              />

              <Input
                type="date"
                placeholder="To Date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                className="w-full sm:w-40"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={applyFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Apply
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={refetch} disabled={isLoading}>
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div variants={fadeInUp} initial="hidden" animate="show">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>
                    {pagination.totalTransactions > 0
                      ? `Showing ${
                          (pagination.currentPage - 1) * filters.limit + 1
                        }-${Math.min(
                          pagination.currentPage * filters.limit,
                          pagination.totalTransactions
                        )} of ${pagination.totalTransactions} transactions`
                      : "No transactions found"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin text-teal-600" />
                  <span className="ml-2 text-teal-800">
                    Loading transactions...
                  </span>
                </div>
              ) : isError ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-red-900 mb-2">
                    Error loading transactions
                  </h3>
                  <p className="text-red-600">
                    There was an error loading your transaction history. Please
                    try again.
                  </p>
                  <Button
                    className="mt-4 bg-teal-600 hover:bg-teal-700"
                    onClick={refetch}
                  >
                    Retry
                  </Button>
                </div>
              ) : transactions.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction._id}>
                          <TableCell className="font-medium">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell>
                            {getTransactionTypeDisplay(
                              transaction.type,
                              transaction.description
                            )}
                          </TableCell>
                          <TableCell>
                            <div
                              className="max-w-xs truncate"
                              title={transaction.description}
                            >
                              {transaction.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {transaction.reference}
                            </code>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              transaction.type === "credit"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₹
                            {transaction.amount.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹
                            {transaction.balanceAfter.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-slate-600">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              pagination.currentPage - 1
                            )
                          }
                          disabled={!pagination.hasPrev}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              pagination.currentPage + 1
                            )
                          }
                          disabled={!pagination.hasNext}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-slate-600">
                    {Object.entries(filters).some(
                      ([key, value]) =>
                        value &&
                        key !== "page" &&
                        key !== "limit" &&
                        value !== "all"
                    )
                      ? "Try adjusting your filters to see more results."
                      : "Your transaction history will appear here as you use your wallet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}