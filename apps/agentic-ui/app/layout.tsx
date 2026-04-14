import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo 4 — Agentic UI",
  description: "Conversational AI that builds and refines UI through dialogue",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
