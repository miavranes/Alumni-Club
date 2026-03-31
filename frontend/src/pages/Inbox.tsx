import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

interface Message {
  id: number;
  subject: string;
  content: string;
  sent_date: string;
  read_at: string | null;
  sender_id: number;
  receiver_id: number;
  sender_first_name?: string;
  sender_last_name?: string;
  receiver_first_name?: string;
  receiver_last_name?: string;
}

type TabType = "inbox" | "sent";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_BASE_URL}/api/messages`;

export default function Inbox() {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>("inbox");
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [receiverIdInput, setReceiverIdInput] = useState("");
  const [subjectInput, setSubjectInput] = useState("");
  const [contentInput, setContentInput] = useState("");

  // Load inbox + sent on first mount
  useEffect(() => {
    if (!token) return;
    loadMessages();
  }, [token]);

  async function loadMessages() {
    try {
      setLoading(true);
      setError(null);

      const [inboxRes, sentRes] = await Promise.all([
        fetch(`${API_BASE}/inbox`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!inboxRes.ok || !sentRes.ok) {
        throw new Error("Greška pri učitavanju poruka");
      }

      const inboxData = await inboxRes.json();
      const sentData = await sentRes.json();

      setInbox(inboxData.messages || []);
      setSent(sentData.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Desila se greška");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleString("sr-ME");
  }

  async function handleSelectMessage(msg: Message) {
    setSelectedMessage(msg);

    // If unread inbox message → mark as read
    if (activeTab === "inbox" && !msg.read_at && token) {
      try {
        const res = await fetch(`${API_BASE}/${msg.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const updated = await res.json();
          const readAt = updated.message.read_at as string | null;

          setInbox((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, read_at: readAt } : m))
          );

          setSelectedMessage((prev) =>
            prev && prev.id === msg.id ? { ...prev, read_at: readAt } : prev
          );
        }
      } catch (err) {
        console.error("Greška pri označavanju kao pročitano:", err);
      }
    }
  }

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault();
    if (!token) return;

    const receiverId = Number(receiverIdInput);

    if (!receiverId || !subjectInput.trim() || !contentInput.trim()) {
      setError("Popunite sva polja");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          subject: subjectInput.trim(),
          content: contentInput.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Greška pri slanju poruke");
      }

      // Add new message to Sent tab
      const newMsg: Message = data.message;
      setSent((prev) => [newMsg, ...prev]);

      // Clear form
      setReceiverIdInput("");
      setSubjectInput("");
      setContentInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri slanju poruke");
    } finally {
      setSending(false);
    }
  }

  const currentlyShown = activeTab === "inbox" ? inbox : sent;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-6">Inbox</h1>

      {user?.role === "guest" && (
        <p className="text-white mb-4">
          Gosti nemaju pristup privatnim porukama.
        </p>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-3 border-b pb-3">
          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              activeTab === "inbox"
                ? "bg-[#324D6B] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("inbox");
              setSelectedMessage(null);
            }}
          >
            Primljene
          </button>

          <button
            className={`px-4 py-2 rounded-md text-sm font-semibold ${
              activeTab === "sent"
                ? "bg-[#324D6B] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => {
              setActiveTab("sent");
              setSelectedMessage(null);
            }}
          >
            Poslate
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm border border-red-300 bg-red-50 px-3 py-2 rounded">
            {error}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Message list */}
          <div className="md:col-span-1 border rounded-md bg-gray-50 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b">
              <span className="font-semibold text-sm">
                {activeTab === "inbox" ? "Primljene poruke" : "Poslate poruke"}
              </span>
              {loading && (
                <span className="text-xs text-gray-500">Učitavanje...</span>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {currentlyShown.length === 0 && !loading && (
                <p className="text-sm text-gray-500 px-3 py-4">Nema poruka.</p>
              )}

              {currentlyShown.map((msg) => {
                const isUnread = activeTab === "inbox" && !msg.read_at;

                const personName =
                  activeTab === "inbox"
                    ? `${msg.sender_first_name ?? ""} ${
                        msg.sender_last_name ?? ""
                      }`.trim() || `Korisnik #${msg.sender_id}`
                    : `${msg.receiver_first_name ?? ""} ${
                        msg.receiver_last_name ?? ""
                      }`.trim() || `Korisnik #${msg.receiver_id}`;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`px-3 py-3 border-b cursor-pointer text-left ${
                      selectedMessage?.id === msg.id
                        ? "bg-blue-50"
                        : isUnread
                        ? "bg-yellow-50"
                        : "bg-white"
                    } hover:bg-blue-50 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">
                        {msg.subject}
                      </span>

                      {isUnread && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">
                          Novo
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-1">{personName}</div>

                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(msg.sent_date)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message detail + send form */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Selected message */}
            <div className="border rounded-md p-4 min-h-40 bg-gray-50">
              {selectedMessage ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">
                      {selectedMessage.subject}
                    </h2>
                    <span className="text-xs text-gray-500">
                      {formatDate(selectedMessage.sent_date)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {(() => {
                      const senderName =
                        `${selectedMessage.sender_first_name ?? ""} ${
                          selectedMessage.sender_last_name ?? ""
                        }`.trim() || `Korisnik #${selectedMessage.sender_id}`;

                      const receiverName =
                        `${selectedMessage.receiver_first_name ?? ""} ${
                          selectedMessage.receiver_last_name ?? ""
                        }`.trim() || `Korisnik #${selectedMessage.receiver_id}`;

                      return activeTab === "inbox" ? (
                        <span>
                          Od: <strong>{senderName}</strong>
                        </span>
                      ) : (
                        <span>
                          Za: <strong>{receiverName}</strong>
                        </span>
                      );
                    })()}
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {selectedMessage.content}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  Izaberite poruku sa liste da biste vidjeli detalje.
                </p>
              )}
            </div>

            {/* New message form */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h2 className="text-md font-semibold mb-3">Nova poruka</h2>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                    ID primaoca:
                  </label>
                  <input
                    type="number"
                    className="w-full md:w-2/3 border rounded px-3 py-2 text-sm"
                    placeholder="Unesite ID korisnika primaoca"
                    value={receiverIdInput}
                    onChange={(e) => setReceiverIdInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <label className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                    Naslov:
                  </label>
                  <input
                    type="text"
                    className="w-full md:w-2/3 border rounded px-3 py-2 text-sm"
                    placeholder="Naslov poruke"
                    value={subjectInput}
                    onChange={(e) => setSubjectInput(e.target.value)}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                  <label className="w-full md:w-1/3 text-sm font-medium text-gray-700">
                    Poruka:
                  </label>
                  <textarea
                    className="w-full md:w-2/3 border rounded px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Tekst poruke"
                    value={contentInput}
                    onChange={(e) => setContentInput(e.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-4 py-2 text-sm font-semibold rounded-md bg-[#324D6B] text-white hover:bg-[#263852] disabled:opacity-60"
                  >
                    {sending ? "Slanje..." : "Pošalji"}
                  </button>
                </div>
              </form>

              <p className="text-xs text-gray-500 mt-2">
                Za sada se ID primaoca unosi ručno. Kasnije možete povezati sa
                listom Alumnista.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
