import { addDays, differenceInCalendarDays, endOfDay, format, isAfter, startOfDay } from "date-fns";

export function toDateOnly(date: Date | string) {
  return startOfDay(new Date(date));
}

export function formatIsoDate(date: Date | string) {
  return format(new Date(date), "yyyy-MM-dd");
}

export function getSelectionClosureDate(weekStartDate: Date | string, closeDay: number, closeHour: number) {
  const closure = addDays(startOfDay(new Date(weekStartDate)), closeDay);
  closure.setHours(closeHour, 0, 0, 0);
  return closure;
}

export function isSelectionOpen(weekStartDate: Date | string, closeDay: number, closeHour: number, now = new Date()) {
  return !isAfter(now, getSelectionClosureDate(weekStartDate, closeDay, closeHour));
}

export function daysBetween(a: Date | string, b: Date | string) {
  return differenceInCalendarDays(toDateOnly(a), toDateOnly(b));
}

export function endOfServiceDay(date: Date | string) {
  return endOfDay(new Date(date));
}
