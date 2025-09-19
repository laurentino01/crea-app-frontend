"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import SideNav from "@/components/SideNav";
import { ThemeProvider } from "next-themes";
import Header from "@/components/Header";
import DevMockInitializer from "@/components/DevMockInitializer";
import { useEffect, useState } from "react";
import { getUserData, isLogged } from "@/usecases/authCases";
import { authService } from "@/services/api/AuthService";
import { redirect, usePathname } from "next/navigation";
import { SessionContext } from "@/providers/SessionProvider";
import { tUserSession } from "@/@types/tUser";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sessionUser, setSessionUser] = useState<tUserSession | null>(null);
  const params = usePathname();

  useEffect(() => {
    if (!isLogged(authService)) {
      alert("Login expirado, por favor faça novamente o login :)");
      redirect("login");
    }
  }, [params]);
  useEffect(() => {
    if (!isLogged(authService)) {
      return;
    }
    setSessionUser(getUserData(authService));
  }, []);

  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className="bg-neutral-200 dark:bg-neutral-950"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <SessionContext value={sessionUser}>
          <ThemeProvider
            attribute="class" // aplica "dark" no <html>
            defaultTheme="system" // segue o sistema no primeiro load
            enableSystem
            disableTransitionOnChange // evita flicker de transição
          >
            <div className="flex">
              <SideNav />

              <main className="overflow-auto flex-1 p-5 min-h-[200vh]">
                {/* Inicializa mocks opcionalmente via env var */}
                <DevMockInitializer />
                <Header />
                {children}
              </main>
            </div>
          </ThemeProvider>
        </SessionContext>
      </body>
    </html>
  );
}
