"use client";

import { useState, useRef } from "react";
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
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { motion, useScroll, useTransform } from "framer-motion";

// Sample task data
const tasks = [
  {
    id: 1,
    title: "Write Product Review",
    reward: 150,
    description:
      "Write a detailed review for a new tech product. Include pros, cons, and your overall rating.",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "Social Media Campaign",
    reward: 450,
    description:
      "Create and manage a social media campaign for a small business. Includes content creation and scheduling.",
    difficulty: "medium",
  },
  {
    id: 3,
    title: "Website Development",
    reward: 1200,
    description:
      "Build a responsive landing page using modern web technologies. Must include mobile optimization.",
    difficulty: "hard",
  },
  {
    id: 4,
    title: "Data Entry Project",
    reward: 250,
    description:
      "Organize and input customer data into a spreadsheet. Attention to detail is crucial.",
    difficulty: "easy",
  },
  {
    id: 5,
    title: "Logo Design",
    reward: 750,
    description:
      "Design a professional logo for a startup company. Multiple concepts and revisions included.",
    difficulty: "medium",
  },
  {
    id: 6,
    title: "Mobile App Testing",
    reward: 350,
    description:
      "Test a mobile application across different devices and report bugs and usability issues.",
    difficulty: "medium",
  },
  {
    id: 7,
    title: "Content Translation",
    reward: 550,
    description:
      "Translate marketing content from English to Spanish. Native-level fluency required.",
    difficulty: "medium",
  },
  {
    id: 8,
    title: "AI Model Training",
    reward: 2000,
    description:
      "Help train and fine-tune machine learning models. Requires advanced technical knowledge.",
    difficulty: "hard",
  },
];

// Animation Presets
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
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

  const bannerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: bannerRef });
  const yText = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Background ornaments */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] absolute inset-0 bg-[linear-gradient(to_right,rgba(13,148,136,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,148,136,0.06)_1px,transparent_1px)] bg-[size:24px_24px] md:bg-[size:32px_32px]" />
        <div className="absolute -top-32 -left-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-200/40 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 md:h-80 md:w-80 rounded-full bg-teal-300/50 blur-3xl animate-pulse-slow" />
      </div>

      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Section with Inspiring Quote */}
        <section
          ref={bannerRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 to-teal-400 p-8 md:p-12 lg:p-16 text-center text-white shadow-lg my-12"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(1000px_400px_at_50%_-10%,white,transparent)]"
          />
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

        {/* Hero Section */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="py-12 md:py-16 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-slate-900">
              Complete Tasks,{" "}
              <span className="bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
                Earn Rewards
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
              Join thousands of users earning money by completing simple tasks.
              From data entry to creative projects, find opportunities that match
              your skills.
            </p>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div variants={fadeInLeft} whileHover={hoverScale}>
                <Button
                  size="lg"
                  className="px-8 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Start Earning Today
                </Button>
              </motion.div>
              <motion.div variants={fadeInRight} whileHover={hoverScale}>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 border-teal-200 text-teal-700 hover:bg-teal-100 bg-transparent"
                >
                  Learn How It Works
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Filter Controls */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="py-8 border-b border-teal-100"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <motion.div variants={fadeInLeft} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-600" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-teal-50 border-teal-200 text-slate-800"
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
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
                  </SelectContent>
                </Select>
              </motion.div>

              <motion.div variants={fadeInRight}>
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
              </motion.div>
            </div>

            <motion.div
              variants={fadeInUp}
              className="text-sm text-slate-600"
            >
              {filteredTasks.length} task
              {filteredTasks.length !== 1 ? "s" : ""} available
            </motion.div>
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
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  variants={fadeInUp}
                  whileHover={hoverScale}
                >
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
            <motion.div
              variants={fadeInUp}
              className="text-center py-12"
            >
              <div className="max-w-md mx-auto">
                <Target className="h-12 w-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-slate-900">No tasks found</h3>
                <p className="text-slate-600">
                  Try adjusting your search or filter criteria to find more tasks.
                </p>
              </div>
            </motion.div>
          )}
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="py-16 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg"
        >
          <div className="text-center">
            <div className="max-w-2xl mx-auto">
              <TrendingUp className="h-12 w-12 text-teal-600 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-700">
                Ready to Start Earning?
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Join our community of earners and start completing tasks today.
                The more you complete, the higher your earning potential becomes.
              </p>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.div variants={fadeInLeft} whileHover={hoverScale}>
                  <Button
                    size="lg"
                    className="px-8 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Browse All Tasks
                  </Button>
                </motion.div>
                <motion.div variants={fadeInRight} whileHover={hoverScale}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 border-teal-200 text-teal-700 hover:bg-teal-100 bg-transparent"
                  >
                    View Earning Stats
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}