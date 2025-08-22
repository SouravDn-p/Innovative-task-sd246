import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import SessionWrapper from "@/components/SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Innovative Task Earn - Task & Referral Platform",
  description: "Professional task and referral earning platform",
  icons: {
    icon: "/logos/logo.png"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <SessionWrapper>
            {children}
          </SessionWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
