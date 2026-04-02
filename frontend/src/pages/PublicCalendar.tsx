import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import { apiFetch } from "../services/fetchApi";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

interface EventData {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  visibility: "Public" | "Members" | "Private";
  status: "Draft" | "Published" | "Archived";
}

const PublicCalendar: React.FC = () => {
  const [events, setEvents] = useState<EventInput[]>([]);

  // ako postoji token → user je ulogovan
  const token = localStorage.getItem("token");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/events?status=Published");
        const data: EventData[] = await res.json();

        const filtered = data.filter((ev) => {
          if (ev.status !== "Published") return false;

          // Guest → samo Public
          if (!token) {
            return ev.visibility === "Public";
          }

          // Ulogovan user → Public + Members
          return (
            ev.visibility === "Public" ||
            ev.visibility === "Members"
          );
        });

        const formatted: EventInput[] = filtered.map((ev) => ({
          id: ev.id.toString(),
          title: ev.title,
          start: ev.start_time,
          end: ev.end_time,
          extendedProps: {
            location: ev.location,
            description: ev.description,
          },
        }));

        setEvents(formatted);
      } catch (err) {
        console.error("Greška kod učitavanja kalendara:", err);
      }
    };

    load();
  }, [token]);

  const handleEventClick = (info: any) => {
    const eventId = info.event.id;

    apiFetch(`/api/events/${eventId}/calendar`)
      .then((res) => {
        if (!res.ok) throw new Error("Ne mogu preuzeti calendar");
        return res.text();
      })
      .then((icsText) => {
        const blob = new Blob([icsText], { type: "text/calendar" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `event_${eventId}.ics`;
        a.click();

        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error(err);
        alert("Ne mogu preuzeti calendar");
      });
  };

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height="auto"
      />
    </div>
  );
};

export default PublicCalendar;
