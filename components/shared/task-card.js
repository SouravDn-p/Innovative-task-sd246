import { ClipboardCheck, Coins, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";
import { useState } from "react";

const difficultyConfig = {
  easy: { color: "bg-green-100 text-green-800", flames: 1 },
  medium: { color: "bg-yellow-100 text-yellow-800", flames: 2 },
  hard: { color: "bg-red-100 text-red-800", flames: 3 },
};

export function TaskCard({ title, reward, description, difficulty, taskId, user }) {
  const config = difficultyConfig[difficulty];
  const [taskStarted, setTaskStarted] = useState(false);

  const handleStartTask = async () => {
    if (taskStarted) {
      Swal.fire({
        icon: "warning",
        title: "Task already started",
        text: "You can only start one task at a time.",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: `Start "${title}"?`,
      text: `You're about to start this ${difficulty} task for $${reward}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, start task!",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch("/api/start-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          userName: user.name,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start task");

      setTaskStarted(true);

      Swal.fire({
        icon: "success",
        title: "Task Started!",
        text: "Your task has been started successfully.",
      });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
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
          <Badge className={config.color}>
            <div className="flex items-center gap-1">
              {Array.from({ length: config.flames }).map((_, i) => (
                <Flame key={i} className="h-3 w-3" />
              ))}
              <span className="capitalize text-xs">{difficulty}</span>
            </div>
          </Badge>
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
