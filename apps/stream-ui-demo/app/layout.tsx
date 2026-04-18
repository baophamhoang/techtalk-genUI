import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo 3 — Tool Calling",
  description: "AI tool-calling → pre-built components render instantly",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
