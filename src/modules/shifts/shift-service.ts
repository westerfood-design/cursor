import { ShiftType } from "@prisma/client";
import { getISODay } from "date-fns";

import { daysBetween, toDateOnly } from "@/lib/date";

export type ShiftRules = {
  weekdays?: number[];
  workDays?: number;
  offDays?: number;
};

export type ShiftLike = {
  type: ShiftType;
  activeDays: unknown;
  cycleLength: number | null;
};

function parseRules(activeDays: unknown): ShiftRules {
  if (!activeDays || typeof activeDays !== "object") {
    return {};
  }

  return activeDays as ShiftRules;
}

export function isEmployeeScheduledForDate(
  shift: ShiftLike,
  shiftStartDate: Date | string,
  serviceDate: Date | string,
) {
  const rules = parseRules(shift.activeDays);
  const normalizedDate = toDateOnly(serviceDate);

  if (shift.type === ShiftType.FIXED_MONDAY_TO_FRIDAY) {
    const weekday = getISODay(normalizedDate);
    const allowed = rules.weekdays ?? [1, 2, 3, 4, 5];
    return allowed.includes(weekday);
  }

  if (shift.type === ShiftType.CUSTOM) {
    const weekday = getISODay(normalizedDate);
    return (rules.weekdays ?? []).includes(weekday);
  }

  const workDays = rules.workDays ?? 0;
  const offDays = rules.offDays ?? 0;
  const cycleLength = shift.cycleLength ?? workDays + offDays;

  if (!cycleLength || workDays <= 0) {
    return false;
  }

  const diff = daysBetween(serviceDate, shiftStartDate);
  const position = ((diff % cycleLength) + cycleLength) % cycleLength;
  return position < workDays;
}

export function describeShiftPattern(shift: ShiftLike) {
  const rules = parseRules(shift.activeDays);

  switch (shift.type) {
    case ShiftType.FIXED_MONDAY_TO_FRIDAY:
      return "Lunes a viernes";
    case ShiftType.CUSTOM:
      return `Personalizado (${(rules.weekdays ?? []).join(", ")})`;
    case ShiftType.CYCLICAL:
      return `${rules.workDays ?? 0}x${rules.offDays ?? 0}`;
    default:
      return "Sin patron";
  }
}
