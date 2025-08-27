import { ClipboardCheck, Coins, Flame, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStartTaskMutation } from "@/redux/api/api";

const difficultyConfig = {
  easy: { color: "bg-green-100 text-green-800", flames: 1 },
  medium: { color: "bg-yellow-100 text-yellow-800", flames: 2 },
  hard: { color: "bg-red-100 text-red-800", flames: 3 },
  unknown: { color: "bg-gray-100 text-gray-800", flames: 0 },
};

export function TaskCard({ title, reward, description, difficulty, taskId }) {
  console.log({ title, reward, description, difficulty, taskId });
  const normalizedDifficulty = difficultyConfig[difficulty]
    ? difficulty
    : "unknown";
  const config = difficultyConfig[normalizedDifficulty];
  const [taskStarted, setTaskStarted] = useState(false);
  const [startTask] = useStartTaskMutation();
  const { data: session, status } = useSession(); // Use useSession hook

  const handleStartTask = async () => {
    if (taskStarted) {
      Swal.fire({
        icon: "warning",
        title: "Task already started",
        text: "You can only start one task at this time.",
      });
      return;
    }

    // Handle session loading or unauthenticated state
    if (status === "loading") {
      Swal.fire({
        icon: "info",
        title: "Loading...",
        text: "Please wait while we check your session.",
      });
      return;
    }

    if (status === "unauthenticated" || !session) {
      Swal.fire({
        icon: "error",
        title: "Not logged in",
        text: "Please log in to start a task.",
      });
      return;
    }

    // Validate user data from session
    if (!session.user.name || !session.user.email) {
      Swal.fire({
        icon: "error",
        title: "User data incomplete",
        text: "Please ensure your profile has a name and email.",
      });
      return;
    }

    // Check user role and KYC status
    if (session.user.role === "user" && session.user.kycStatus !== "verified") {
      Swal.fire({
        icon: "warning",
        title: "KYC  Required",
        text: "You need to complete KYC verification to start tasks.",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Go to KYC Verification",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          // Redirect to KYC verification page (adjust URL as needed)
          window.location.href = "/kyc-verification"; // Replace with actual KYC page URL
        }
      });
      return;
    }

    const confirm = await Swal.fire({
      title: `Start "${title}"?`,
      text: `You're about to start this ${normalizedDifficulty} task for $${reward}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, start task!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    const payload = {
      taskId,
      userName: session?.user?.name,
      userEmail: session?.user?.email,
    };
    console.log("Sending payload:", payload); // Debug payload

    try {
      await startTask(payload).unwrap();

      setTaskStarted(true);

      Swal.fire({
        icon: "success",
        title: "Task Started!",
        text: "Your task has been assigned successfully.",
      });
    } catch (err) {
      console.error("Start task error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.data?.message || "Failed to start task",
      });
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg leading-tight">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={config.color}>
              <div className="flex items-center gap-1">
                {Array.from({ length: config.flames }).map((_, i) => (
                  <Flame key={i} className="h-3 w-3" />
                ))}
                <span className="capitalize text-xs">
                  {normalizedDifficulty}
                </span>
              </div>
            </Badge>
            {session?.user?.role === "user" &&
              session?.user?.kycStatus !== "verified" && (
                <Badge className="bg-orange-100 text-orange-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span className="text-xs">KYC Required</span>
                </Badge>
              )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm mb-4 flex-grow leading-relaxed">
          {description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-primary font-semibold">
            <Coins className="h-4 w-4" />
            <span>${reward}</span>
          </div>
          <Button
            size="sm"
            className="px-4 bg-teal-500 hover:bg-teal-600"
            onClick={handleStartTask}
            disabled={taskStarted}
          >
            {taskStarted ? "Task In Progress" : "Start Task"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
