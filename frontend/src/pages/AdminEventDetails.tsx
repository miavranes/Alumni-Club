import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/fetchApi";

interface Attendee {
  id: number;
  rsvp: "Going" | "Waitlist";
  users: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  } | null;

  guest_first_name: string | null;
  guest_last_name: string | null;
  guest_email: string | null;
}

interface EventData {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number | null;
  goingCount: number;
  waitlistCount: number;
  remainingSeats: number;
}

const AdminEventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [tab, setTab] = useState<"details" | "attendees">("details");

  const token = localStorage.getItem("token");

  // Fetch event info
  const loadEvent = async () => {
    const res = await apiFetch(`/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEvent(data);
  };

  // Fetch attendees
  const loadAttendees = async () => {
    const res = await apiFetch(`/api/events/${id}/attendees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAttendees(data);
  };

  useEffect(() => {
    loadEvent();
    loadAttendees();
  }, [id]);

  const exportCSV = () => {
    if (!attendees.length) return;

    const csv =
      "Name,Email,Status,Type\n" +
      attendees
        .map((a) => {
          const isGuest = !a.users;

          const name = isGuest
            ? `${a.guest_first_name} ${a.guest_last_name}`
            : `${a.users!.first_name} ${a.users!.last_name}`;

          const email = isGuest
            ? a.guest_email
            : a.users!.email;

          return `${name},${email},${a.rsvp},${
            isGuest ? "Guest" : "User"
          }`;
        })
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `event_${id}_attendees.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const downloadICal = async () => {
    try {
      const res = await apiFetch(`/api/events/${id}/calendar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Server error");

      const icsText = await res.text();
      const blob = new Blob([icsText], {
        type: "text/calendar;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `event_${id}.ics`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Ne mogu preuzeti calendar");
    }
  };

  if (!event) {
    return <div className="p-10 text-center">Učitavanje...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 shadow">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {event.title}
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setTab("details")}
            className={`px-2 py-1 w-1/4 text-sm text-center ${
              tab === "details"
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Detalji
          </button>
          <button
            onClick={() => setTab("attendees")}
            className={`px-2 py-1 w-1/4 text-sm text-center ${
              tab === "attendees"
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Učesnici
          </button>
        </div>

        {/* DETAILS TAB */}
        {tab === "details" && (
          <div className="space-y-3">
            <p>
              <strong>Opis:</strong> {event.description}
            </p>
            <p>
              <strong>Lokacija:</strong> {event.location}
            </p>
            <p>
              <strong>Vrijeme:</strong>{" "}
              {new Date(event.start_time).toLocaleString()} –{" "}
              {new Date(event.end_time).toLocaleString()}
            </p>

            <div className="mt-4 p-4 bg-gray-50 rounded border space-y-1">
              <h3 className="text-lg font-semibold mb-2">
                Kapacitet
              </h3>
              <p>Going: {event.goingCount}</p>
              <p>Waitlist: {event.waitlistCount}</p>
              <p>Preostala mjesta: {event.remainingSeats}</p>
            </div>

            <button
              onClick={downloadICal}
              className="mt-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Dodaj u kalendar
            </button>
          </div>
        )}

        {/* ATTENDEES TAB */}
        {tab === "attendees" && (
          <div>
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold">Učesnici</h3>
              <button
                onClick={exportCSV}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Export CSV
              </button>
            </div>

            {attendees.length === 0 ? (
              <p className="text-gray-500">
                Nema prijavljenih.
              </p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-2 text-sm">Ime</th>
                    <th className="p-2 text-sm">Email</th>
                    <th className="p-2 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a) => {
                    const isGuest = !a.users;

                    const name = isGuest
                      ? `${a.guest_first_name} ${a.guest_last_name}`
                      : `${a.users!.first_name} ${a.users!.last_name}`;

                    const email = isGuest
                      ? a.guest_email
                      : a.users!.email;

                    return (
                      <tr key={a.id} className="border-b">
                        <td className="p-2 text-sm">
                          {name}
                          {isGuest && (
                            <span className="ml-2 text-xs text-gray-500">
                              (Gost)
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-sm">
                          {email}
                        </td>
                        <td className="p-2 text-sm">
                          {a.rsvp}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 px-3 py-1 bg-gray-300 text-gray-800 text-sm rounded hover:bg-gray-400"
        >
          ← Nazad na dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminEventDetails;
