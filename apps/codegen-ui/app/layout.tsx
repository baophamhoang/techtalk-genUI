import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo 3 — AI Code Generator",
  description: "Mô tả UI bằng tiếng Việt → AI viết React code → Live Preview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased text-white bg-[#0D0D0D]">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
