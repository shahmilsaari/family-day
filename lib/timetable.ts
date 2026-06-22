import type { TentativeSchedule } from "@prisma/client";

export type TimetableGroup<T extends Pick<TentativeSchedule, "id" | "scheduleDate">> = {
  key: string;
  label: string;
  items: T[];
};

export function formatScheduleDate(value: Date | null | undefined) {
  if (!value) return "No date assigned";
  return value.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export function formatScheduleTime(value: string) {
  const normalized = value.trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!normalized) return value;

  let hours = Number.parseInt(normalized[1], 10);
  const minutes = Number.parseInt(normalized[2], 10);
  const meridiem = normalized[3]?.toUpperCase();

  if (meridiem === "AM" && hours === 12) hours = 0;
  if (meridiem === "PM" && hours < 12) hours += 12;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function groupTimetableByDay<T extends Pick<TentativeSchedule, "id" | "scheduleDate">>(
  timetable: T[]
): TimetableGroup<T>[] {
  return timetable.reduce<TimetableGroup<T>[]>((groups, item) => {
    const key = item.scheduleDate ? item.scheduleDate.toISOString().slice(0, 10) : `unscheduled-${item.id}`;
    const label = formatScheduleDate(item.scheduleDate);
    const currentGroup = groups.find((group) => group.key === key);

    if (currentGroup) {
      currentGroup.items.push(item);
      return groups;
    }

    groups.push({ key, label, items: [item] });
    return groups;
  }, []);
}
