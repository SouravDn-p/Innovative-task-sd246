import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Users,
  Wallet,
  Shield,
  TrendingUp,
  Award,
  ArrowRight,
  Star,
  Target,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Professional Task Platform
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                  Earn Money Through
                  <span className="text-primary block">Tasks & Referrals</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Join thousands of professionals earning extra income through
                  verified tasks and referrals. Secure, transparent, and
                  rewarding.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-8"
                >
                  <Link href="/register">
                    Start Earning Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 bg-transparent"
                >
                  <Link href="/how-it-works">Learn How It Works</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₹1500+</div>
                  <div className="text-sm text-muted-foreground">
                    Weekly Earnings
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₹49</div>
                  <div className="text-sm text-muted-foreground">
                    Per Referral
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Complete Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn money by completing verified tasks from trusted
                      advertisers
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-secondary/20 bg-secondary/5 mt-8">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Refer Friends</h3>
                    <p className="text-sm text-muted-foreground">
                      Get ₹49 for every friend who completes KYC verification
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 bg-accent/5 -mt-4">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Instant Payouts</h3>
                    <p className="text-sm text-muted-foreground">
                      Withdraw earnings instantly after reaching minimum balance
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold mb-2">Secure Platform</h3>
                    <p className="text-sm text-muted-foreground">
                      KYC verified users with fraud protection and secure
                      payments
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-4">
              Why Choose EarnTask?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional platform designed for serious earners with
              transparent processes and reliable payouts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Verified Tasks Only</CardTitle>
                <CardDescription>
                  All tasks are verified by our team to ensure legitimacy and
                  fair compensation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Weekly Targets</CardTitle>
                <CardDescription>
                  Maintain activity with ₹1500 weekly earnings or 5 daily
                  referrals to stay active
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">KYC Protected</CardTitle>
                <CardDescription>
                  One-time ₹99 KYC verification unlocks all earning features and
                  withdrawal access
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Instant Credits</CardTitle>
                <CardDescription>
                  Task earnings and referral bonuses are credited instantly to
                  your wallet
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-secondary" />
                </div>
                <CardTitle className="text-xl">Fraud Protection</CardTitle>
                <CardDescription>
                  Advanced fraud detection with random audits to maintain
                  platform integrity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="text-xl">Professional Support</CardTitle>
                <CardDescription>
                  Dedicated support team with role-based management for quick
                  issue resolution
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our professional platform today and start earning through
            verified tasks and referrals. Secure, transparent, and rewarding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              <Link href="/register">
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 bg-transparent"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
