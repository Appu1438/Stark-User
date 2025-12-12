export const parseDuration = (durationText: string) => {
  const regex = /(\d+)\s*(day|days|hour|hours|minute|minutes|min|mins)?/gi;
  let match;
  let totalMinutes = 0;

  while ((match = regex.exec(durationText)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2]?.toLowerCase() || "";

    if (unit.includes("day")) {
      totalMinutes += value * 24 * 60;
    }
    else if (unit.includes("hour")) {
      totalMinutes += value * 60;
    }
    else {
      totalMinutes += value; // minutes or unknown unit fallback
    }
  }

  return totalMinutes;
};
