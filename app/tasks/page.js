"use client";

import { useState } from "react";
import { Search, Filter, ArrowUpDown, Target, TrendingUp } from "lucide-react";
import { TaskCard } from "@/components/shared/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample task data
const tasks = [
  {
    id: 1,
    title: "Write Product Review",
    reward: 15,
    description:
      "Write a detailed review for a new tech product. Include pros, cons, and your overall rating.",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "Social Media Campaign",
    reward: 45,
    description:
      "Create and manage a social media campaign for a small business. Includes content creation and scheduling.",
    difficulty: "medium",
  },
  {
    id: 3,
    title: "Website Development",
    reward: 120,
    description:
      "Build a responsive landing page using modern web technologies. Must include mobile optimization.",
    difficulty: "hard",
  },
  {
    id: 4,
    title: "Data Entry Project",
    reward: 25,
    description:
      "Organize and input customer data into a spreadsheet. Attention to detail is crucial.",
    difficulty: "easy",
  },
  {
    id: 5,
    title: "Logo Design",
    reward: 75,
    description:
      "Design a professional logo for a startup company. Multiple concepts and revisions included.",
    difficulty: "medium",
  },
  {
    id: 6,
    title: "Mobile App Testing",
    reward: 35,
    description:
      "Test a mobile application across different devices and report bugs and usability issues.",
    difficulty: "medium",
  },
  {
    id: 7,
    title: "Content Translation",
    reward: 55,
    description:
      "Translate marketing content from English to Spanish. Native-level fluency required.",
    difficulty: "medium",
  },
  {
    id: 8,
    title: "AI Model Training",
    reward: 200,
    description:
      "Help train and fine-tune machine learning models. Requires advanced technical knowledge.",
    difficulty: "hard",
  },
];

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reward-desc");

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "all" || task.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "reward-desc":
          return b.reward - a.reward;
        case "reward-asc":
          return a.reward - b.reward;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Complete Tasks,{" "}
                <span className="text-primary">Earn Rewards</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of users earning money by completing simple
                tasks. From data entry to creative projects, find opportunities
                that match your skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8">
                  <Target className="mr-2 h-5 w-5" />
                  Start Earning Today
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 bg-transparent"
                >
                  Learn How It Works
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Controls */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Select
                  value={difficultyFilter}
                  onValueChange={setDifficultyFilter}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reward-desc">Highest Reward</SelectItem>
                    <SelectItem value="reward-asc">Lowest Reward</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} available
              </div>
            </div>
          </div>
        </section>

        {/* Tasks Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    title={task.title}
                    reward={task.reward}
                    description={task.description}
                    difficulty={task.difficulty}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria to find more
                    tasks.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-muted/50 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto">
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join our community of earners and start completing tasks today.
                The more you complete, the higher your earning potential
                becomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="px-8">
                  Browse All Tasks
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 bg-transparent"
                >
                  View Earning Stats
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
