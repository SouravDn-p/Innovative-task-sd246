import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Target,
  Eye,
  Heart,
  TrendingUp,
  Shield,
  Award,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4">
              About TaskEarn Pro
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Empowering the Future of
              <span className="text-primary block">Digital Earning</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We&apos;re building the world&apos;s most trusted platform where
              users can earn money through meaningful tasks while helping
              businesses achieve authentic growth and engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize earning opportunities by connecting users with
                  meaningful tasks while helping businesses achieve authentic
                  growth through genuine user engagement.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To become the global leader in task-based earning platforms,
                  creating a sustainable ecosystem where everyone benefits from
                  digital collaboration.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Our Values</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Trust, transparency, and fairness guide everything we do. We
                  believe in creating genuine value for both users and
                  businesses in our ecosystem.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
              <p className="text-xl text-muted-foreground">
                From a simple idea to a global platform serving thousands
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">The Beginning</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    TaskEarn Pro was founded in 2023 with a simple observation:
                    millions of people worldwide were looking for flexible
                    earning opportunities, while businesses struggled to find
                    authentic user engagement.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Our founders, experienced in both fintech and digital
                    marketing, saw an opportunity to create a platform that
                    would benefit both sides of this equation.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    2023
                  </div>
                  <div className="text-muted-foreground">Founded</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        50K+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Active Users
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-accent mb-2">
                        1M+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tasks Completed
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        500+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Business Partners
                      </div>
                    </div>
                    <div className="bg-card rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold text-accent mb-2">
                        ₹10Cr+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Paid to Users
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <h3 className="text-2xl font-bold mb-4">Today</h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    We&apos;ve grown into a trusted platform serving over 50,000
                    active users and 500+ businesses across multiple countries.
                    Our users have completed over 1 million tasks and earned
                    more than ₹10 crores collectively.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    But we&apos;re just getting started. Our vision extends far
                    beyond these numbers to create lasting impact in the digital
                    economy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground">
              The passionate individuals building the future of digital earning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">AK</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Arjun Kumar</h3>
                <p className="text-primary font-medium mb-4">
                  CEO & Co-Founder
                </p>
                <p className="text-muted-foreground text-sm">
                  Former fintech executive with 10+ years experience in digital
                  payments and user acquisition.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-accent">SP</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sneha Patel</h3>
                <p className="text-accent font-medium mb-4">CTO & Co-Founder</p>
                <p className="text-muted-foreground text-sm">
                  Tech leader with expertise in scalable platforms and
                  blockchain technology from top tech companies.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">RG</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Rohit Gupta</h3>
                <p className="text-primary font-medium mb-4">
                  Head of Operations
                </p>
                <p className="text-muted-foreground text-sm">
                  Operations expert ensuring smooth platform functioning and
                  exceptional user experience.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trust & Security
            </h2>
            <p className="text-xl text-muted-foreground">
              Your security and trust are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">KYC Verified</h3>
              <p className="text-sm text-muted-foreground">
                All users undergo strict KYC verification
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Certified Platform</h3>
              <p className="text-sm text-muted-foreground">
                ISO certified and compliant with regulations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Global Reach</h3>
              <p className="text-sm text-muted-foreground">
                Serving users across multiple countries
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">Proven Track Record</h3>
              <p className="text-sm text-muted-foreground">
                Consistent growth and user satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto text-white space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Join Our Growing Community
            </h2>
            <p className="text-xl opacity-90">
              Be part of the digital earning revolution. Start your journey with
              TaskEarn Pro today and discover new opportunities to grow your
              income.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="text-lg px-8"
              >
                <Link href="/register">
                  Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                <Link href="/login">Login to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
