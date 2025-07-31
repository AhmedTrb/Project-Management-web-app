import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns";

/**
 * Format a date to 'dd/MM/yyyy' string
 */
export const formatDate = (date: Date | string): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "dd/MM/yyyy");
};

/**
 * Format a date to 'dd/MM/yyyy HH:mm' string
 */
export const formatDateTime = (date: Date | string): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "dd/MM/yyyy HH:mm");
};

/**
 * Return 'Today', 'Yesterday', or a formatted date
 */
export const formatRelativeDay = (date: Date | string): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (isToday(parsed)) return "Today";
  if (isYesterday(parsed)) return "Yesterday";
  return formatDate(parsed);
};

/**
 * Format like "2 hours ago", "3 days ago", etc.
 */
export const formatTimeAgo = (date: Date | string): string => {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(parsed, { addSuffix: true });
};