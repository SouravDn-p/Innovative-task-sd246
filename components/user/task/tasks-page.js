"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle,
  Camera,
  ArrowLeft,
} from "lucide-react";
import { useGetTasksQuery, useSubmitTaskProofMutation } from "@/redux/api/api";
import { useSelector } from "react-redux";

export function TasksPage() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofData, setProofData] = useState({
    images: [],
    links: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useSelector((state) => state.auth);

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useGetTasksQuery({
    search: searchTerm,
    status: "available",
    email: user?.email,
  });

  const [submitTaskProof, { isLoading: isSubmitting }] =
    useSubmitTaskProofMutation();

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    try {
      await submitTaskProof({
        taskId: selectedTask.id,
        proof: proofData,
        email: user?.email,
      }).unwrap();
      setSelectedTask(null);
      setProofData({ images: [], links: "", description: "" });
    } catch (error) {
      console.error("Failed to submit proof:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      case "pending_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Available";
      case "completed":
        return "Completed";
      case "pending_review":
        return "Under Review";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold truncate">My Tasks</h1>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email
                ? `Tasks for ${user.email}`
                : "Login to see your tasks"}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 w-full max-w-full overflow-x-hidden">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3 w-full max-w-full">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card key={task.id} className="relative w-full">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base break-words">
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1 break-words">
                        {task.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-semibold text-primary">
                          ₹{task.reward}
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {task.estimatedTime}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {task.remaining}/{task.total}
                        </div>
                      </div>
                      <Badge variant="outline">{task.category}</Badge>
                    </div>

                    {/* Task actions */}
                    {task.status === "available" && task.remaining > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full"
                            onClick={() => setSelectedTask(task)}
                          >
                            Start Task
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md w-full mx-4">
                          <DialogHeader>
                            <DialogTitle>Submit Proof</DialogTitle>
                            <DialogDescription>
                              Upload proof of completion for: {task.title}
                            </DialogDescription>
                          </DialogHeader>

                          <form
                            onSubmit={handleSubmitProof}
                            className="space-y-4"
                          >
                            <div className="space-y-2">
                              <Label>Requirements:</Label>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {task.requirements.map((req, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-3 w-3 flex-shrink-0" />
                                    <span className="break-words">{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="images">Upload Screenshots</Label>
                              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Click to upload images or drag and drop
                                </p>
                                <Input
                                  id="images"
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="links">
                                Links (if applicable)
                              </Label>
                              <Input
                                id="links"
                                placeholder="Paste relevant links here"
                                value={proofData.links}
                                onChange={(e) =>
                                  setProofData((prev) => ({
                                    ...prev,
                                    links: e.target.value,
                                  }))
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="description">
                                Additional Notes
                              </Label>
                              <Textarea
                                id="description"
                                placeholder="Any additional information..."
                                value={proofData.description}
                                onChange={(e) =>
                                  setProofData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                  }))
                                }
                                rows={3}
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full"
                              disabled={isSubmitting}
                            >
                              {isSubmitting
                                ? "Submitting..."
                                : "Submit for Review"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}

                    {task.status === "completed" && (
                      <Button disabled className="w-full">
                        Task Completed
                      </Button>
                    )}

                    {task.status === "pending_review" && (
                      <Button disabled className="w-full">
                        Under Review
                      </Button>
                    )}

                    {task.remaining === 0 && task.status === "available" && (
                      <Button disabled className="w-full">
                        Task Full
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-4 text-muted-foreground">
              No tasks found for your account.
            </div>
          )}
        </div>
      </div>

      {isLoading && <div className="p-4">Loading tasks...</div>}
      {error && (
        <div className="p-4 text-red-600">
          Error loading tasks: {error.message}
        </div>
      )}
    </div>
  );
}
