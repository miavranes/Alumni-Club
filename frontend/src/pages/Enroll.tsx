import React, { useState } from "react";
import api from "../services/api";
import akfitLogo from "../assets/akfit.png";

export default function Enroll() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Ime i prezime je obavezno";
    if (!formData.email.trim()) newErrors.email = "Email je obavezan";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Nevažeći email";
    if (!formData.message.trim()) newErrors.message = "Poruka je obavezna";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    try {
      setLoading(true);
      await api.post("/enroll", formData);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", message: "" });
    } catch {
      setSubmitError("Došlo je do greške pri slanju prijave. Pokušajte ponovo.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  return (
    <div className="min-h-screen bg-[#294a70] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src={akfitLogo} alt="Alumni klub FIT" className="h-16 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-[#294a70] text-center mb-2">
          Pridružite se Alumni klubu
        </h2>
        <p className="text-gray-500 text-center text-sm mb-6">
          Pošaljite prijavu i budite dio naše mreže bivših studenata.
        </p>

        {submitSuccess ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-bold text-[#294a70] mb-2">Prijava poslata!</h3>
            <p className="text-gray-600">Kontaktiraćemo vas uskoro.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ime i prezime *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#294a70] focus:border-[#294a70] transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#294a70] focus:border-[#294a70] transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Poruka *
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#294a70] focus:border-[#294a70] transition-all resize-vertical ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ffab1f] hover:bg-[#ff9500] text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
            >
              {loading ? "Slanje..." : "Pošaljite prijavu"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
