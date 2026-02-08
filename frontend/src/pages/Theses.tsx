import { FaSearch, FaFilter, FaUpload, FaSpinner, FaDownload, FaTrash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UploadThesisModal from "../components/UploadThesisModal";
import { getTheses, deleteThesis, Thesis } from "../services/thesesService";

export default function DiplomskiRadovi() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("naziv-asc");
  const [showFilter, setShowFilter] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const data = await getTheses();
      setTheses(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch theses:", err);
      setError("Došlo je do greške prilikom učitavanja diplomskih radova.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheses();
  }, []);

  const handleDownloadPdf = async (url: string, fileName: string) => {
    try {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:4000${url}`;
      const response = await fetch(fullUrl);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
      // Fallback: try opening directly if fetch/blob failed
      const fullUrl = url.startsWith('http') ? url : `http://localhost:4000${url}`;
      window.open(fullUrl, '_blank');
    }
  };

  const getThesisTypeLabel = (type?: string) => {
    if (!type) return "-";
    const mapping: { [key: string]: string } = {
      'bachelors': 'Osnovne studije',
      'masters': 'Master studije',
      'specialist': 'Specijalističke studije',
      'Osnovne studije': 'Osnovne studije',
      'Master studije': 'Master studije',
      'Specijalističke studije': 'Specijalističke studije'
    };
    return mapping[type] || type;
  };

  const handleDeleteThesis = async (id: number) => {
    if (window.confirm("Da li ste sigurni da želite da uklonite ovaj diplomski rad?")) {
      try {
        await deleteThesis(id);
        setTheses(theses.map(t => t.id === id ? { ...t, thesis_title: null as any, thesis_document_url: null as any } : t));
      } catch (err) {
        console.error("Failed to delete thesis:", err);
        alert("Došlo je do greške prilikom brisanja.");
      }
    }
  };

  // Filtriranje (Frontend search + type)
  const filtrirani = theses.filter((p) => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (p.thesis_title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = typeFilter === "all" || getThesisTypeLabel(p.thesis_type) === typeFilter;

    return matchesSearch && matchesType;
  });

  // Sortiranje
  const sortirani = [...filtrirani].sort((a, b) => {
    switch (sortBy) {
      case "ime-asc":
        return a.first_name.localeCompare(b.first_name);
      case "prezime-asc":
        return a.last_name.localeCompare(b.last_name);
      case "naziv-asc":
        return (a.thesis_title || "").localeCompare(b.thesis_title || "");
      default:
        return 0;
    }
  });

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* HERO */}
      <div className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4
                       bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent
                       drop-shadow-2xl">
          Diplomski radovi
        </h1>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light max-w-3xl mx-auto">
          Pregledajte bazu diplomskih radova naših studenata. Koristite
          pretragu da biste brzo pronašli radove po imenu, prezimenu ili
          nazivu rada.
        </p>
      </div>

      {/* SEARCH & FILTER */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-16 mt-8">
        {/* Filter Button */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-[#294a70] text-white rounded-md hover:bg-[#1f3a5a] transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <FaFilter />
            <span>Sortiraj</span>
          </button>

          {showFilter && (
            <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-[#294a70] rounded-lg shadow-xl overflow-hidden z-50">
              <div className="pb-2">
                <div className="px-4 py-2 text-xs text-gray-300 font-semibold uppercase">Sortiraj</div>
                <button
                  onClick={() => { setSortBy("naziv-asc"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${sortBy === "naziv-asc" ? "bg-[#1f3a5a] font-semibold" : "hover:bg-[#1f3a5a]"}`}
                >
                  Naziv rada (A-Z)
                </button>
                <button
                  onClick={() => { setSortBy("ime-asc"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${sortBy === "ime-asc" ? "bg-[#1f3a5a] font-semibold" : "hover:bg-[#1f3a5a]"}`}
                >
                  Ime studenta (A-Z)
                </button>
                <button
                  onClick={() => { setSortBy("prezime-asc"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${sortBy === "prezime-asc" ? "bg-[#1f3a5a] font-semibold" : "hover:bg-[#1f3a5a]"}`}
                >
                  Prezime studenta (A-Z)
                </button>

                <div className="border-t border-[#1f3a5a] my-1"></div>
                <div className="px-4 py-2 text-xs text-gray-300 font-semibold uppercase">Filtriraj po tipu</div>

                <button
                  onClick={() => { setTypeFilter("all"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${typeFilter === "all" ? "bg-[#1f3a5a] font-semibold text-[#ffab1f]" : "hover:bg-[#1f3a5a]"}`}
                >
                  Svi nivoi studija
                </button>
                <button
                  onClick={() => { setTypeFilter("Osnovne studije"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${typeFilter === "Osnovne studije" ? "bg-[#1f3a5a] font-semibold text-[#ffab1f]" : "hover:bg-[#1f3a5a]"}`}
                >
                  Osnovne studije
                </button>
                <button
                  onClick={() => { setTypeFilter("Master studije"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${typeFilter === "Master studije" ? "bg-[#1f3a5a] font-semibold text-[#ffab1f]" : "hover:bg-[#1f3a5a]"}`}
                >
                  Master studije
                </button>
                <button
                  onClick={() => { setTypeFilter("Specijalističke studije"); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${typeFilter === "Specijalističke studije" ? "bg-[#1f3a5a] font-semibold text-[#ffab1f]" : "hover:bg-[#1f3a5a]"}`}
                >
                  Specijalističke studije
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center w-full sm:w-96">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pretraga po studentu ili nazivu rada..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ffab1f] focus:border-[#ffab1f] shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex-1 flex flex-col items-center px-4 md:px-8 py-8">
        <div className="w-full max-w-6xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-[#294a70] mb-4" />
              <p className="text-gray-600">Učitavanje diplomskih radova...</p>
            </div>
          ) : sortirani.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">Nema pronađenih diplomskih radova.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block shadow-xl rounded-2xl overflow-hidden bg-white border border-gray-100">
                <table className="w-full border-collapse table-auto">
                  <thead className="bg-[#294a70] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Naziv diplomskog rada</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tip rada</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Akcija</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sortirani.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                          {p.first_name} {p.last_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 italic">
                          {p.thesis_title ? `"${p.thesis_title}"` : "Nema otpremljenog rada"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getThesisTypeLabel(p.thesis_type)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDownloadPdf(p.thesis_document_url, `${p.last_name}_${p.first_name}_Thesis.pdf`)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-all text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              <FaDownload size={12} />
                              Preuzmi PDF
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedThesis(p);
                                    setShowUploadModal(true);
                                  }}
                                  className="p-2 text-[#294a70] hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Otpremi"
                                >
                                  <FaUpload size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteThesis(p.id)}
                                  disabled={!p.thesis_document_url}
                                  className={`p-2 rounded-lg transition-colors ${p.thesis_document_url
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-300 cursor-not-allowed"
                                    }`}
                                  title="Obriši"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 w-full">
                {sortirani.map((p) => (
                  <div key={p.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{p.first_name} {p.last_name}</h3>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Student</p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedThesis(p);
                              setShowUploadModal(true);
                            }}
                            className="p-2 text-[#294a70] bg-blue-50 rounded-lg"
                            title="Otpremi"
                          >
                            <FaUpload size={14} />
                          </button>
                          {p.thesis_document_url && (
                            <button
                              onClick={() => handleDeleteThesis(p.id)}
                              className="p-2 text-red-600 bg-red-50 rounded-lg"
                              title="Obriši"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mb-5 space-y-2">
                      <p className="text-sm text-gray-700 leading-relaxed italic border-l-4 border-[#ffab1f] pl-3 py-1">
                        {p.thesis_title ? `"${p.thesis_title}"` : "Nema otpremljenog rada"}
                      </p>
                      {p.thesis_type && (
                        <p className="text-xs font-semibold text-[#294a70] bg-blue-50 inline-block px-2 py-1 rounded">
                          {getThesisTypeLabel(p.thesis_type)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(p.thesis_document_url, `${p.last_name}_${p.first_name}_Thesis.pdf`)}
                      disabled={!p.thesis_document_url}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold shadow-lg active:scale-95 transition-transform ${p.thesis_document_url
                        ? "bg-[#294a70] text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                    >
                      <FaDownload size={14} />
                      Preuzmi PDF
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Thesis Modal */}
      <UploadThesisModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedThesis(null);
          fetchTheses();
        }}
        thesisContext={selectedThesis}
      />
    </div>
  );
}
