import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Phnom Penh Tour Tracker",
  description: "Bookings & Profit Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`app-shell ${bricolageGrotesque.className}`}>
        <Navigation />
        <main className="app-main">
          {children}
        </main>
      </body>
    </html>
  );
}
