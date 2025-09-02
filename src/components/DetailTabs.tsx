"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type DetailTabItem = {
  label: string;
  href: string; // can be a hash (e.g. #info) or a route
};

export type DetailTabsProps = {
  items: DetailTabItem[];
  className?: string;
  activeHref?: string; // optional override for active state
  justify?: "start" | "center" | "between" | "end";
};

export default function DetailTabs({
  items,
  className = "",
  activeHref,
  justify = "between",
}: DetailTabsProps) {
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    const readHash = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const computedActive = activeHref || hash || (items[0]?.href ?? "");

  const justifyClass =
    justify === "start"
      ? "justify-start"
      : justify === "center"
      ? "justify-center"
      : justify === "end"
      ? "justify-end"
      : "justify-between";

  return (
    <div
      className={[
        "rounded-full bg-neutral-100 dark:bg-neutral-900 px-6 py-1 mb-4",
        className,
      ].join(" ")}
    >
      <div className={["flex items-center gap-1", justifyClass].join(" ")}
      >
        {items.map((item) => {
          const isActive = computedActive === item.href;
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={[
                "text-sm px-3 py-1 rounded-full transition-colors",
                isActive
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

