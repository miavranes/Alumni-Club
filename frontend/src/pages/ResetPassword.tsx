import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE = `${API_BASE_URL}/api/auth`;

export default function ResetPassword() {
  const [step, setStep] = useState<1 | 2>(1);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!username || !email) {
      setError("Unesite korisničko ime i email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/reset-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Provjera podataka nije uspjela.");
      }

      setMsg(
        data.message ||
          "Ako postoji nalog sa ovim podacima, kod je poslat na email."
      );
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Provjera podataka nije uspjela.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!code) {
      setError("Unesite kod koji ste dobili na email.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Unesite novu šifru i potvrdu.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Šifre se ne poklapaju.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/reset-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, code, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Promjena šifre nije uspjela.");
      }

      setMsg(
        data.message || "Šifra je uspješno promijenjena. Preusmjeravam na login."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Promjena šifre nije uspjela.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-md p-10 bg-gray-50 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h2 className="text-4xl text-[#294a70] mb-3 font-bold">Reset šifre</h2>
        <h4 className="text-lg md:text-xl text-gray-600 leading-relaxed font-light mb-8">
          {step === 1
            ? "Unesite korisničko ime i email naloga."
            : "Unesite kod sa emaila i novu šifru."}
        </h4>

        {step === 1 && (
          <form onSubmit={handleCheck} className="w-full flex flex-col">
            <label
              htmlFor="username"
              className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]"
            >
              Korisničko ime:
            </label>
            <input
              id="username"
              type="text"
              placeholder="Korisničko ime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />

            <label
              htmlFor="email"
              className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-8 py-3.5 bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white border-none rounded-lg cursor-pointer text-base font-semibold w-full transition-all duration-300 hover:bg-gradient-to-br hover:from-[#ffab1f] hover:to-[#ff9500] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ffab1f]/30"
            >
              {loading ? "Provjeravam..." : "Dalje"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirm} className="w-full flex flex-col">
            <label
              htmlFor="code"
              className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]"
            >
              Kod sa emaila:
            </label>
            <input
              id="code"
              type="text"
              placeholder="Na primjer 123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />

            <label
              htmlFor="newPassword"
              className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]"
            >
              Nova šifra:
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Nova šifra"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />

            <label
              htmlFor="confirmPassword"
              className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]"
            >
              Ponovite novu šifru:
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Ponovi šifru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-6 px-8 py-3.5 bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white border-none rounded-lg cursor-pointer text-base font-semibold w-full transition-all duration-300 hover:bg-gradient-to-br hover:from-[#ffab1f] hover:to-[#ff9500] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ffab1f]/30"
            >
              {loading ? "Snimam..." : "Sačuvaj šifru"}
            </button>
          </form>
        )}

        {msg && (
          <div className="p-3 rounded-md mt-4 text-center font-medium bg-green-100 text-green-800 border border-green-200">
            {msg}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-md mt-4 text-center font-medium bg-red-100 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-3 px-8 py-3.5 bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white border-none rounded-lg cursor-pointer text-base font-semibold w-full transition-all duration-300 hover:bg-gradient-to-br hover:from-[#ffab1f] hover:to-[#ff9500] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ffab1f]/30"
        >
          Vrati se na prijavu
        </button>
      </div>
    </div>
  );
}
