import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";
type Toast = {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
};

type ToastContextType = {
  push: (t: Omit<Toast, "id">) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, duration: 3000, ...t }]);
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  // Auto-remover cada toast após sua duração
  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== t.id)),
        t.duration ?? 3000
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ push, clear }}>
      {children}

      {/* Viewport dos toasts */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl px-4 py-3 shadow-lg text-white min-w-64 max-w-sm",
              t.type === "success" && "bg-green-600",
              t.type === "error" && "bg-red-600",
              t.type === "info" && "bg-slate-800",
            ]
              .filter(Boolean)
              .join(" ")}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
