import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Canvas — Generative UI POC",
  description: "AI-driven address servicing with context-aware, persona-adaptive UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
