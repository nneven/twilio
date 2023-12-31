import dotenv from "dotenv";

import { scheduleEvent } from "./puppeteer.js";

dotenv.config();

async function getCurrentUser() {
  const response = await fetch("https://api.calendly.com/users/me", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`,
    },
  });

  return response.json();
}

async function getEventTypes() {
  const response = await fetch(
    `https://api.calendly.com/event_types?user=${encodeURIComponent(
      "https://api.calendly.com/users/9eb0306a-8686-42f9-b2e5-2ff2f40b80aa"
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`,
      },
    }
  );

  return response.json();
}

async function getAvailableTimes() {
  const day = 24 * 60 * 60 * 1000;
  const startTime = new Date(Date.now() + day);
  const endTime = new Date(startTime.getTime() + 7 * day);

  const response = await fetch(
    `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(
      "https://api.calendly.com/event_types/26564406-d3da-42b5-b8c8-11184f42aeb4"
    )}&start_time=${encodeURIComponent(
      startTime.toISOString().split("T")[0]
    )}&end_time=${encodeURIComponent(endTime.toISOString().split("T")[0])}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CALENDLY_API_KEY}`,
      },
    }
  );

  return response.json();
}

function condenseTimeSlots(timeSlots) {
  const condensed = {};
  const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  timeSlots.forEach((slot) => {
    const date = new Date(slot.start_time);
    const dayName = dateFormatter.format(date);
    const time = timeFormatter.format(date);
    const datePart = slot.start_time.split("T")[0];
    const dateKey = `${dayName}, ${datePart}`;

    if (!condensed[dateKey]) condensed[dateKey] = [];

    condensed[dateKey].push(time);
  });

  return condensed;
}

export async function getTimeSlots() {
  const availableTimes = (await getAvailableTimes()).collection;
  const timeSlots = condenseTimeSlots(availableTimes);
  return timeSlots;
}

export async function getSchedulingUrl(date, time) {
  const dateTime = new Date(`${date} ${time}`);
  const utcDateTime = dateTime.toISOString().split(".")[0] + "Z";
  const availableTimes = (await getAvailableTimes()).collection;
  const timeSlot = availableTimes.find(
    (slot) => slot.start_time === utcDateTime
  );
  return timeSlot.scheduling_url;
}

export async function scheduleMeeting(date, time, name, email) {
  console.log(date, time, name, email);
  const schedulingUrl = await getSchedulingUrl(date, time);
  console.log(schedulingUrl);
  const didSchedule = await scheduleEvent(schedulingUrl, name, email);
  if (didSchedule) {
    return "You are scheduled.";
  } else {
    return "You are not scheduled.";
  }
}

// (async () => {
//   getTimeSlots();
// })();

// console.log(await getSchedulingUrl("2023-11-13", "10:00 AM"));

// (async () => {
//   const response = await scheduleMeeting(
//     "2023-11-14",
//     "10:00 AM",
//     "Nico Neven",
//     "niconeven@gmail.com"
//   );
//   console.log(response);
// })();
