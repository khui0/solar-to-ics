import dayjs from "dayjs";
import saveAs from "file-saver";
import type { DurationObject, EventAttributes } from "ics";
import * as ics from "ics";
import type { CalendarEvent } from "./solar";

export function isMac(): boolean {
  try {
    return navigator.userAgent.indexOf("Mac OS X") != -1;
  } catch {
    return false;
  }
}

export const ctrlKey = (e: KeyboardEvent) => (isMac() ? e.metaKey : e.ctrlKey);

export const ctrlKeyString = isMac() ? "⌘" : "Ctrl";

export function getLastDay() {
  const m = dayjs().get("month");

  // Spring semester registration between from November up to March
  if (m < 3 || m >= 10) {
    const firstFriday = getNthWeekday(4, 1, 5);
    if (firstFriday >= 3) {
      return dayjs().month(5).date(firstFriday).format("YYYY-MM-DD");
    } else {
      return dayjs()
        .month(4)
        .date(getNthWeekday(4, 2, 5))
        .format("YYYY-MM-DD");
    }
  } else {
    const firstMonday = getNthWeekday(11, 1, 1);
    if (firstMonday >= 5) {
      return dayjs().month(11).date(firstMonday).format("YYYY-MM-DD");
    } else {
      return dayjs()
        .month(11)
        .date(getNthWeekday(11, 2, 1))
        .format("YYYY-MM-DD");
    }
  }
}

function getNthWeekday(month: number, n: number, weekday: number) {
  const firstDay = dayjs().month(month).date(1);

  let firstOccurrence = firstDay.day(weekday);

  if (firstOccurrence.date() > 7) {
    firstOccurrence = firstOccurrence.add(7, "day");
  } else if (firstOccurrence.month() !== month) {
    firstOccurrence = firstOccurrence.add(7, "day");
  }

  return firstOccurrence.add(n - 1, "week").get("date");
}

export function toICS(schedule: CalendarEvent[], lastDay: string = getLastDay()): string | null {
  const events = schedule
    ?.filter((event) => !event.online)
    .map((event: CalendarEvent) => {
      const hours = parseInt(event.from.split(":")[0]);
      const minutes = parseInt(event.from.split(":")[1]);
      const start = startDate(event.days);
      console.log(event.days);
      const result: EventAttributes = {
        start: [start.year, start.month, start.day, hours, minutes],
        startInputType: "local",
        startOutputType: "local",
        duration: duration(event.from, event.to),
        title: `${event.name} (${event.type.toUpperCase()})`,
        description: event.type.toUpperCase(),
        recurrenceRule: rrule(event.days, lastDay),
        productId: "-//KENNYHUI//NONSGML kennyhui.dev//EN",
      };
      if (event.location) {
        result.location = `${event.location.precise.toUpperCase()} - ${event.location.general}`;
      }
      return result;
    });

  return ics.createEvents(events).value || null;
}

function duration(from: string, to: string): DurationObject {
  const seconds = dayjs(to, "HH:mm").diff(dayjs(from, "HH:mm"), "s");
  const minutes = seconds / 60;
  const hours = minutes / 60;
  return {
    hours: Math.floor(hours),
    minutes: Math.floor(minutes % 60),
  };
}

function rrule(days: boolean[], lastDay: string) {
  const until = dayjs(lastDay)
    .toISOString()
    .replace(/(\.000)|[-,:]/g, "");
  const strings = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const array = strings.filter((_, i) => days[i]);
  return `FREQ=WEEKLY;BYDAY=${array.join(",")};INTERVAL=1;UNTIL=${until}`;
}

function startDate(days: boolean[]) {
  const index = days.findIndex(Boolean);

  const date = dayjs().day(index);

  return {
    year: date.year(),
    month: date.month() + 1,
    day: date.date(),
  };
}

export function save(ical: string) {
  const blob = new Blob([ical], { type: "text/calendar" });
  saveAs(blob, `schedule.ics`);
}

export function daysHumanReadable(days: boolean[]): string {
  const week = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  return week.filter((_, i) => days[i]).join("");
}
