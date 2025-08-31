"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null; // evita "flash" de ícone errado

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className={[
        "inline-flex items-center justify-center rounded-full",
        "shadow dark:border-gray-700 cursor-pointer",
        "bg-white dark:bg-neutral-900",
        "text-gray-700 dark:text-gray-200",
        "hover:bg-gray-50 dark:hover:bg-neutral-600",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "h-10 w-10 transition",
      ].join(" ")}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
