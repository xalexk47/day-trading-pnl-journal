import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trade Discipline | Futures Journal",
  description: "Your futures trading calendar, execution checklist, and weekly performance review.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
