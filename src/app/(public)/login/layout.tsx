"use client";

import { ThemeProvider } from "next-themes";
import "../../globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Metadata } from "next";
import { ToastProvider } from "@/hooks/useToast";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="bg-fuchsia-900">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
