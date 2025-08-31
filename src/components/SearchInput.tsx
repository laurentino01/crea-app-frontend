"use client";

import React from "react";

type Size = "sm" | "md" | "lg";

type SearchInputProps = {
  value?: string; // modo controlado (opcional)
  defaultValue?: string; // modo não controlado (opcional)
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void; // dispara no Enter ou no submit
  placeholder?: string;
  size?: Size;
  className?: string;
  autoFocus?: boolean;
  shortcutSlashToFocus?: boolean; // foco com "/" (default: true)
  disabled?: boolean;
  name?: string;
  id?: string;
};

export default function SearchInput({
  value,
  defaultValue,
  onChange,
  onSearch,
  placeholder = "Buscar...",
  size = "md",
  className = "",
  autoFocus = false,
  shortcutSlashToFocus = true,
  disabled = false,
  name,
  id,
}: SearchInputProps) {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = React.useState(defaultValue ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const current = isControlled ? value! : innerValue;

  // Atalho "/" para focar (quando não estiver digitando em outro input/textarea)
  React.useEffect(() => {
    if (!shortcutSlashToFocus) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isTyping && e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcutSlashToFocus]);

  const sizes: Record<Size, { wrapper: string; input: string; icon: string }> =
    {
      sm: {
        wrapper: "h-9 px-3 text-sm",
        input: "text-sm",
        icon: "w-4 h-4",
      },
      md: {
        wrapper: "h-10 px-4 text-base",
        input: "text-base",
        icon: "w-5 h-5",
      },
      lg: {
        wrapper: "h-12 px-5 text-base",
        input: "text-base",
        icon: "w-5 h-5",
      },
    };

  const setValue = (v: string) => {
    if (!isControlled) setInnerValue(v);
    onChange?.(v);
  };

  const clear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onSearch?.(current);
    if (e.key === "Escape" && current) clear();
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    onSearch?.(current);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "group relative flex items-center gap-2 rounded-full border",
        "bg-white text-gray-900 shadow-sm",
        "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 dark:bg-neutral-900",
        "border-gray-200 dark:border-neutral-600",
        sizes[size].wrapper,
        disabled ? "opacity-60 pointer-events-none" : "",
        className,
      ].join(" ")}
      role="search"
      aria-label="Pesquisar"
    >
      {/* Ícone lupa */}
      <svg
        aria-hidden="true"
        className={["shrink-0", sizes[size].icon, "text-gray-400"].join(" ")}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 21l-4.3-4.3m1.05-4.2a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <input
        ref={inputRef}
        id={id}
        name={name}
        type="search"
        autoFocus={autoFocus}
        disabled={disabled}
        className={[
          "peer w-full bg-transparent outline-none dark:text-neutral-400 placeholder:text-gray-400 dark:bg-neutral-900",
          sizes[size].input,
        ].join(" ")}
        placeholder={placeholder}
        value={current}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        role="searchbox"
        autoComplete="off"
      />
    </form>
  );
}
