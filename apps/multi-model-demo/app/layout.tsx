import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-Model Orchestration Demo",
  description: "Advanced GenUI with intelligent model routing and cost optimization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased text-white bg-gray-900">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
