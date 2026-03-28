import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "dd MMM yyyy") {
  return format(new Date(date), pattern, { locale: es });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: es });
}
