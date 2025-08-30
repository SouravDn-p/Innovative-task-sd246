import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/Hero";
import EarnTaskFeatures from "@/components/EarnTaskFeatures/page";
import TaskEarnerHub from "@/components/TaskEarnerHub";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TaskEarnerHub />
      <EarnTaskFeatures />
      <Footer />
    </div>
  );
}
