import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../services/fetchApi";

interface EventFormProps {
  eventId?: number;
}

interface EventData {
  title: string;
  slug: string;
  description: string;
  start_time: string;
  end_time: string;
  timezone: string;
  location: string;
  venue_id: number | null;
  capacity: number | null;
  visibility: "Public" | "Members" | "Private";
  status: "Draft" | "Published" | "Archived";
}

const EventForm: React.FC<EventFormProps> = ({ eventId }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<EventData>({
    title: "",
    slug: "",
    description: "",
    start_time: "",
    end_time: "",
    timezone: "Europe/Podgorica",
    location: "",
    venue_id: null,
    capacity: 100,
    visibility: "Public",
    status: "Draft",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (id || eventId) {
        try {
          const res = await apiFetch(`/api/events/${id || eventId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          const data = await res.json();
          if (res.ok) {
            setForm({
              ...data,
              start_time: data.start_time
                ? new Date(data.start_time).toISOString().slice(0, 16)
                : "",
              end_time: data.end_time
                ? new Date(data.end_time).toISOString().slice(0, 16)
                : "",
            });
          } else {
            alert(data.error || "Greška pri učitavanju događaja");
          }
        } catch (err) {
          console.error(err);
          alert("Greška pri učitavanju događaja");
        }
      }
    };
    fetchEvent();
  }, [id, eventId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "capacity") {
      setForm({ ...form, [name]: value === "" ? null : parseInt(value, 10) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      capacity: form.capacity !== null ? form.capacity : null,
    };

    try {
      const res = await apiFetch(
        eventId || id ? `/api/events/${id || eventId}` : "/api/events",
        {
          method: eventId || id ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data);
        alert("Došlo je do greške prilikom čuvanja događaja");
      } else {
        alert("Događaj je uspešno sačuvan");
        navigate("/admin/events");
      }
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške prilikom čuvanja događaja");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold mb-6">
            {eventId || id ? "Izmena događaja" : "Kreiraj događaj"}
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Naslov događaja"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="Slug (URL-friendly)"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Opis događaja"
              required
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="Lokacija"
              className="w-full border border-gray-300 rounded px-4 py-2"
            />
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                name="capacity"
                value={form.capacity ?? ""}
                onChange={handleChange}
                placeholder="Kapacitet"
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
              <select
                name="visibility"
                value={form.visibility}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                <option value="Public">Javno</option>
                <option value="Members">Samo za članove</option>
                <option value="Private">Privatno</option>
              </select>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              >
                <option value="Draft">Nacrt</option>
                <option value="Published">Objavljeno</option>
                <option value="Archived">Arhivirano</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded"
            >
              Sačuvaj događaj
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              ← Nazad na dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
