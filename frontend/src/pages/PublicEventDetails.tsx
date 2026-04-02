import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, MapPin, Users, Info } from "lucide-react";
import { apiFetch } from "../services/fetchApi";

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number | null;
  visibility: "Public" | "Members" | "Private";
  status: "Draft" | "Published" | "Archived";

  goingCount?: number;
  waitlistCount?: number;
  remainingSeats?: number;
}

interface EventRegistration {
  id: number;
  event_id: number;
  user_id: number;
  rsvp: "Interested" | "Going" | "Declined" | "Waitlist";
  registered_at: string;
  check_in: boolean;
  notes?: string | null;
}

export default function PublicEventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);

  const [rsvp, setRsvp] = useState<EventRegistration | null | "loading">(
    "loading"
  );
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  // GUEST RSVP STATE
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestSuccess, setGuestSuccess] = useState(false);

  const token = localStorage.getItem("token");

  const loadEvent = async () => {
    try {
      const res = await apiFetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Neuspjelo učitavanje događaja");
      const data: Event = await res.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  useEffect(() => {
    if (!id || !token) {
      setRsvp(null);
      return;
    }

    const loadMyRsvp = async () => {
      try {
        setRsvp("loading");
        const res = await apiFetch(`/api/events/${id}/rsvp/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 401) {
          setRsvp(null);
          return;
        }
        if (!res.ok) throw new Error("Neuspjelo učitavanje RSVP-a");
        const data: EventRegistration | null = await res.json();
        setRsvp(data);
      } catch (err: any) {
        console.error(err);
        setRsvpError(err.message || "Greška pri učitavanju RSVP-a");
        setRsvp(null);
      }
    };

    loadMyRsvp();
  }, [id, token]);

  const handleRsvp = async () => {
    if (!event || !token) {
      setRsvpError("Morate biti prijavljeni da biste se RSVP-ovali");
      return;
    }

    setRsvpLoading(true);
    setRsvpError(null);

    try {
      let res;
      if (rsvp) {
        res = await apiFetch(`/api/events/${id}/rsvp`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Neuspjelo otkazivanje RSVP-a");
        setRsvp(null);
      } else {
        res = await apiFetch(`/api/events/${id}/rsvp`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || "Neuspjelo RSVP-ovanje");
        }
        const data: EventRegistration = await res.json();
        setRsvp(data);
      }

      await loadEvent();
    } catch (err: any) {
      console.error(err);
      setRsvpError(err.message || "Greška pri RSVP");
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleGuestRsvp = async () => {
    if (!id) return;

    setRsvpLoading(true);
    setRsvpError(null);

    try {
      const res = await apiFetch(`/api/events/${id}/rsvp/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: guestFirstName,
          lastName: guestLastName,
          email: guestEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Neuspjela prijava");
      }

      setGuestSuccess(true);
      await loadEvent();
    } catch (err: any) {
      setRsvpError(err.message);
    } finally {
      setRsvpLoading(false);
    }
  };

  if (!event)
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-gray-600">
        Učitavanje...
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-white">
      {/* HEADER */}
      <div className="bg-linear-to-r from-[#294a70] to-[#324D6B] text-white py-20 px-5 text-center shadow-lg">
        <h1 className="text-5xl font-bold mb-4">{event.title}</h1>
        <p className="text-xl opacity-90">Detalji javnog događaja</p>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto py-16 px-5">
        <div className="bg-[#f9f9f9] rounded-2xl shadow-xl border border-gray-200 p-8 space-y-8">

          {/* DATUM */}
          <div className="flex items-center gap-2 text-[#294a70] font-semibold">
            <Calendar className="w-5 h-5 text-[#ffab1f]" />
            {new Date(event.start_time).toLocaleString("sr-RS", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" — "}
            {new Date(event.end_time).toLocaleString("sr-RS", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* LOKACIJA */}
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-[#ffab1f]" />
            <span className="font-medium">{event.location}</span>
          </div>

          {/* OPIS */}
          <div>
            <h3 className="text-xl font-semibold text-[#294a70] mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#ffab1f]" />
              Opis događaja
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {event.description || "Ovaj događaj nema dodatni opis."}
            </p>
          </div>

          {/* CAPACITY */}
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#ffab1f]" />
            <p className="text-gray-800 font-medium">
              Kapacitet: {event.capacity ?? "N/A"} učesnika
            </p>
          </div>

          {/* USER RSVP + WAITLIST (ORIGINAL) */}
          <div className="mt-4 p-4 bg-white border border-gray-300 rounded-xl text-gray-700 space-y-2">
            {rsvp === "loading" && <div>Učitavam vaš status...</div>}

            {rsvpError && <div className="text-red-600">Greška: {rsvpError}</div>}

            {!rsvpError && rsvp === null && token && (
              <div className="italic text-gray-600">
                Trenutno niste prijavljeni za ovaj događaj.
              </div>
            )}

            {rsvp && rsvp !== "loading" && (
              <div>
                <div className="font-semibold text-gray-800">
                  Vaš RSVP status:{" "}
                  <span className="text-[#294a70]">{rsvp.rsvp}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Prijavljeni:{" "}
                  {new Date(rsvp.registered_at).toLocaleString("sr-RS")}
                </div>
              </div>
            )}

            {event.capacity !== null && (
              <div className="mt-2">
                <div className="text-sm text-gray-500 mb-1">
                  Prijavljeno: {event.goingCount ?? 0} / {event.capacity}{" "}
                  {event.remainingSeats && event.remainingSeats > 0
                    ? `(Preostalo mjesta: ${event.remainingSeats})`
                    : "(Popunjeno, prijave na čekanju)"}
                  {event.waitlistCount && event.waitlistCount > 0
                    ? `, Na čekanju: ${event.waitlistCount}`
                    : ""}
                </div>

                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#294a70] to-[#324D6B]"
                    style={{
                      width: `${Math.min(
                        100,
                        ((event.goingCount ?? 0) / event.capacity) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {token && (
              <button
                onClick={handleRsvp}
                disabled={rsvpLoading}
                className="mt-2 w-full py-2 rounded-xl font-semibold text-white bg-linear-to-r from-[#294a70] to-[#324D6B] hover:from-[#ffab1f] hover:to-[#ff9500] transition-all shadow-md hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rsvp ? "Otkaži prijavu" : "Prijavi se"}
              </button>
            )}
          </div>

          {/* GUEST RSVP – DODATO, ODVOJENO */}
          {!token &&
                     event.visibility === "Public" &&
                    (event.remainingSeats ?? 0) > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-300 rounded-xl space-y-3">
              <h3 className="text-lg font-semibold text-[#294a70]">
                Prijava bez naloga
              </h3>

              {guestSuccess ? (
                <div className="text-green-700">
                  Uspešno ste se prijavili 🎉
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Ime"
                    className="w-full border rounded px-3 py-2"
                    value={guestFirstName}
                    onChange={(e) => setGuestFirstName(e.target.value)}
                  />

                  <input
                    type="text"
                    placeholder="Prezime"
                    className="w-full border rounded px-3 py-2"
                    value={guestLastName}
                    onChange={(e) => setGuestLastName(e.target.value)}
                  />

                  <input
                    type="email"
                    placeholder="Email adresa"
                    className="w-full border rounded px-3 py-2"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />

                  <button
                    onClick={handleGuestRsvp}
                    disabled={rsvpLoading}
                    className="w-full py-2 rounded-xl font-semibold text-white bg-linear-to-r from-[#294a70] to-[#324D6B] hover:from-[#ffab1f] hover:to-[#ff9500] transition-all shadow-md hover:shadow-xl disabled:opacity-50"
                  >
                    Prijavi se kao gost
                  </button>
                </>
              )}
            </div>
          )}
          {!token &&
                      event.visibility === "Public" &&
                      (event.remainingSeats ?? 0) === 0 && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-yellow-800">
                          Događaj je trenutno popunjen. Prijava za goste nije moguća.
                        </div>
                    )}

          <Link
            to="/events"
            className="block text-center py-3 rounded-xl font-semibold text-white bg-linear-to-r from-[#294a70] to-[#324D6B] hover:from-[#ffab1f] hover:to-[#ff9500]"
          >
            ← Nazad na događaje
          </Link>
        </div>
      </div>
    </div>
  );
}
