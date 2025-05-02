type EventWithCalendarId = gapi.client.calendar.Event & { calendarId: string };

export type Calendar = {
  calendars: Record<string, gapi.client.calendar.Calendar>;
  events: Record<string, EventWithCalendarId>;
};

import { DocHandle } from "@automerge/automerge-repo";

export const getEventsOnDay = (
  date: Date,
  calendarIds: string[],
  calendarDocHandle: DocHandle<Calendar>
) => {
  const { events } = calendarDocHandle.doc();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return Object.values(events).filter((event) => {
    if (!calendarIds.includes(event.calendarId)) {
      return false;
    }

    const eventEnd = toDate(event.end);
    const eventStart = toDate(event.start);

    return (
      eventStart && eventEnd && eventStart <= dayEnd && eventEnd >= dayStart
    );
  });
};

export const toDate = (date: any): Date | undefined => {
  if (typeof date === "object" && date !== null) {
    if ("date" in date) {
      return new Date(date.date);
    }

    if ("dateTime" in date) {
      return new Date(date.dateTime);
    }
  }
};
