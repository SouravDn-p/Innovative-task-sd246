"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  Target,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useGetAdminActiveAdvertisersQuery } from "@/redux/api/api";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAdvertisersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // API queries
  const advertisersQueryParams = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm,
  };

  const {
    data: advertisersData,
    isLoading: advertisersLoading,
    error: advertisersError,
    refetch: refetchAdvertisers,
  } = useGetAdminActiveAdvertisersQuery(advertisersQueryParams, {
    skip: !session || session.user?.role !== "admin",
  });

  const advertisers = advertisersData?.advertisers || [];
  const advertisersPagination = advertisersData?.pagination || {};

  // Redirect if not admin
  if (status === "loading") return null;
  if (!session || session.user?.role !== "admin") {
    router.push("/unauthorized");
    return null;
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">
            Advertiser Management
          </h1>
          <p className="text-teal-600">Manage active advertisers</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-teal-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-teal-500 h-4 w-4" />
              <Input
                placeholder="Search by company name, contact person, or email..."
                className="pl-10 border-teal-200 focus:border-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => refetchAdvertisers()}
              disabled={advertisersLoading}
              className="border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              {advertisersLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Advertisers */}
      <motion.div variants={itemVariants}>
        <Card className="border-teal-200">
          <CardHeader>
            <CardTitle className="text-teal-800">Active Advertisers</CardTitle>
            <CardDescription>
              View performance metrics for all approved advertisers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {advertisersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <span className="ml-2 text-teal-800">
                  Loading advertisers...
                </span>
              </div>
            ) : advertisersError ? (
              <div className="flex items-center justify-center py-8 text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Error loading advertisers:{" "}
                {advertisersError?.data?.error || "Unknown error"}
              </div>
            ) : advertisers.length === 0 ? (
              <div className="text-center py-8 text-teal-600">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active advertisers found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Approved</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {advertisers.map((advertiser) => (
                        <TableRow key={advertiser._id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {advertiser.companyName}
                              </p>
                              <p className="text-sm text-teal-600">
                                {advertiser.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{advertiser.name}</p>
                              <p className="text-sm text-teal-600">
                                {advertiser.phone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="font-medium">
                                  {advertiser.totalTasks}
                                </p>
                                <p className="text-xs text-teal-600">Total</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-blue-600">
                                  {advertiser.activeTasks}
                                </p>
                                <p className="text-xs text-teal-600">Active</p>
                              </div>
                              <div className="text-center">
                                <p className="font-medium text-green-600">
                                  {advertiser.completedTasks}
                                </p>
                                <p className="text-xs text-teal-600">
                                  Completed
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-teal-600" />
                              <span className="font-medium">
                                ₹{advertiser.totalExpense.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-teal-200 rounded-full h-2">
                                <div
                                  className="bg-teal-600 h-2 rounded-full"
                                  style={{
                                    width: `${advertiser.performanceScore}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">
                                {advertiser.performanceScore}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-teal-600" />
                              {advertiser.approvedAt
                                ? new Date(
                                    advertiser.approvedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {(advertisersPagination.hasPrev ||
                  advertisersPagination.hasNext) && (
                  <div className="flex items-center justify-between py-4">
                    <div className="text-sm text-teal-600">
                      Showing{" "}
                      {(advertisersPagination.page - 1) *
                        advertisersPagination.limit +
                        1}{" "}
                      to{" "}
                      {Math.min(
                        advertisersPagination.page *
                          advertisersPagination.limit,
                        advertisersPagination.totalAdvertisers
                      )}{" "}
                      of {advertisersPagination.totalAdvertisers} advertisers
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={!advertisersPagination.hasPrev}
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={!advertisersPagination.hasNext}
                        variant="outline"
                        className="border-teal-200 text-teal-700 hover:bg-teal-50"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
