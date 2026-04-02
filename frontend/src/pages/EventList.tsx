import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/fetchApi";

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
}

const EventList: React.FC = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"title" | "start_time">("start_time");
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    apiFetch(`/api/events?search=${search}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, [search]);

  const handleDelete = async (eventId: number) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovaj događaj?")) return;

    try {
      const res = await apiFetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Greška pri brisanju događaja");

      alert("Događaj je uspešno obrisan!");
      setEvents(events.filter(ev => ev.id !== eventId));
    } catch (err) {
      console.error(err);
      alert("Došlo je do greške. Pokušajte ponovo.");
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (sortField === "title") return a.title.localeCompare(b.title);
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  const paginated = sortedEvents.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Naslov */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Lista događaja
        </h1>

        {/* Kontrole */}
        <div className="flex items-center mb-6 space-x-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Pretraži po nazivu ili opisu..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-grow px-3 py-2 rounded-md border border-gray-300 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Create dugme */}
          <button
            onClick={() => navigate("/admin/events/new")}
            className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md shadow-sm hover:bg-blue-700 transition"
          >
            + Kreiraj događaj
          </button>
        </div>

        {/* Sortiranje */}
        <div className="mb-4 flex items-center space-x-2 text-sm text-gray-800">
          <label>Sortiraj po:</label>
          <select
            className="border px-2 py-1 rounded-md"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
          >
            <option value="start_time">Datumu početka</option>
            <option value="title">Nazivu</option>
          </select>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-800 border-b">
              <tr>
                <th className="p-4 font-medium">Naziv</th>
                <th className="p-4 font-medium">Početak</th>
                <th className="p-4 font-medium">Kraj</th>
                <th className="p-4 font-medium">Lokacija</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Akcije</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    Nema događaja.
                  </td>
                </tr>
              ) : (
                paginated.map(ev => (
                  <tr
                    key={ev.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium">{ev.title}</td>
                    <td className="p-4">{new Date(ev.start_time).toLocaleString()}</td>
                    <td className="p-4">{new Date(ev.end_time).toLocaleString()}</td>
                    <td className="p-4">{ev.location}</td>
                    <td className="p-4">
                      <span
                        className={`
                          px-3 py-1 rounded-full text-xs
                          ${
                            ev.status === "Published"
                              ? "bg-green-100 text-green-700"
                              : ev.status === "Draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-200 text-gray-700"
                          }
                        `}
                      >
                        {ev.status === "Published" ? "Objavljeno" : ev.status === "Draft" ? "Nacrt" : "Arhivirano"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/admin/events/${ev.id}`)}
                          className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
                        >
                          Detalji
                        </button>
                        <button
                          onClick={() => navigate(`/admin/events/${ev.id}/edit`)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                        >
                          Izmeni
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition"
                        >
                          Obriši
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className={`
              px-3 py-1.5 text-sm rounded-md border transition
              ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"}
            `}
          >
            Prethodna
          </button>

          <button
            disabled={page * perPage >= sortedEvents.length}
            onClick={() => setPage(page + 1)}
            className={`
              px-3 py-1.5 text-sm rounded-md border transition
              ${
                page * perPage >= sortedEvents.length
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }
            `}
          >
            Sledeća
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventList;
