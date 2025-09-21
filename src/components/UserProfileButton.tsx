"use client";
import { ChevronDown, ChevronUp, LogOut, Settings, User } from "lucide-react";
import Avatar from "./Avatar";
import { useEffect, useRef, useState } from "react";

type UserProfileProps = {
  name: string;
  onClick?: () => void; // acionado ao clicar em "Perfil"
};

export default function UserProfileButton({ name, onClick }: UserProfileProps) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = [
    {
      label: "Perfil",
      icon: User,
      action: () => {
        onClick?.();
        setOpen(false);
        buttonRef.current?.focus();
      },
    },

    {
      label: "Sair",
      icon: LogOut,
      action: () => {
        setOpen(false);
        buttonRef.current?.focus();
      },
    },
  ];

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

  // Fechar com Esc e gerenciar foco inicial
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

  useEffect(() => {
    if (open) {
      setFocusedIndex(0);
      // Foca o primeiro item
      requestAnimationFrame(() => itemRefs.current[0]?.focus());
    }
  }, [open]);

  function toggleOpen() {
    setOpen((prev) => !prev);
  }

  function onButtonKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) setOpen(true);
      setFocusedIndex(0);
      requestAnimationFrame(() => itemRefs.current[0]?.focus());
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      const last = items.length - 1;
      setFocusedIndex(last);
      requestAnimationFrame(() => itemRefs.current[last]?.focus());
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (focusedIndex + 1) % items.length;
      setFocusedIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (focusedIndex - 1 + items.length) % items.length;
      setFocusedIndex(prev);
      itemRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
      itemRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = items.length - 1;
      setFocusedIndex(last);
      itemRefs.current[last]?.focus();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={toggleOpen}
        onKeyDown={onButtonKeyDown}
        className={`flex items-center gap-2 select-none shadow p-2 rounded-full transition ease-in cursor-pointer ${
          open
            ? "bg-neutral-300 dark:bg-neutral-700"
            : "bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800"
        }`}
      >
        <Avatar size="sm" name={name} />
        <span className="hidden sm:block font-medium text-gray-700 dark:text-white">
          {name.length > 8 ? name.slice(0, 8) + "..." : name}
        </span>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>

      {open && (
        <div
          id="user-menu"
          role="menu"
          aria-labelledby="user-menu-button"
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 mt-2 z-50 w-56 origin-top-right rounded-xl shadow  bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 shadow-lg ring-1 ring-black/5 focus:outline-none animate-in fade-in-0 zoom-in-95"
        >
          <div className="py-2">
            {items.map((item, idx) => (
              <button
                key={item.label}
                role="menuitem"
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                tabIndex={-1}
                className="w-full px-3 py-2 inline-flex items-center gap-4 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:bg-neutral-100 dark:focus:bg-neutral-700 focus:outline-none cursor-pointer"
                onClick={item.action}
              >
                <item.icon size={22} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
