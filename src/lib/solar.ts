export interface CalendarEvent {
  name: string;
  type: string;
  days: boolean[];
  from: string;
  to: string;
  location: {
    general: string;
    precise: string;
  };
  instructors: string[];
  online: boolean;
}

export function parse(data: string): CalendarEvent[] | null {
  if (!data) return null;
  const COURSE_REGEX = /^[A-Z]{3} [0-9]{3}/gm;
  const CLASS_NBR_REGEX = /^[0-9]{5}/gm;
  const TIME_REGEX =
    /((?:Mo|Tu|We|Th|Fr|Sa|Su)+) ([0-9]{1,2}:[0-9]{1,2}(?:AM|PM)) - ([0-9]{1,2}:[0-9]{1,2}(?:AM|PM))/;
  const ROOM_REGEX = /(.+) ([A-Z]?[0-9-]+)/;
  // Normalize input between Chrome, Firefox, and Safari
  const normalized = data
    .trim()
    .replace(/\n\t+\n/g, "\n")
    .replace(/ \t|\t/g, " ")
    .replace(/ {2}/g, " ")
    .replace(/\n \n/g, "\n");
  // Match courses
  const courses = normalized.match(COURSE_REGEX);
  if (!courses) return null; // Stop if no courses are detected

  // Split input by courses and separate each line
  const extracted = normalized
    .split(COURSE_REGEX)
    .slice(1)
    .map((item) => item.split("\n"));

  const schedule: CalendarEvent[] = [];

  // Loop over each course
  for (let i = 0; i < extracted.length; i++) {
    const item = extracted[i];
    // Get the index of each occurrence of a date in MM/DD/YYYY - MM/DD/YYYY format
    const indicies = item.reduce((a: number[], e, i) => {
      if (e.match(CLASS_NBR_REGEX)) a.push(i);
      return a;
    }, []);
    // Loop over each index, in case a course has multiple classes
    indicies.forEach((index) => {
      // Get information by relative index
      const type = item[index + 2];
      const times = item[index + 3].match(TIME_REGEX);
      const preciseLocation = item[index + 4].match(ROOM_REGEX);
      const generalLocation = preciseLocation?.[1].trim() || null;
      const online = generalLocation === null || preciseLocation === null;

      // Get list of instructors
      const instructors = [];
      let initial = index + 5;
      try {
        do {
          instructors.push(item[initial].replace(/,$/, ""));
          initial++;
        } while (item[initial - 1].endsWith(","));
      } catch {
        console.error("Unable to parse instructors");
      }

      // Log parsed event to console
      // console.log("Found", courses[i], type, times, preciseLocation, generalLocation, online);
      // Push to schedule
      schedule.push({
        name: courses[i],
        type: type.toLowerCase(),
        days: toDays(times?.[1] || ""),
        from: (times && convertTime(times[2])) || "",
        to: (times && convertTime(times[3])) || "",
        location: {
          general: generalLocation || "",
          precise: preciseLocation?.[2] || "",
        },
        instructors,
        online: !preciseLocation && online,
      });
    });
  }

  console.log(schedule);

  return schedule;
}

function toDays(input: string) {
  const days = [false, false, false, false, false, false, false];
  const results = input.match(/Su|Mo|Tu|We|Th|Fr|Sa/g);
  if (!results) return days;
  const reference = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  results.forEach((item) => {
    const index = reference.indexOf(item);
    days[index] = true;
  });
  return days;
}

function convertTime(time: string) {
  const parts = time.match(/([0-9]{1,2}):([0-9]{1,2})(AM|PM)/);
  if (!parts) return;
  let hours = parseInt(parts[1]);
  if (parts[3] === "PM" && hours !== 12) {
    hours += 12;
  }
  return hours.toString().padStart(2, "0") + ":" + parts[2];
}
