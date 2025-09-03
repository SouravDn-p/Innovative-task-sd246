"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// Mock data for active tasks
const mockActiveTasks = [
  {
    id: "TASK001",
    title: "Social Media Promotion",
    description: "Share our product on your social media platforms",
    budget: 500,
    spent: 250,
    clicks: 1250,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-02-15",
    submissions: 42,
    approvalRate: 85,
  },
  {
    id: "TASK002",
    title: "Product Review",
    description: "Write a detailed review of our product",
    budget: 1000,
    spent: 750,
    clicks: 890,
    status: "active",
    startDate: "2024-01-10",
    endDate: "2024-02-10",
    submissions: 28,
    approvalRate: 92,
  },
  {
    id: "TASK003",
    title: "Video Testimonial",
    description: "Create a 60-second video testimonial",
    budget: 1500,
    spent: 1200,
    clicks: 2100,
    status: "active",
    startDate: "2024-01-05",
    endDate: "2024-02-05",
    submissions: 15,
    approvalRate: 78,
  },
];

export default function ActiveTasksPage() {
  const router = useRouter();
  const [activeTasks, setActiveTasks] = useState(mockActiveTasks);
  const [filter, setFilter] = useState("all");

  const filteredTasks = activeTasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Active Tasks</h1>
            <p className="text-sm text-muted-foreground">
              Manage your ongoing campaigns
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/advertiser/create-task")}
          >
            Create New Task
          </Button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-xs text-muted-foreground">Active Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-accent">₹2,250</div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">85</div>
              <div className="text-xs text-muted-foreground">
                Avg Approval %
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">85</div>
              <div className="text-xs text-muted-foreground">
                Total Submissions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All Tasks
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "paused" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("paused")}
          >
            Paused
          </Button>
        </div>

        {/* Active Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="border-teal-200 hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Budget</p>
                    <p className="text-lg font-bold">₹{task.budget}</p>
                    <p className="text-xs text-muted-foreground">
                      Spent: ₹{task.spent}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Clicks</p>
                    <p className="text-lg font-bold">{task.clicks}</p>
                    <p className="text-xs text-muted-foreground">
                      {((task.clicks / task.budget) * 10).toFixed(1)} per ₹10
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submissions</p>
                    <p className="text-lg font-bold">{task.submissions}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.approvalRate}% approval
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Timeline</p>
                    <p className="text-xs">
                      {new Date(task.startDate).toLocaleDateString()} -{" "}
                      {new Date(task.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
