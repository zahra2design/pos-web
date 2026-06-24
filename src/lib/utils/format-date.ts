import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy", { locale: id });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: id });
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm", { locale: id });
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
}
