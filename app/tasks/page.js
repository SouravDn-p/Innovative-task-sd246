"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, ArrowUpDown, Target, TrendingUp } from "lucide-react";
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
import { motion, useScroll, useTransform } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.3 },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reward-desc");

  const bannerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: bannerRef });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -20]);

  // Fetch tasks from API
  useEffect(() => {
    async function fetchTasks() {
      try {
        setLoading(true);
        const res = await fetch("/api/task");
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

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
        case "reward-desc": return b.reward - a.reward;
        case "reward-asc": return a.reward - b.reward;
        case "title": return a.title.localeCompare(b.title);
        default: return 0;
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ y: yText }}
          className="relative space-y-4"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">
            Your Skills, Your Success
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            - Anonymous | Turn your talents into earnings with TaskEarn Pro.
          </p>
        </motion.div>
      </section>

      {/* Filter Section */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="py-8 border-b border-teal-100"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
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

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-teal-50 border-teal-200 text-slate-800">
                <Filter className="mr-2 h-4 w-4 text-teal-600" />
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

          <div className="text-sm text-slate-600">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""} available
          </div>
        </div>
      </motion.section>

      {/* Tasks Grid */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="py-12"
      >
        {loading ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-teal-600 mx-auto mb-4 animate-spin" />
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <motion.div key={task._id || task.id} variants={fadeInUp} whileHover={hoverScale}>
                <TaskCard
                  title={task.title}
                  reward={task.reward}
                  description={task.description}
                  difficulty={task.difficulty}
                  className="border border-teal-100/60 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-1 hover:ring-teal-300"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-teal-600 mx-auto mb-4" />
            <p>No tasks found. Adjust your filters or search.</p>
          </div>
        )}
      </motion.section>

      <Footer />
    </div>
  );
}
