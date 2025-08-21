import { ClipboardCheck, Coins, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";

const difficultyConfig = {
  easy: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    flames: 1,
  },
  medium: {
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    flames: 2,
  },
  hard: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    flames: 3,
  },
};

export function TaskCard({ title, reward, description, difficulty }) {
  const config = difficultyConfig[difficulty];

  const handleStartTask = async () => {
    const result = await Swal.fire({
      title: `Start "${title}"?`,
      text: `You're about to start this ${difficulty} task for $${reward}. Are you ready?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, start task!",
      cancelButtonText: "Cancel",
      background: "#ffffff",
      customClass: {
        popup: "rounded-lg shadow-xl",
        title: "text-xl font-semibold",
        content: "text-gray-600",
        confirmButton: "px-6 py-2 rounded-md font-medium",
        cancelButton: "px-6 py-2 rounded-md font-medium",
      },
    });

    if (result.isConfirmed) {
      // Simulate task completion process
      await Swal.fire({
        title: "Task Started!",
        text: "Redirecting you to the task workspace...",
        icon: "success",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#ffffff",
        customClass: {
          popup: "rounded-lg shadow-xl",
          title: "text-xl font-semibold text-green-600",
          content: "text-gray-600",
        },
      });

      // Simulate task completion after a delay
      setTimeout(async () => {
        await Swal.fire({
          title: "Congratulations! 🎉",
          html: `
            <div class="text-center">
              <div class="text-6xl mb-4">✅</div>
              <p class="text-lg mb-2">Task completed successfully!</p>
              <p class="text-2xl font-bold text-green-600">+$${reward} earned</p>
              <p class="text-sm text-gray-500 mt-2">Your earnings have been added to your account</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#10b981",
          confirmButtonText: "Awesome!",
          background: "#ffffff",
          customClass: {
            popup: "rounded-lg shadow-xl",
            confirmButton: "px-8 py-3 rounded-md font-medium text-lg",
          },
        });
      }, 3000);
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
          >
            Start Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
