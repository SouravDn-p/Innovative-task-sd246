"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import { useSession } from "next-auth/react";

function TasksPage() {
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofData, setProofData] = useState({
    images: [],
    links: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: session } = useSession(); // Using session

  const email = session?.user?.email; // Extract email from session

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useGetTasksQuery({
    search: searchTerm,
    status: "available",
    email: email,
  });

  const [submitTaskProof, { isLoading: isSubmitting }] =
    useSubmitTaskProofMutation();

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    try {
      await submitTaskProof({
        taskId: selectedTask.id,
        proof: proofData,
        email: email, // use session email
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()} // Go back to previous page
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">My Tasks</h1>
            <p className="text-sm text-muted-foreground">
              {email ? `Tasks for ${email}` : "Login to see your tasks"}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <Card key={task.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{task.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
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
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
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
                        <DialogContent className="max-w-md">
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
                                {task.requirements?.map((req, index) => (
                                  <li
                                    key={index}
                                    className="flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    {req}
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
    </div>
  );
}

export default TasksPage;
