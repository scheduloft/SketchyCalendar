import localforage from "localforage";
import { gapi } from "gapi-script";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const isGoogleApiReady = new Promise((resolve) => {
  gapi.load("client", async () => {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
      ],
    });

    const savedToken = loadAccessToken();

    // If the token exists, set the token directly without prompting the user
    if (savedToken) {
      gapi.client.setToken(savedToken);
      resolve(true);
      return;
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.access_token) {
          saveAccessToken({
            accessToken: response.access_token,
            expirationTimestamp:
              Date.now() + parseInt(response.expires_in, 10) * 1000,
          });
        }

        resolve(true);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
});

const loadAccessToken = (): gapi.client.TokenObject | undefined => {
  const rawSavedToken = localStorage.getItem("google_oauth_token");

  if (!rawSavedToken) {
    return;
  }

  const { accessToken, expirationTimestamp } = JSON.parse(rawSavedToken);

  return Date.now() < expirationTimestamp
    ? { access_token: accessToken }
    : undefined;
};

const saveAccessToken = ({
  accessToken,
  expirationTimestamp,
}: {
  accessToken: string;
  expirationTimestamp: number;
}) => {
  localStorage.setItem(
    "google_oauth_token",
    JSON.stringify({
      accessToken,
      expirationTimestamp,
    }),
  );
};

export const fetchCalendars = async (): Promise<
  gapi.client.calendar.CalendarListEntry[]
> => {
  await isGoogleApiReady;
  const response = await gapi.client.calendar.calendarList.list();
  return response.result.items ?? [];
};

export type Calendar = {
  metadata: gapi.client.calendar.CalendarListEntry;
  nextSyncToken?: string;
  events: Record<string, gapi.client.calendar.Event>;
};

const store = localforage.createInstance({
  name: "google_calendar",
});

let CACHED_CALENDARS =
  (await store.getItem<Record<string, Calendar>>("CACHED_CALENDARS")) ?? {};

export const syncAllCalendars = async () => {
  const cachedData =
    await store.getItem<Record<string, Calendar>>("CACHED_CALENDARS");

  const calendars = cachedData ?? {};

  for (const metadata of await fetchCalendars()) {
    const { id } = metadata;

    let calendar = calendars[id!];
    if (!calendar) {
      calendar = {
        metadata,
        events: {},
      };
      calendars[id!] = calendar;
    }

    const { nextSyncToken, events } = await syncCalendar(
      id!,
      calendar.nextSyncToken,
    );

    console.log(
      "updated",
      Object.keys(events).length,
      "events in",
      metadata.summary,
    );

    calendar.nextSyncToken = nextSyncToken;

    for (const event of Object.values(events)) {
      calendar.events[event.id!] = event;
    }
  }

  CACHED_CALENDARS = calendars;

  await store.setItem<Record<string, Calendar>>("CACHED_CALENDARS", calendars);
};

type SyncResult = {
  events: Record<string, gapi.client.calendar.Event>;
  nextSyncToken?: string;
};

export const syncCalendar = async (
  calendarId: string,
  nextSyncToken?: string,
): Promise<SyncResult> => {
  await isGoogleApiReady;

  let pageToken: string | undefined = undefined;

  const events: Record<string, gapi.client.calendar.Event> = {};

  do {
    const response = await gapi.client.calendar.events.list({
      calendarId: calendarId,
      pageToken: pageToken,
      maxResults: 2500,
      singleEvents: true, // Expand recurring events
      showDeleted: true,
      syncToken: nextSyncToken,
    });

    // sync events from scratch if the sync token is expired
    if (response.status === 410) {
      nextSyncToken = undefined;
      pageToken = undefined;
      continue;
    }

    if (response.result.items) {
      for (const event of response.result.items) {
        events[event.id!] = event;
      }
    }

    pageToken = response.result.nextPageToken;
    if (response.result.nextSyncToken) {
      nextSyncToken = response.result.nextSyncToken;
    }
  } while (pageToken || (!pageToken && !nextSyncToken));

  return { events, nextSyncToken };
};

export const getAllCalendars = () => {
  return CACHED_CALENDARS;
};

// Query cache (This breaks updates, but it speeds up re-renders
// TODO: Invalidate cache when events are updated
const CACHED_EVENTS = new Map<string, gapi.client.calendar.Event[]>();

export const getEventsOnDay = ({
  calendarIds,
  date,
}: {
  calendarIds: string[];
  date: Date;
}) => {
  const key = calendarIds.join("_") + "_" + date.toISOString();

  if (CACHED_EVENTS.has(key)) {
    return CACHED_EVENTS.get(key)!;
  }

  const events = [];

  for (const [calendarId, calendar] of Object.entries(getAllCalendars())) {
    if (!calendarIds.includes(calendarId)) {
      continue;
    }

    for (const event of Object.values(calendar.events)) {
      const eventStart = toDate(event.start);
      const eventEnd = toDate(event.end);

      if (event.status === "cancelled") {
        continue;
      }

      if (eventStart && eventEnd) {
        // Check if the event overlaps with the given date
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        if (eventStart <= dayEnd && eventEnd >= dayStart) {
          events.push(event);
        }
      }
    }
  }

  CACHED_EVENTS.set(key, events);

  return events;
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
