"use client";

import { useState, useRef } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Target,
  Clock,
  Users,
  MapPin,
  Award,
  RefreshCw,
} from "lucide-react";
import { TaskCard } from "@/components/shared/task-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useGetTasksQuery } from "@/redux/api/api";
import { useSession } from "next-auth/react";

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reward-desc");
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  const bannerRef = useRef(null);
  const { data: session } = useSession();

  // Fetch tasks using Redux Toolkit Query with proper parameters
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useGetTasksQuery({
    search: searchTerm,
    type: categoryFilter !== "all" ? categoryFilter : "",
  });

  // Task categories based on API structure
  const taskCategories = [
    { value: "all", label: "All Categories" },
    { value: "video", label: "Video Tasks" },
    { value: "install", label: "App Install" },
    { value: "share", label: "Social Share" },
    { value: "review", label: "Reviews" },
    { value: "social", label: "Social Media" },
    { value: "custom", label: "Custom Tasks" },
  ];

  // Enhanced filtering and sorting (API already returns only available tasks)
  const filteredTasks = tasks
    .filter((task) => {
      // Basic search filter
      const matchesSearch =
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "all" ||
        task.type === categoryFilter ||
        task.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "reward-desc":
          return (
            (b.rateToUser || b.reward || 0) - (a.rateToUser || a.reward || 0)
          );
        case "reward-asc":
          return (
            (a.rateToUser || a.reward || 0) - (b.rateToUser || b.reward || 0)
          );
        case "title":
          return (a.title || "").localeCompare(b.title || "");
        case "deadline":
          return new Date(a.endAt || 0) - new Date(b.endAt || 0);
        case "slots":
          return (b.remainingSlots || 0) - (a.remainingSlots || 0);
        default:
          return 0;
      }
    });

  // Calculate statistics (API now returns only available tasks)
  const stats = {
    total: tasks.length, // All returned tasks are available
    available: tasks.length, // Same as total since API filters
    totalReward: tasks.reduce(
      (sum, t) => sum + (t.rateToUser || t.reward || 0),
      0
    ),
    categories: [
      ...new Set(tasks.map((t) => t.type || t.category).filter(Boolean)),
    ].length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50">
      <Header />

      {/* Enhanced Banner Section */}
      <section
        ref={bannerRef}
        className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 p-8 md:p-12 lg:p-16 text-center text-white shadow-2xl mx-4 mt-8 rounded-2xl"
      >
        <div className="relative space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-extrabold tracking-tight">
              Discover Amazing Tasks
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users earning money by completing admin-approved
              tasks. Your skills, your success, your rewards.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.total}
              </div>
              <div className="text-sm text-white/80">Total Tasks</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.available}
              </div>
              <div className="text-sm text-white/80">Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">
                ₹{stats.totalReward.toLocaleString()}
              </div>
              <div className="text-sm text-white/80">Total Rewards</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl md:text-3xl font-bold">
                {stats.categories}
              </div>
              <div className="text-sm text-white/80">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <section className="py-8 mx-4">
        <Card className="border-teal-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                <Input
                  placeholder="Search tasks by title, description, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-base border-teal-200 focus:border-teal-500 bg-white"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-48 bg-white border-teal-200">
                      <Filter className="mr-2 h-4 w-4 text-teal-600" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 bg-white border-teal-200">
                      <ArrowUpDown className="mr-2 h-4 w-4 text-teal-600" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reward-desc">
                        Highest Reward
                      </SelectItem>
                      <SelectItem value="reward-asc">Lowest Reward</SelectItem>
                      <SelectItem value="deadline">Deadline Soon</SelectItem>
                      <SelectItem value="slots">
                        Most Slots Available
                      </SelectItem>
                      <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available-only"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-teal-300 rounded focus:ring-teal-500"
                    />
                    <label
                      htmlFor="available-only"
                      className="text-sm text-teal-700"
                    >
                      {session?.user ? "Available for me" : "Available only"}
                    </label>
                  </div>

                  <Badge
                    variant="outline"
                    className="border-teal-200 text-teal-700"
                  >
                    {filteredTasks.length} task
                    {filteredTasks.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Tasks Grid */}
      <section className="pb-12 mx-4">
        {isLoading ? (
          <div className="text-center py-20">
            <Target className="h-16 w-16 text-teal-500 mx-auto mb-6 animate-spin" />
            <h3 className="text-xl font-semibold text-teal-900 mb-2">
              Loading Amazing Tasks...
            </h3>
            <p className="text-teal-600">
              Please wait while we fetch the latest opportunities for you.
            </p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">
                Failed to Load Tasks
              </h3>
              <p className="text-red-700 mb-4">
                {error?.data?.message ||
                  error?.message ||
                  "Something went wrong while loading tasks"}
              </p>
              <button
                onClick={() => refetch()}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.map((task) => {
              // Enhanced task data structure for TaskCard
              const enhancedTask = {
                ...task,
                // Normalize task ID
                taskId: task._id || task.id,
                // Ensure reward is properly formatted
                reward: task.rateToUser || task.reward || 0,
                // Add computed difficulty based on reward
                difficulty:
                  task.difficulty ||
                  ((task.rateToUser || 0) >= 100
                    ? "hard"
                    : (task.rateToUser || 0) >= 50
                    ? "medium"
                    : "easy"),
                // Additional display data
                category: task.type || task.category || "general",
                remainingSlots:
                  task.remainingSlots ||
                  Math.max(
                    0,
                    (task.limitCount || 0) - (task.assignedCount || 0)
                  ),
                totalSlots: task.limitCount || 0,
                endDate: task.endAt,
                estimatedTime: task.estimatedTime || "30 mins",
                isAvailable: task.isAvailable,
                isJoined: task.isJoined,
                // Admin approval status
                adminApproved: task.status === "approved",
                // Task creator info
                createdBy: task.createdBy || "advertiser",
                creator: task.name || task.gmail?.split("@")[0] || "Unknown",
              };

              return (
                <div key={enhancedTask.taskId} className="group">
                  <TaskCard
                    {...enhancedTask}
                    className="border border-teal-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-teal-200 group-hover:scale-105"
                  />

                  {/* Additional task info overlay */}
                  <div className="mt-2 px-2">
                    <div className="flex items-center justify-between text-xs text-teal-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>
                          {enhancedTask.remainingSlots}/
                          {enhancedTask.totalSlots} slots
                        </span>
                      </div>
                      {enhancedTask.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(enhancedTask.endDate) > new Date()
                              ? `Ends ${new Date(
                                  enhancedTask.endDate
                                ).toLocaleDateString()}`
                              : "Expired"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="border-teal-200">
            <CardContent className="p-12 text-center">
              <Target className="h-16 w-16 text-teal-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-teal-900 mb-2">
                {searchTerm || categoryFilter !== "all"
                  ? "No matching tasks found"
                  : "No tasks available"}
              </h3>
              <p className="text-teal-600 mb-6">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your search criteria or filters to find more tasks."
                  : "Check back later for new task opportunities."}
              </p>
              {(searchTerm || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                  }}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </div>
  );
}
