import { FaSearch, FaFilter } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import UploadCSVModal from "../components/UploadCSVModal";
import AddThesisModal from "../components/AddThesisModal";
import EditThesisModal from "../components/EditThesisModal";
import axios from "axios";
import api from "../services/api";
import { apiFetch } from "../services/fetchApi";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function DiplomskiRadovi() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<"search" | "statistics">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("naziv-asc");
  const [showFilter, setShowFilter] = useState(false);
  const [thesisTypeFilter, setThesisTypeFilter] = useState<string>("all");
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showAddThesisModal, setShowAddThesisModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingThesis, setEditingThesis] = useState<any>(null);
  const [podaci, setPodaci] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedMentor, setSelectedMentor] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const fetchTheses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/theses");
      setPodaci(response.data);
    } catch (err) {
      console.error("Greška pri učitavanju radova:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheses();
  }, []);

  useEffect(() => {
    if (activeTab === "statistics" && !isAdmin) {
      setActiveTab("search");
    }
  }, [activeTab, isAdmin]);

  const handleDeleteThesis = async (thesisId: number) => {
    const confirmed = window.confirm("Da li ste sigurni da zelite da obrisete rad?");
    if (!confirmed) return;

    try {
      const response = await apiFetch(`/api/theses/${thesisId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Greska pri brisanju rada");
      await fetchTheses();
      alert("Rad je uspjesno obrisan");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Greska pri brisanju rada");
    }
  };

  const getFileUrl = (fileUrl?: string | null) => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
    return `${BACKEND_URL}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Neuspjesno preuzimanje fajla");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Greska pri preuzimanju fajla:", err);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) alert("Molimo omogucite pop-up prozore za preuzimanje fajla.");
    }
  };

  const getStatsByYear = () => {
    const yearStats: { [key: number]: { total: number; bachelors: number; masters: number; specialist: number } } = {};
    podaci.forEach(thesis => {
      if (!yearStats[thesis.year]) yearStats[thesis.year] = { total: 0, bachelors: 0, masters: 0, specialist: 0 };
      yearStats[thesis.year].total++;
      if (thesis.type === 'bachelors') yearStats[thesis.year].bachelors++;
      if (thesis.type === 'masters') yearStats[thesis.year].masters++;
      if (thesis.type === 'specialist') yearStats[thesis.year].specialist++;
    });
    return yearStats;
  };

  const yearStats = getStatsByYear();
  const years = Object.keys(yearStats).map(Number).sort((a, b) => b - a);
  const maxThesesInYear = Math.max(...Object.values(yearStats).map(stat => stat.total), 1);

  const normalizeName = (name: string): string =>
    name.replace(/ć/g,'c').replace(/Ć/g,'C').replace(/č/g,'c').replace(/Č/g,'C')
        .replace(/đ/g,'dj').replace(/Đ/g,'Dj').replace(/š/g,'s').replace(/Š/g,'S')
        .replace(/ž/g,'z').replace(/Ž/g,'Z').trim();

  const getMentorStats = () => {
    const stats: { [key: string]: number } = {};
    const display: { [key: string]: string } = {};
    podaci.forEach(t => { if (t.mentor) { const n = normalizeName(t.mentor); if (!display[n]) display[n] = t.mentor; stats[n] = (stats[n] || 0) + 1; } });
    return Object.entries(stats).sort((a,b) => b[1]-a[1]).map(([k,c]) => [display[k],c] as [string,number]);
  };

  const getCommitteeStats = () => {
    const stats: { [key: string]: number } = {};
    const display: { [key: string]: string } = {};
    podaci.forEach(t => { if (t.committee_members) { t.committee_members.split(',').map((m: string) => m.trim()).forEach((m: string) => { if (m) { const n = normalizeName(m); if (!display[n]) display[n] = m; stats[n] = (stats[n] || 0) + 1; } }); } });
    return Object.entries(stats).sort((a,b) => b[1]-a[1]).map(([k,c]) => [display[k],c] as [string,number]);
  };

  const getGradeStats = () => {
    const stats: { [key: string]: number } = {};
    podaci.forEach(t => { if (t.grade) stats[t.grade] = (stats[t.grade] || 0) + 1; });
    return ['A','B','C','D','E','F'].filter(g => stats[g]).map(g => ({ grade: g, count: stats[g] }));
  };

  const getAverageGrade = () => {
    const vals: { [key: string]: number } = { 'A':10,'B':9,'C':8,'D':7,'E':6,'F':5 };
    let total = 0, count = 0;
    podaci.forEach(t => { if (t.grade && vals[t.grade]) { total += vals[t.grade]; count++; } });
    return count > 0 ? (total/count).toFixed(2) : '0.00';
  };

  const getTopicStats = () => {
    const stats: { [key: string]: number } = {};
    const display: { [key: string]: string } = {};
    podaci.forEach(t => { if (t.topic) { const n = normalizeName(t.topic); if (!display[n]) display[n] = t.topic; stats[n] = (stats[n] || 0) + 1; } });
    return Object.entries(stats).sort((a,b) => b[1]-a[1]).slice(0,10).map(([k,c]) => [display[k],c] as [string,number]);
  };

  const getKeywordStats = () => {
    const stats: { [key: string]: number } = {};
    const display: { [key: string]: string } = {};
    podaci.forEach(t => { if (t.keywords) { t.keywords.split(',').map((k: string) => k.trim()).forEach((k: string) => { if (k) { const n = normalizeName(k); if (!display[n]) display[n] = k; stats[n] = (stats[n] || 0) + 1; } }); } });
    return Object.entries(stats).sort((a,b) => b[1]-a[1]).slice(0,15).map(([k,c]) => [display[k],c] as [string,number]);
  };

  const mentorStats: [string, number][] = getMentorStats();
  const committeeStats: [string, number][] = getCommitteeStats();
  const gradeStats = getGradeStats();
  const averageGrade = getAverageGrade();
  const topicStats: [string, number][] = getTopicStats();
  const keywordStats: [string, number][] = getKeywordStats();

  const getUniqueMentors = () => {
    const seen: { [key: string]: string } = {};
    podaci.forEach(p => { if (p.mentor) { const n = normalizeName(p.mentor); if (!seen[n]) seen[n] = p.mentor; } });
    return Object.values(seen).sort();
  };
  const uniqueMentors = getUniqueMentors();
  const uniqueGrades = Array.from(new Set(podaci.map(p => p.grade).filter(Boolean))).sort() as string[];
  const uniqueYears = Array.from(new Set(podaci.map(p => p.year).filter(Boolean))).sort((a: any, b: any) => b - a) as number[];
  const uniqueLanguages = Array.from(new Set(podaci.map(p => p.language).filter(Boolean))).sort() as string[];

  const languageNames: { [key: string]: string } = { 'en': 'English', 'cg': 'Crnogorski' };

  const filtrirani = podaci.filter((p) => {
    const firstName = normalizeName((p.first_name || "").toLowerCase());
    const lastName = normalizeName((p.last_name || "").toLowerCase());
    const title = normalizeName((p.title || "").toLowerCase());
    const mentor = normalizeName((p.mentor || "").toLowerCase());
    const keywords = normalizeName((p.keywords || "").toLowerCase());
    const committeeMembers = normalizeName((p.committee_members || "").toLowerCase());
    const abstract = normalizeName((p.abstract || "").toLowerCase());
    const grade = (p.grade || "").toLowerCase();
    const language = (p.language || "").toLowerCase();
    const additionalTitle = normalizeName((p.additional_title || "").toLowerCase());
    const additionalSubtitle = normalizeName((p.additional_subtitle || "").toLowerCase());
    const searchLower = normalizeName(searchTerm.toLowerCase());
    const yearStr = (p.year || "").toString();

    const matchesSearch = searchTerm === "" ||
      firstName.includes(searchLower) || lastName.includes(searchLower) ||
      title.includes(searchLower) || additionalTitle.includes(searchLower) ||
      additionalSubtitle.includes(searchLower) || mentor.includes(searchLower) ||
      keywords.includes(searchLower) || committeeMembers.includes(searchLower) ||
      abstract.includes(searchLower) || grade.includes(searchLower) ||
      language.includes(searchLower) || yearStr.includes(searchLower);

    const matchesType = thesisTypeFilter === "all" || p.type === thesisTypeFilter;
    const matchesMentor = selectedMentor === "all" || normalizeName(p.mentor || "") === normalizeName(selectedMentor);
    const matchesGrade = selectedGrade === "all" || p.grade === selectedGrade;
    const matchesYear = selectedYear === "all" || p.year?.toString() === selectedYear;
    const matchesLanguage = selectedLanguage === "all" || p.language === selectedLanguage;

    return matchesSearch && matchesType && matchesMentor && matchesGrade && matchesYear && matchesLanguage;
  });

  const sortirani = [...filtrirani].sort((a, b) => {
    switch (sortBy) {
      case "datum-asc": return new Date(a.year).getTime() - new Date(b.year).getTime();
      case "datum-desc": return new Date(b.year).getTime() - new Date(a.year).getTime();
      case "ime-asc": return (a.first_name || "").localeCompare(b.first_name || "");
      case "prezime-asc": return (a.last_name || "").localeCompare(b.last_name || "");
      case "naziv-asc": return (a.title || "").localeCompare(b.title || "");
      default: return 0;
    }
  });

  const isSearching = searchTerm !== "" || thesisTypeFilter !== "all" ||
    selectedMentor !== "all" || selectedGrade !== "all" ||
    selectedYear !== "all" || selectedLanguage !== "all";

  const totalPages = Math.ceil(sortirani.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortirani.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, thesisTypeFilter, sortBy, selectedMentor, selectedGrade, selectedYear, selectedLanguage]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* HERO */}
      <div className="bg-gradient-to-br from-[#294a70] to-[#324D6B] text-white px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
          Diplomski radovi
        </h1>
        <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-light max-w-3xl mx-auto">
          Pregledajte bazu diplomskih radova naših studenata. Koristite pretragu da biste brzo pronašli radove po imenu, prezimenu ili nazivu rada.
        </p>
      </div>

      {/* TAB NAVIGATION */}
      {isAdmin && (
        <div className="w-full bg-gradient-to-b from-gray-50 to-white py-6">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="bg-white rounded-xl shadow-lg p-2 flex gap-2 border border-gray-200">
              <button onClick={() => setActiveTab("search")} className={`flex-1 px-6 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === "search" ? "bg-gradient-to-r from-[#294a70] to-[#324D6B] text-white shadow-md transform scale-105" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                Pretraga
              </button>
              <button onClick={() => setActiveTab("statistics")} className={`flex-1 px-6 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-300 ${activeTab === "statistics" ? "bg-gradient-to-r from-[#294a70] to-[#324D6B] text-white shadow-md transform scale-105" : "bg-transparent text-gray-600 hover:bg-gray-100"}`}>
                Statistika
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === "search" && (
        <>
          <div className="w-full bg-gradient-to-b from-gray-50 to-white py-8">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <button onClick={() => setShowFilter(!showFilter)} className="flex items-center gap-2 px-5 py-3 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center sm:justify-start">
                      <FaFilter />
                      <span className="font-semibold">Sortiraj</span>
                    </button>
                    {showFilter && (
                      <div className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-[#294a70] rounded-lg shadow-xl overflow-hidden z-50">
                        <div className="border-b border-[#1f3a5a] pb-2">
                          <div className="px-4 py-2 text-xs text-gray-300 font-semibold uppercase">Sortiraj</div>
                          {[["naziv-asc","Naziv rada (A-Z)"],["ime-asc","Ime studenta (A-Z)"],["prezime-asc","Prezime studenta (A-Z)"]].map(([val,label]) => (
                            <button key={val} onClick={() => { setSortBy(val); setShowFilter(false); }} className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${sortBy === val ? "bg-[#1f3a5a] font-semibold" : "hover:bg-[#1f3a5a]"}`}>{label}</button>
                          ))}
                          <div className="border-t border-[#1f3a5a] my-1"></div>
                          <div className="px-4 py-2 text-xs text-gray-300 font-semibold uppercase">Filtriraj po tipu</div>
                          {[["all","Svi nivoi studija"],["bachelors","Osnovne studije"],["specialist","Specijalističke studije"],["masters","Master studije"]].map(([val,label]) => (
                            <button key={val} onClick={() => { setThesisTypeFilter(val); setShowFilter(false); }} className={`w-full text-left px-4 py-3 text-sm text-white transition-all ${thesisTypeFilter === val ? "bg-[#1f3a5a] font-semibold" : "hover:bg-[#1f3a5a]"}`}>{label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {user && (
                    <button onClick={() => setShowAddThesisModal(true)} className="flex items-center gap-2 px-5 py-3 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-all shadow-md hover:shadow-lg whitespace-nowrap font-semibold">
                      Dodaj rad
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setShowCsvModal(true)} className="flex items-center gap-2 px-5 py-3 bg-[#50C878] text-white rounded-lg hover:bg-[#3da860] transition-all shadow-md hover:shadow-lg whitespace-nowrap font-semibold">
                      Upload CSV
                    </button>
                  )}
                </div>
                <div className="flex items-center w-full sm:w-96">
                  <div className="relative w-full">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Pretraži po imenu, prezimenu, nazivu, mentoru, jeziku, ključnim riječima..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg text-sm md:text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#294a70] focus:border-[#294a70] shadow-sm hover:border-gray-400 transition-all" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex-1 flex items-center justify-center px-4 md:px-8 py-8 bg-white">
            <div className="w-full max-w-6xl">
              <div className="mb-6">
                <p className="text-sm sm:text-base text-gray-700 bg-blue-50 border-l-4 border-[#294a70] rounded-r-lg p-4 shadow-sm">
                  <strong>Savjet:</strong> Kliknite na "Abstract" da pročitate sažetak rada.
                </p>
              </div>
              <div className="flex gap-6">
                {/* Sidebar filters */}
                <div className="w-64 flex-shrink-0">
                  <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                    <h3 className="font-bold text-lg text-[#294a70] mb-4">Refine search result</h3>
                    <div className="mb-6">
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Tip rada</h4>
                      <div className="space-y-2">
                        {[["all",`Sve (${podaci.length})`],["bachelors",`Osnovne (${podaci.filter(p=>p.type==="bachelors").length})`],["specialist",`Specijalističke (${podaci.filter(p=>p.type==="specialist").length})`],["masters",`Master (${podaci.filter(p=>p.type==="masters").length})`]].map(([val,label]) => (
                          <label key={val} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" checked={thesisTypeFilter === val} onChange={() => setThesisTypeFilter(val)} className="text-[#294a70]" />
                            <span className="text-sm">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {uniqueMentors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Mentor</h4>
                        <select value={selectedMentor} onChange={(e) => setSelectedMentor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#294a70]">
                          <option value="all">Svi mentori</option>
                          {uniqueMentors.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    )}
                    {uniqueGrades.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Ocjena</h4>
                        <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#294a70]">
                          <option value="all">Sve ocjene</option>
                          {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    )}
                    {uniqueYears.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Godina</h4>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#294a70]">
                          <option value="all">Sve godine</option>
                          {uniqueYears.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                        </select>
                      </div>
                    )}
                    {uniqueLanguages.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Jezik</h4>
                        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#294a70]">
                          <option value="all">Svi jezici</option>
                          {uniqueLanguages.map(l => <option key={l} value={l}>{languageNames[l] || l}</option>)}
                        </select>
                      </div>
                    )}
                    <button onClick={() => { setThesisTypeFilter("all"); setSelectedMentor("all"); setSelectedGrade("all"); setSelectedYear("all"); setSelectedLanguage("all"); setSearchTerm(""); }} className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-semibold">
                      Resetuj filtere
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1">
                  {!isSearching ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                      <div className="text-6xl mb-4"></div>
                      <h3 className="text-2xl font-bold text-[#294a70] mb-2">Pretražite diplomske radove</h3>
                      <p className="text-gray-600">Koristite search ili filtere sa leve strane da pronađete radove.</p>
                    </div>
                  ) : currentItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                      <div className="text-6xl mb-4"></div>
                      <h3 className="text-2xl font-bold text-[#294a70] mb-2">Nema rezultata</h3>
                      <p className="text-gray-600">Pokušajte sa drugačijim kriterijumima pretrage.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {currentItems.map((p, idx) => (
                          <div key={p.id} className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all p-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-8 h-8 bg-[#294a70] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {startIndex + idx + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#294a70] mb-2 hover:underline cursor-pointer">
                                  {p.fileUrl ? <a href={p.fileUrl} target="_blank" rel="noopener noreferrer">{p.title}</a> : <span>{p.title}</span>}
                                </h3>
                                {p.subtitle && <div className="text-sm text-gray-700 mb-2">{p.subtitle}</div>}
                                {(p.additional_title || p.additional_subtitle) && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    <span className="font-semibold text-gray-700">Prevod</span>
                                    {p.additional_title_language && <span className="ml-2 text-xs text-gray-500">({languageNames[p.additional_title_language] || p.additional_title_language})</span>}
                                    <div className="mt-1">
                                      {p.additional_title && <div className="text-gray-700">{p.additional_title}</div>}
                                      {p.additional_subtitle && <div className="text-gray-500">{p.additional_subtitle}</div>}
                                    </div>
                                  </div>
                                )}
                                <div className="text-sm text-gray-600 mb-3">{p.year}</div>
                                <div className="text-sm text-gray-600 mb-3">
                                  {p.type === 'bachelors' && (p.language === 'en' ? "Bachelor's Thesis — Basic Studies" : 'Diplomski rad — Osnovne studije')}
                                  {p.type === 'masters' && (p.language === 'en' ? "Master's Thesis — Master Studies" : 'Master rad — Master studije')}
                                  {p.type === 'specialist' && (p.language === 'en' ? 'Specialist Thesis — Specialist Studies' : 'Specijalistički rad — Specijalističke studije')}
                                </div>
                                <div className="flex flex-wrap gap-4 mb-3 text-sm">
                                  <div><span className="font-semibold text-gray-700">{p.language === 'en' ? 'Author:' : 'Autor:'}</span> <span className="text-gray-600">{p.first_name} {p.last_name}</span></div>
                                  {p.mentor && <div><span className="font-semibold text-gray-700">{p.language === 'en' ? 'Supervisor:' : 'Mentor:'}</span> <span className="text-gray-600">{p.mentor}</span></div>}
                                  {p.language && <div><span className="font-semibold text-gray-700">{p.language === 'en' ? 'Language:' : 'Jezik:'}</span> <span className="text-gray-600">{languageNames[p.language] || p.language}</span></div>}
                                </div>
                                {p.defense_date && (
                                  <div className="text-xs text-gray-400 mb-2">
                                    Odbrana: {new Date(p.defense_date).toLocaleDateString('sr-Latn-ME', { day: '2-digit', month: '2-digit', year: 'numeric' })} u {new Date(p.defense_date).toLocaleTimeString('sr-Latn-ME', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                                {p.abstract && (
                                  <details className="mt-3">
                                    <summary className="cursor-pointer text-[#294a70] font-semibold hover:underline inline-flex items-center gap-2">
                                      ▸ {p.language === 'en' ? 'Abstract [en]' : 'Sažetak [cg]'}
                                    </summary>
                                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700 leading-relaxed">{p.abstract}</div>
                                  </details>
                                )}
                                {(p.fileUrl || p.zipUrl) && (
                                  <div className="mt-4 flex flex-wrap gap-3">
                                    {p.fileUrl && (
                                      <button onClick={async () => {
                                        try {
                                          await api.post(`/theses/${p.id}/download`);
                                          const safeTitle = (p.title || "thesis").toString().replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60) || "thesis";
                                          await downloadFile(getFileUrl(p.fileUrl), `${safeTitle}.pdf`);
                                        } catch (err) {
                                          const safeTitle = (p.title || "thesis").toString().replace(/[^a-zA-Z0-9_-]+/g,"_").replace(/^_+|_+$/g,"").slice(0,60) || "thesis";
                                          await downloadFile(getFileUrl(p.fileUrl), `${safeTitle}.pdf`);
                                        }
                                      }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-all shadow-md hover:shadow-lg font-semibold text-sm cursor-pointer">
                                        Download full text (pdf)
                                        {p.download_count > 0 && <span className="ml-2 px-2 py-0.5 bg-white text-[#294a70] rounded-full text-xs font-bold">{p.download_count}</span>}
                                      </button>
                                    )}
                                    {p.zipUrl && (
                                      <button onClick={() => { const newWindow = window.open(getFileUrl(p.zipUrl), "_blank"); if (!newWindow) alert("Molimo omogucite pop-up prozore za preuzimanje ZIP-a."); }} className="inline-flex items-center gap-2 px-4 py-2 bg-[#2f6a6a] text-white rounded-lg hover:bg-[#255555] transition-all shadow-md hover:shadow-lg font-semibold text-sm cursor-pointer">
                                        Preuzmi ZIP
                                      </button>
                                    )}
                                  </div>
                                )}
                                {(isAdmin || user?.id === p.user_id) && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex flex-wrap gap-3">
                                      {isAdmin && (
                                        <button onClick={() => { setEditingThesis(p); setShowEditModal(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-sm">
                                          ✏️ Edituj
                                        </button>
                                      )}
                                      <button onClick={() => handleDeleteThesis(p.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md font-semibold text-sm">
                                        Obrisi
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            Prikazano <span className="font-semibold text-[#294a70]">{startIndex + 1}</span> - <span className="font-semibold text-[#294a70]">{Math.min(endIndex, sortirani.length)}</span> od <span className="font-semibold text-[#294a70]">{sortirani.length}</span> radova
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#294a70] text-white hover:bg-[#1f3a5a] shadow-md hover:shadow-lg'}`}>← Prethodna</button>
                            <div className="flex items-center gap-1">
                              {[...Array(totalPages)].map((_, index) => {
                                const pageNumber = index + 1;
                                if (pageNumber === 1 || pageNumber === totalPages || (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)) {
                                  return <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === pageNumber ? 'bg-[#294a70] text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{pageNumber}</button>;
                                } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                  return <span key={pageNumber} className="text-gray-400 px-1">...</span>;
                                }
                                return null;
                              })}
                            </div>
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#294a70] text-white hover:bg-[#1f3a5a] shadow-md hover:shadow-lg'}`}>Sledeća →</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STATISTICS TAB */}
      {activeTab === "statistics" && (
        <div className="w-full flex-1 px-4 md:px-8 py-8 bg-gray-50">
          <div className="w-full max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-[#294a70] mb-8">Statistika diplomskih radova</h2>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#294a70] mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Učitavanje podataka...</p>
                </div>
              </div>
            ) : podaci.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <span className="text-6xl mb-4 block"></span>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Nema podataka</h3>
                <p className="text-gray-500">Trenutno nema diplomskih radova u bazi.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="bg-white border-2 border-[#294a70] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">Ukupno radova</h3><span className="text-3xl"></span></div>
                    <p className="text-5xl font-bold text-[#294a70]">{podaci.length}</p>
                  </div>
                  <div className="bg-white border-2 border-blue-400 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">Osnovne studije</h3><span className="text-3xl"></span></div>
                    <p className="text-5xl font-bold text-blue-600">{podaci.filter(p => p.type === "bachelors").length}</p>
                  </div>
                  <div className="bg-white border-2 border-purple-400 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">Specijalističke</h3><span className="text-3xl"></span></div>
                    <p className="text-5xl font-bold text-purple-600">{podaci.filter(p => p.type === "specialist").length}</p>
                  </div>
                  <div className="bg-white border-2 border-green-400 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-3"><h3 className="text-xs font-bold uppercase tracking-wide text-gray-600">Master studije</h3><span className="text-3xl"></span></div>
                    <p className="text-5xl font-bold text-green-600">{podaci.filter(p => p.type === "masters").length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
                  <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Grafički prikaz po godinama</h3>
                  {years.length === 0 ? (
                    <div className="text-center py-12 text-gray-500"><p>Nema podataka za prikaz grafikona</p></div>
                  ) : (
                    <div className={years.length > 14 ? "overflow-x-auto" : ""}>
                      <div className="flex items-end justify-between gap-3 md:gap-4 h-96 border-l-4 border-b-4 border-[#294a70] pl-4 pb-4 bg-gradient-to-t from-gray-50 to-white rounded-bl-lg mb-4" style={{ minWidth: years.length > 14 ? `${years.length * 80}px` : 'auto' }}>
                        {years.sort((a, b) => a - b).map(year => {
                          const stats = yearStats[year];
                          const barHeight = (stats.total / Math.max(maxThesesInYear, 10)) * 320;
                          return (
                            <div key={year} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full flex flex-col items-center relative">
                                <div className={`w-5/6 bg-gradient-to-t from-[#294a70] via-[#3d5a7f] to-[#5a7fa0] rounded-t-lg shadow-lg transition-all cursor-pointer border-2 ${hoveredYear === year ? 'border-yellow-400 shadow-2xl' : 'border-[#294a70]'} flex items-start justify-center pt-2`} style={{ height: `${Math.max(barHeight, 40)}px` }} onMouseEnter={() => setHoveredYear(year)} onMouseLeave={() => setHoveredYear(null)}>
                                  <span className="text-sm md:text-base font-bold text-white">{stats.total}</span>
                                </div>
                                {hoveredYear === year && (
                                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 bg-[#294a70] text-white text-xs rounded-lg py-3 px-4 whitespace-nowrap z-50 shadow-xl border-2 border-white pointer-events-none">
                                    <div className="font-bold mb-2 text-sm border-b border-white/30 pb-1">{year}. godina</div>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-400 rounded-full"></span><span>Osnovne: {stats.bachelors}</span></div>
                                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-400 rounded-full"></span><span>Master: {stats.masters}</span></div>
                                      <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-400 rounded-full"></span><span>Spec.: {stats.specialist}</span></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <span className="text-xs md:text-sm font-bold text-[#294a70] mt-2 bg-gray-100 px-3 py-1 rounded-full">{year}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="mt-8 flex flex-wrap gap-6 justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-blue-500 border-2 border-blue-700 rounded shadow-sm"></div><span className="text-sm font-semibold text-gray-700">Osnovne studije</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-purple-500 border-2 border-purple-700 rounded shadow-sm"></div><span className="text-sm font-semibold text-gray-700">Specijalističke studije</span></div>
                    <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-500 border-2 border-green-700 rounded shadow-sm"></div><span className="text-sm font-semibold text-gray-700">Master studije</span></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8">
                  <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Detaljna tabela statistike</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-[#294a70] to-[#3d5a7f] text-white">
                          <th className="px-4 py-3 text-left font-semibold border-r border-white/20">Godina</th>
                          <th className="px-4 py-3 text-center font-semibold border-r border-white/20">Osnovne studije</th>
                          <th className="px-4 py-3 text-center font-semibold border-r border-white/20">Specijalističke</th>
                          <th className="px-4 py-3 text-center font-semibold border-r border-white/20">Master studije</th>
                          <th className="px-4 py-3 text-center font-semibold">Ukupno</th>
                        </tr>
                      </thead>
                      <tbody>
                        {years.map((year, index) => {
                          const stats = yearStats[year];
                          return (
                            <tr key={year} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                              <td className="px-4 py-3 font-bold text-[#294a70] border-b border-gray-200">{year}. godina</td>
                              <td className="px-4 py-3 text-center border-b border-gray-200"><span className="inline-block bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded-full">{stats.bachelors}</span></td>
                              <td className="px-4 py-3 text-center border-b border-gray-200"><span className="inline-block bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">{stats.specialist}</span></td>
                              <td className="px-4 py-3 text-center border-b border-gray-200"><span className="inline-block bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">{stats.masters}</span></td>
                              <td className="px-4 py-3 text-center border-b border-gray-200"><span className="inline-block bg-[#294a70] text-white font-bold px-4 py-1 rounded-full">{stats.total}</span></td>
                            </tr>
                          );
                        })}
                        <tr className="bg-gradient-to-r from-[#294a70] to-[#3d5a7f] text-white font-bold">
                          <td className="px-4 py-4 text-left">UKUPNO</td>
                          <td className="px-4 py-4 text-center text-lg">{podaci.filter(p => p.type === "bachelors").length}</td>
                          <td className="px-4 py-4 text-center text-lg">{podaci.filter(p => p.type === "specialist").length}</td>
                          <td className="px-4 py-4 text-center text-lg">{podaci.filter(p => p.type === "masters").length}</td>
                          <td className="px-4 py-4 text-center text-xl">{podaci.length}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {mentorStats.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8">
                    <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Statistika mentora <span className="text-sm font-normal text-gray-500 ml-2">({mentorStats.length} mentora)</span></h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {mentorStats.map(([mentor, count], index) => {
                        const percentage = (count / mentorStats[0][1]) * 60;
                        return (
                          <div key={mentor} className="flex items-center gap-4 group">
                            <div className="w-8 h-8 bg-[#294a70] text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{index + 1}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1"><span className="font-semibold text-gray-700">{mentor}</span><span className="text-[#294a70] font-bold">{count} radova</span></div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"><div className="bg-gradient-to-r from-[#294a70] to-[#3d5a7f] h-full rounded-full" style={{ width: `${percentage}%` }}></div></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {committeeStats.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8">
                    <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Statistika članova komisija <span className="text-sm font-normal text-gray-500 ml-2">({committeeStats.length} članova)</span></h3>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {committeeStats.map(([member, count], index) => {
                        const percentage = (count / committeeStats[0][1]) * 60;
                        return (
                          <div key={member} className="flex items-center gap-4 group">
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{index + 1}</div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1"><span className="font-semibold text-gray-700">{member}</span><span className="text-green-600 font-bold">{count} radova</span></div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden"><div className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full" style={{ width: `${percentage}%` }}></div></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  {gradeStats.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                      <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Statistika ocjena</h3>
                      <div className="space-y-4">
                        {gradeStats.map(({ grade, count }) => {
                          const totalGrades = gradeStats.reduce((sum, g) => sum + g.count, 0);
                          const percentage = (count / totalGrades) * 100;
                          const gradeColors: { [key: string]: string } = { 'A':'from-green-500 to-green-600','B':'from-blue-500 to-blue-600','C':'from-yellow-500 to-yellow-600','D':'from-orange-500 to-orange-600','E':'from-red-400 to-red-500','F':'from-red-600 to-red-700' };
                          return (
                            <div key={grade}>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3"><span className="text-2xl font-bold text-[#294a70] w-8">{grade}</span><span className="text-gray-600">({percentage.toFixed(1)}%)</span></div>
                                <span className="font-bold text-[#294a70]">{count}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"><div className={`bg-gradient-to-r ${gradeColors[grade]} h-full rounded-full`} style={{ width: `${percentage}%` }}></div></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-[#294a70] to-[#3d5a7f] rounded-xl shadow-lg p-6 md:p-8 flex flex-col justify-center items-center text-white">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><span></span> Prosječna ocjena</h3>
                    <div className="text-center">
                      <div className="text-8xl font-bold mb-4 drop-shadow-lg">{averageGrade}</div>
                      <p className="text-gray-200 text-lg mb-2">od 10.00</p>
                      <div className="mt-6 flex justify-center gap-2">
                        {[...Array(10)].map((_, i) => <div key={i} className={`w-3 h-12 rounded-full transition-all duration-300 ${i < Math.floor(parseFloat(averageGrade)) ? 'bg-white shadow-lg' : 'bg-white/30'}`}></div>)}
                      </div>
                    </div>
                  </div>
                </div>

                {keywordStats.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mt-8">
                    <h3 className="text-2xl font-bold text-[#294a70] mb-6 flex items-center gap-2"><span></span> Statistika ključnih riječi</h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {keywordStats.map(([keyword, count]) => {
                        const size = Math.max(14, Math.min(32, (count / keywordStats[0][1]) * 32));
                        return (
                          <div key={keyword} className="bg-gradient-to-r from-[#294a70] to-[#3d5a7f] text-white px-4 py-2 rounded-full hover:shadow-xl transition-all hover:scale-110 cursor-pointer" style={{ fontSize: `${size}px` }}>
                            <span className="font-semibold">{keyword}</span><span className="ml-2 text-xs opacity-80">({count})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <UploadCSVModal isOpen={showCsvModal} onClose={() => setShowCsvModal(false)} onUploadSuccess={fetchTheses} />
      <AddThesisModal isOpen={showAddThesisModal} onClose={() => setShowAddThesisModal(false)} onSuccess={fetchTheses} />
      <EditThesisModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingThesis(null); }}
        onEditSuccess={fetchTheses}
        thesis={editingThesis}
      />
    </div>
  );
}
