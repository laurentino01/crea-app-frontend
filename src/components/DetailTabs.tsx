"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  useEffect(() => {
    const readHash = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const computedActive = activeHref || hash || (items[0]?.href ?? "");

  const basePath = useMemo(() => {
    if (!pathname) return "";
    // Consider relative (non-absolute, non-hash) items as potential suffixes
    const relItems = items
      .map((i) => i.href)
      .filter((h) => h && !h.startsWith("/") && !h.startsWith("#")) as string[];

    for (const rel of relItems) {
      const suffix = `/${rel}`;
      if (pathname.endsWith(suffix)) {
        return pathname.slice(0, -suffix.length) || "/";
      }
    }
    return pathname;
  }, [items, pathname]);

  function resolveHref(href: string): string {
    // Hash link
    if (href.startsWith("#")) return href;
    // Absolute path
    if (href.startsWith("/")) return href;
    // Relative path
    if (!href) return basePath || "/";
    const sep = basePath.endsWith("/") ? "" : "/";
    return `${basePath}${sep}${href}`;
  }

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
          const target = resolveHref(item.href);
          // Active rules:
          // - Hash links: active when hash matches
          // - Route links: active when pathname equals resolved target
          const isHash = item.href.startsWith("#");
          const isActive = isHash
            ? (computedActive || hash) === item.href
            : pathname === target;
          return (
            <Link
              key={item.href + item.label}
              href={target}
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
