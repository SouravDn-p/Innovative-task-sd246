import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  T
                </span>
              </div>
              <span className="font-bold text-xl">Innovative Task Earn</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Empowering users to earn through tasks and referrals while helping
              businesses grow their reach.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/login"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Register
              </Link>
            </div>
          </div>

          {/* For Users */}
          <div className="space-y-4">
            <h3 className="font-semibold">For Users</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/user"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/user/tasks"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Available Tasks
              </Link>
              <Link
                href="/user/referrals"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Referrals
              </Link>
              <Link
                href="/wallet"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Wallet
              </Link>
            </div>
          </div>

          {/* For Businesses */}
          <div className="space-y-4">
            <h3 className="font-semibold">For Businesses</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/advertiser"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Advertiser Dashboard
              </Link>
              <Link
                href="/advertiser/campaigns"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Campaign
              </Link>
              <Link
                href="/advertiser/analytics"
                className="block text-muted-foreground hover:text-foreground transition-colors"
              >
                Analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Innovative Task Earn. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
