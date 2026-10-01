"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

export type ToastItem = ToastInput & {
  id: string;
  variant: ToastVariant;
  durationMs: number;
};

type Listener = (toasts: ToastItem[]) => void;

const DEFAULT_DURATION_MS = 5000;
const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) {
    listener(toasts);
  }
}

function removeToast(id: string) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function pushToast(input: ToastInput) {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const item: ToastItem = {
    id,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "info",
    durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
  };
  toasts = [...toasts, item].slice(-5);
  emit();

  if (item.durationMs > 0) {
    timers.set(
      id,
      setTimeout(() => {
        removeToast(id);
      }, item.durationMs),
    );
  }

  return id;
}

export const toast = {
  show(input: ToastInput) {
    return pushToast(input);
  },
  success(title: string, description?: string) {
    return pushToast({ title, description, variant: "success" });
  },
  error(title: string, description?: string) {
    return pushToast({ title, description, variant: "error", durationMs: 7000 });
  },
  info(title: string, description?: string) {
    return pushToast({ title, description, variant: "info" });
  },
  dismiss(id: string) {
    removeToast(id);
  },
};

function subscribe(listener: Listener) {
  listeners.add(listener);
  listener(toasts);
  return () => {
    listeners.delete(listener);
  };
}

const variantStyles: Record<
  ToastVariant,
  { shell: string; icon: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    shell: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
  error: {
    shell: "border-red-200 bg-red-50 text-red-900",
    icon: "text-red-600",
    Icon: AlertCircle,
  },
  info: {
    shell: "border-[#dfeae7] bg-white text-neutral-900",
    icon: "text-primary-700",
    Icon: Info,
  },
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setItems), []);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-end gap-2 p-3 sm:p-4"
      aria-live="polite"
    >
      {items.map((item) => {
        const style = variantStyles[item.variant];
        const Icon = style.Icon;
        return (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3.5 py-3 shadow-lg ${style.shell}`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.icon}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-5">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-sm leading-5 opacity-90">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => toast.dismiss(item.id)}
              className="rounded-lg p-1 text-current opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
