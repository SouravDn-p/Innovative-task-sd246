"use client";

import { useState, useRef } from "react";
import { Search, Filter, ArrowUpDown, Target } from "lucide-react";
import { TaskCard } from "@/components/shared/task-card";
import { Input } from "@/components/ui/input";
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

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reward-desc");
  const [activeTab, setActiveTab] = useState("tasks");

  const bannerRef = useRef(null);

  // Fetch tasks using Redux Toolkit Query
  const { data: tasks = [], isLoading, error } = useGetTasksQuery();

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty =
        difficultyFilter === "all" ||
        (task.difficulty || "unknown") === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "reward-desc":
          return b.rateToUser - a.rateToUser;
        case "reward-asc":
          return a.rateToUser - b.rateToUser;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Header />

      {/* Banner Section */}
      <section
        ref={bannerRef}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-center text-white shadow-lg my-12"
      >
        <div className="relative space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Your Skills, Your Success
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            - Anonymous | Turn your talents into earnings with TaskEarn Pro.
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-teal-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-600" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-teal-50 border-teal-200 text-slate-800"
              />
            </div>

            <div>
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-full sm:w-40 bg-teal-50 border-teal-200 text-slate-800">
                  <Filter className="mr-2 h-4 w-4 text-teal-600" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-40 bg-teal-50 border-teal-200 text-slate-800">
                  <ArrowUpDown className="mr-2 h-4 w-4 text-teal-600" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reward-desc">Highest Reward</SelectItem>
                  <SelectItem value="reward-asc">Lowest Reward</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}{" "}
            available
          </div>
        </div>
      </section>

      {/* Tasks Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-teal-600 mx-auto mb-4 animate-spin" />
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            {error.data?.message || "Failed to load tasks"}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div key={task._id?.$oid || Math.random()}>
                <TaskCard
                  title={task.title || "Untitled Task"}
                  reward={task.rateToUser || 0}
                  description={task.description || "No description available"}
                  difficulty={task.difficulty || "unknown"}
                  taskId={task._id || "unknown-id"}
                  className="border border-teal-100/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-teal-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <p>No tasks found. Adjust your filters or search.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
