"use client";

import { Bell, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  time?: string; // ex: "2h", "Ontem"
};

type NotificationButtonProps = {
  notifications?: NotificationItem[];
  onItemClick?: (id: string) => void;
  emptyLabel?: string;
};

export default function NotificationButton({
  notifications = [],
  onItemClick,
  emptyLabel = "Sem notificações",
}: NotificationButtonProps) {
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!open) return;
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Fechar com Esc
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="notifications-menu"
        onClick={() => setOpen((p) => !p)}
        className={[
          "relative inline-flex items-center justify-center rounded-full",
          "shadow cursor-pointer select-none",
          open
            ? "bg-neutral-300 dark:bg-neutral-700"
            : "bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "text-gray-700 dark:text-gray-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "h-10 w-10 transition",
        ].join(" ")}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} novas notificações`}
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500 text-white shadow"
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-menu"
          role="menu"
          aria-label="Lista de notificações"
          className="absolute right-0 mt-2 z-50 w-80 origin-top-right rounded-xl bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95"
        >
          <div className="py-2 max-h-96 overflow-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                {emptyLabel}
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  role="menuitem"
                  onClick={() => onItemClick?.(n.id)}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none"
                >
                  <div className="flex items-start gap-3">
                    {n.read ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-blue-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {n.description && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                          {n.description}
                        </p>
                      )}
                    </div>
                    {n.time && (
                      <span className="ml-auto text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                        {n.time}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

