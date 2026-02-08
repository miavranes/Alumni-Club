import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  function togglePassword() {
    setShowPassword((v) => !v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Neuspešna prijava");
      }

      login(data.user, data.token);

      setMsg(`Dobrodošao/la, ${data.user.username}!`);

      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/Dashboard");
        } else {
          navigate("/");
        }
      }, 1000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setMsg(err.message);
      } else {
        setMsg("Neuspešna prijava");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-md p-10 bg-gray-50 rounded-2xl shadow-lg flex flex-col items-center text-center">
        <h2 className="text-4xl text-[#294a70] mb-3 font-bold">Prijava</h2>
        <h4 className="text-lg md:text-xl text-gray-600 leading-relaxed font-light mb-8">Unesite svoje podatke kako biste nastavili.</h4>

        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <label htmlFor="username" className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]">
            Korisničko ime:
          </label>
          <input
            type="text"
            placeholder="Korisničko ime"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
          />

          <label htmlFor="password" className="block mt-4 mb-2 font-semibold text-left text-base text-[#294a70]">
            Šifra:
          </label>
          <div className="relative w-full mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Šifra"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-12 px-4 py-3 border-2 border-gray-300 rounded-lg text-base font-inherit transition-colors duration-300 box-border text-gray-800 bg-white h-11 placeholder:text-gray-400 placeholder:text-base focus:outline-none focus:border-[#ffab1f]"
            />
            <span 
              onClick={togglePassword} 
              className="absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer text-gray-600 text-xl transition-colors duration-300 hover:text-[#ffab1f]"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-6 px-8 py-3.5 bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white border-none rounded-lg cursor-pointer text-base font-semibold w-full transition-all duration-300 hover:bg-gradient-to-br hover:from-[#ffab1f] hover:to-[#ff9500] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ffab1f]/30"
          >
            {loading ? "Prijavljujem..." : "Prijavi se"}
          </button>

          <p
            className="mt-4 text-sm text-gray-600 cursor-pointer transition-colors duration-300 hover:text-[#ffab1f] hover:underline text-center"
            onClick={() => navigate("/reset-password")}
          > 
            Zaboravili ste šifru?
          </p>
        </form>

        {msg && (
          <div className={`p-3 rounded-md mt-4 text-center font-medium ${
            msg.includes("Dobrodošao") 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}