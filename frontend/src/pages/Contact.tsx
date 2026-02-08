import { useState } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export default function Contact() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Neuspješno slanje poruke.");
      }

      setSuccessMsg("Poruka je poslata. Hvala!");
      setFullName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Greška pri slanju poruke.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white relative overflow-hidden">
      {/* Background Design Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(41, 74, 112, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 74, 112, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        {/* Diagonal lines */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalLines" patternUnits="userSpaceOnUse" width="100" height="100">
                <path d="M0,100 L100,0" stroke="#294a70" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalLines)" />
          </svg>
        </div>
      </div>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white py-16 md:py-20 px-4 text-center relative">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 py-2
                       bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                       drop-shadow-2xl">
          Kontaktirajte nas
        </h1>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light">
          Rado ćemo odgovoriti na sva vaša pitanja
        </p>
      </div>

      {/* WRAPPER */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 relative z-10">
        {/* INFO SECTION */}
        <div className="mb-20 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70] text-center mb-12 relative">
            Informacije
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {[
              {
                icon: <FaMapMarkerAlt />,
                title: "Adresa",
                lines: [
                  "Univerzitet Mediteran",
                  "Fakultet za informacione tehnologije",
                  "Josipa Broza bb, Podgorica",
                ],
              },
              {
                icon: <FaPhone />,
                title: "Telefon",
                lines: ["+382 20 409 204", "Fax: +382 20 409 232"],
              },
              {
                icon: <FaEnvelope />,
                title: "Email",
                lines: ["fit.alumni.club@gmail.com"],
              },
              {
                icon: <FaClock />,
                title: "Radno vrijeme",
                lines: ["Ponedeljak - Petak", "11:00 - 17:00"],
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 md:p-8 rounded-2xl border-2 border-gray-200
                           text-center transition-all hover:border-[#ffab1f] hover:shadow-xl
                           hover:-translate-y-1"
              >
                <div className="text-4xl text-[#ffab1f] mb-5">{item.icon}</div>

                <h3 className="text-lg md:text-xl font-semibold text-[#294a70] mb-3">
                  {item.title}
                </h3>

                {item.lines.map((l, idx) => (
                  <p
                    key={idx}
                    className="text-gray-600 text-sm md:text-base leading-relaxed"
                  >
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FORM SECTION */}
        <div className="max-w-2xl mx-auto mb-24 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70] text-center mb-12 relative z-10">
            Pošaljite nam poruku
          </h2>

          <form
            onSubmit={onSubmit}
            className="bg-white/80 backdrop-blur-sm p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10"
          >
            <div className="mb-6">
              <label className="block text-[#294a70] font-medium mb-2">
                Ime i prezime
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                placeholder="Vaše ime i prezime"
                className="w-full p-3 border-2 border-gray-300 rounded-lg
                           text-gray-800 focus:outline-none focus:border-[#ffab1f]
                           transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#294a70] font-medium mb-2">
                Email adresa
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="vas@email.com"
                className="w-full p-3 border-2 border-gray-300 rounded-lg
                           text-gray-800 focus:outline-none focus:border-[#ffab1f]
                           transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#294a70] font-medium mb-2">
                Naslov
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                type="text"
                placeholder="Naslov poruke"
                className="w-full p-3 border-2 border-gray-300 rounded-lg
                           text-gray-800 focus:outline-none focus:border-[#ffab1f]
                           transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#294a70] font-medium mb-2">
                Poruka
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Vaša poruka..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-gray-800
                           focus:outline-none focus:border-[#ffab1f] transition min-h-[140px] resize-y"
              />
            </div>

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200">
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold text-lg
                         bg-gradient-to-br from-[#294a70] to-[#324D6B]
                         hover:from-[#ffab1f] hover:to-[#ff9500]
                         transform transition hover:-translate-y-1
                         shadow-md hover:shadow-xl
                         ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Šaljem..." : "Pošalji Poruku"}
            </button>
          </form>
        </div>

        {/* MAP SECTION */}
        <div className="mb-20 relative">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#294a70] text-center mb-12 relative z-10">
            Gdje se nalazimo
          </h2>

          <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10 border-4 border-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2944.971565345187!2d19.267979976505572!3d42.42834013078447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x134deb6802d0cc3b%3A0x6dc41d7a0bc12a45!2sUniverzitet%20Mediteran%20Podgorica!5e0!3m2!1sen!2s!4v1761667141132!5m2!1sen!2s"
              className="w-full h-[320px] sm:h-[380px] md:h-[450px]"
              loading="lazy"
              title="Lokacija Univerziteta Mediteran"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
