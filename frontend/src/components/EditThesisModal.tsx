import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface EditThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSuccess: () => void;
  thesis: any;
}

const EditThesisModal: React.FC<EditThesisModalProps> = ({
  isOpen,
  onClose,
  onEditSuccess,
  thesis,
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Normalizacija imena - zamjena specijalnih karaktera za poređenje
  const normalizeName = (name: string): string => {
    return name
      .replace(/ć/g, 'c').replace(/Ć/g, 'C')
      .replace(/č/g, 'c').replace(/Č/g, 'C')
      .replace(/đ/g, 'dj').replace(/Đ/g, 'Dj')
      .replace(/š/g, 's').replace(/Š/g, 'S')
      .replace(/ž/g, 'z').replace(/Ž/g, 'Z')
      .trim();
  };

  const [alumni, setAlumni] = useState<any[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<any[]>([]);
  const [alumniSearch, setAlumniSearch] = useState("");
  const [showAlumniDropdown, setShowAlumniDropdown] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [mentorSuggestions, setMentorSuggestions] = useState<string[]>([]);
  const [showMentorSuggestions, setShowMentorSuggestions] = useState(false);
  const [committeeSuggestions, setCommitteeSuggestions] = useState<string[]>([]);
  const [showCommitteeSuggestions, setShowCommitteeSuggestions] = useState(false);
  const [committeeMembers, setCommitteeMembers] = useState<string[]>([]);
  const [newCommitteeMember, setNewCommitteeMember] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    title: "",
    subtitle: "",
    title_language: "cg",
    additional_title: "",
    additional_subtitle: "",
    additional_title_language: "",
    type: "bachelors",
    year: new Date().getFullYear(),
    file_url: "",
    zip_file: "",
    mentor: "",
    committee_members: "",
    grade: "",
    keywords: "",
    language: "",
    abstract: "",
    defense_date: "",
    defense_time: "",
    user_id: "",
  });

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const currentFileUrl = formData.file_url
    ? (formData.file_url.startsWith("http://") || formData.file_url.startsWith("https://")
        ? formData.file_url
        : `${BACKEND_URL}${formData.file_url.startsWith("/") ? formData.file_url : `/${formData.file_url}`}`)
    : "";
  const currentZipUrl = formData.zip_file
    ? (formData.zip_file.startsWith("http://") || formData.zip_file.startsWith("https://")
        ? formData.zip_file
        : `${BACKEND_URL}${formData.zip_file.startsWith("/") ? formData.zip_file : `/${formData.zip_file}`}`)
    : "";

  // Učitaj alumni listu
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const response = await axios.get("/api/alumni/directory");
        if (response.data && Array.isArray(response.data.users)) {
          const filteredAlumni = response.data.users.filter((u: any) => u.role !== "admin");
          setAlumni(filteredAlumni);
        }
      } catch (err) {
        console.error("Greška pri učitavanju alumnista:", err);
      }
    };
    if (isOpen) {
      fetchAlumni();
    }
  }, [isOpen]);

  // Popuni formu sa podacima rada
  useEffect(() => {
    if (thesis) {
      const defenseDate = thesis.defense_date ? new Date(thesis.defense_date) : null;
      
      setFormData({
        first_name: thesis.first_name || "",
        last_name: thesis.last_name || "",
        title: thesis.title || "",
        subtitle: thesis.subtitle || "",
        title_language: thesis.title_language || "cg",
        additional_title: thesis.additional_title || "",
        additional_subtitle: thesis.additional_subtitle || "",
        additional_title_language: thesis.additional_title_language || "",
        type: thesis.type || "bachelors",
        year: thesis.year || new Date().getFullYear(),
        file_url: thesis.fileUrl || "",
        zip_file: thesis.zipUrl || "",
        mentor: thesis.mentor || "",
        committee_members: thesis.committee_members || "",
        grade: thesis.grade || "",
        keywords: thesis.keywords || "",
        language: thesis.language || "",
        abstract: thesis.abstract || "",
        defense_date: defenseDate ? defenseDate.toISOString().split('T')[0] : "",
        defense_time: defenseDate ? defenseDate.toTimeString().slice(0, 5) : "",
        user_id: thesis.user_id || "",
      });
      setSelectedFile(null);
      setFileError(null);

      // Popuni članove komisije kao niz
      if (thesis.committee_members) {
        setCommitteeMembers(thesis.committee_members.split(',').map((m: string) => m.trim()).filter(Boolean));
      } else {
        setCommitteeMembers([]);
      }
      setNewCommitteeMember("");

      // Postavi trenutnog alumnistu ako postoji
      if (thesis.user_id) {
        const currentAlumni = alumni.find((a: any) => a.id === thesis.user_id);
        if (currentAlumni) {
          setSelectedAlumni(currentAlumni);
          setAlumniSearch(`${currentAlumni.first_name} ${currentAlumni.last_name}`);
        }
      } else {
        setSelectedAlumni(null);
        setAlumniSearch("");
      }
    }
  }, [thesis, alumni]);

  // Filter alumni based on search
  useEffect(() => {
    if (alumniSearch.trim() === "") {
      setFilteredAlumni(alumni.slice(0, 10)); // Prikaži prvih 10
    } else {
      const searchLower = normalizeName(alumniSearch.toLowerCase());
      const filtered = alumni.filter((a: any) => {
        const fullName = normalizeName(`${a.first_name} ${a.last_name}`.toLowerCase());
        const email = normalizeName(a.email.toLowerCase());
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
      setFilteredAlumni(filtered.slice(0, 10)); // Max 10 rezultata
    }
  }, [alumniSearch, alumni]);

  // Učitaj mentore iz baze
  useEffect(() => {
    if (!isOpen) return;

    const loadSuggestions = async () => {
      try {
        const response = await fetch("/api/theses");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          const seenMentors: { [key: string]: string } = {};
          data.forEach((t: any) => {
            if (t.mentor) {
              const normalized = normalizeName(t.mentor);
              if (!seenMentors[normalized]) seenMentors[normalized] = t.mentor;
            }
          });
          setMentorSuggestions(Object.values(seenMentors).sort());

          const seenCommittee: { [key: string]: string } = {};
          data.forEach((t: any) => {
            if (t.committee_members) {
              t.committee_members.split(',').forEach((m: string) => {
                const member = m.trim();
                if (member) {
                  const normalized = normalizeName(member);
                  if (!seenCommittee[normalized]) seenCommittee[normalized] = member;
                }
              });
            }
          });
          setCommitteeSuggestions(Object.values(seenCommittee).sort());
        }
      } catch (err) {
        console.error("Greska pri ucitavanju sugestija:", err);
      }
    };

    loadSuggestions();
  }, [isOpen]);

  const handleAlumniSelect = (alumnus: any) => {
    setSelectedAlumni(alumnus);
    setAlumniSearch(`${alumnus.first_name} ${alumnus.last_name}`);
    setFormData({ ...formData, user_id: alumnus.id });
    setShowAlumniDropdown(false);
  };

  const handleAlumniClear = () => {
    setSelectedAlumni(null);
    setAlumniSearch("");
    setFormData({ ...formData, user_id: "" });
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
      setSelectedZipFile(null);
      setZipError(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setSelectedFile(null);
      setFileError("Dozvoljeni su samo PDF fajlovi");
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedZipFile(null);
      setZipError(null);
      return;
    }

    const isZip = file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip");

    if (!isZip) {
      setSelectedZipFile(null);
      setZipError("Dozvoljeni su samo ZIP fajlovi");
      return;
    }

    setSelectedZipFile(file);
    setZipError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Kombinuj datum i vrijeme
      let defense_datetime = null;
      if (formData.defense_date && formData.defense_time) {
        defense_datetime = `${formData.defense_date}T${formData.defense_time}:00`;
      }

      const payload = {
        ...formData,
        committee_members: committeeMembers.length > 0 ? committeeMembers.join(", ") : null,
        defense_date: defense_datetime,
        user_id: formData.user_id ? Number(formData.user_id) : null,
      };

      if (!token) {
        throw new Error("Morate biti prijavljeni da biste azurirali rad.");
      }
      await axios.put(`/api/theses/${thesis.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        uploadForm.append("type", formData.type);
        if (formData.title.trim()) {
          uploadForm.append("title", formData.title.trim());
        }
        if (String(formData.year).trim()) {
          uploadForm.append("year", String(formData.year).trim());
        }

        const uploadResponse = await fetch(`/api/theses/upload-pdf/${thesis.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadForm,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Upload nije uspio");
        }
      }

      if (selectedZipFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", selectedZipFile);

        const uploadResponse = await fetch(`/api/theses/upload-zip/${thesis.id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadForm,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) {
          throw new Error(uploadData.message || "Upload nije uspio");
        }
      }

      alert("Rad uspješno ažuriran!");
      onEditSuccess();
      onClose();
    } catch (error: any) {
      console.error("Greška pri ažuriranju rada:", error);
      alert(error.response?.data?.message || "Greška pri ažuriranju rada");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#294a70]">✏️ Edituj rad</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Alumnista */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 Alumnista (vlasnik rada)
            </label>
            <div className="relative">
              <input
                type="text"
                value={alumniSearch}
                onChange={(e) => {
                  setAlumniSearch(e.target.value);
                  setShowAlumniDropdown(true);
                }}
                onFocus={() => setShowAlumniDropdown(true)}
                placeholder="Počni kucati ime, prezime ili email..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#294a70] pr-20"
              />
              {selectedAlumni && (
                <button
                  type="button"
                  onClick={handleAlumniClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Ukloni
                </button>
              )}
              
              {/* Dropdown sa rezultatima */}
              {showAlumniDropdown && filteredAlumni.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredAlumni.map((alumnus) => (
                    <div
                      key={alumnus.id}
                      onClick={() => handleAlumniSelect(alumnus)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-semibold text-gray-800">
                        {alumnus.first_name} {alumnus.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{alumnus.email}</div>
                      {alumnus.enrollment_year && (
                        <div className="text-xs text-gray-400">Generacija: {alumnus.enrollment_year}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedAlumni 
                ? `Izabran: ${selectedAlumni.first_name} ${selectedAlumni.last_name} (${selectedAlumni.email})`
                : "Kucaj da pretražiš alumniste ili ostavi prazno"}
            </p>
          </div>

          {/* Ime i prezime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ime *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Prezime *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Naslov */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Naziv rada *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Podnaslov i jezik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Podnaslov</label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jezik naslova *</label>
              <select
                name="title_language"
                value={formData.title_language}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="cg">Crnogorski (cg)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>

          {/* Dodatni naslov */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-700">Prevod naslova (opciono)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium mb-2">Dodatni naslov</label>
                <input
                  type="text"
                  name="additional_title"
                  value={formData.additional_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Dodatni podnaslov</label>
                <input
                  type="text"
                  name="additional_subtitle"
                  value={formData.additional_subtitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jezik dodatnog naslova</label>
              <select
                name="additional_title_language"
                value={formData.additional_title_language}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">-- Izaberi --</option>
                <option value="cg">Crnogorski (cg)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>

          {/* Tip i godina */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tip rada *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="bachelors">Bachelors</option>
                <option value="masters">Masters</option>
                <option value="specialist">Specialist</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Godina *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1900"
                max="2100"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* PDF upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Otpremi PDF</label>
            {currentFileUrl && !selectedFile && (
              <p className="mb-2 text-sm text-gray-600">
                Trenutni PDF:{" "}
                <a
                  href={currentFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#294a70] hover:underline"
                >
                  Otvori trenutno otpremljeni fajl
                </a>
              </p>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className={`w-full px-4 py-2 border rounded-lg ${
                fileError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {selectedFile && (
              <p className="mt-1 text-sm text-green-600">
                Novi PDF: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {currentFileUrl && (
              <p className="mt-1 text-xs text-gray-500">
                Ako ne izaberes novi PDF, ostace sacuvan ovaj postojeci fajl.
              </p>
            )}
            {fileError && (
              <p className="mt-1 text-sm text-red-500">{fileError}</p>
            )}
          </div>

          {/* ZIP upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Otpremi ZIP (dodatna dokumentacija)
            </label>
            {currentZipUrl && !selectedZipFile && (
              <p className="mb-2 text-sm text-gray-600">
                Trenutni ZIP:{" "}
                <a
                  href={currentZipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#294a70] hover:underline"
                >
                  Preuzmi trenutni ZIP
                </a>
              </p>
            )}
            <input
              type="file"
              accept=".zip,application/zip"
              onChange={handleZipChange}
              className={`w-full px-4 py-2 border rounded-lg ${
                zipError ? "border-red-500" : "border-gray-300"
              }`}
            />
            {selectedZipFile && (
              <p className="mt-1 text-sm text-green-600">
                Novi ZIP: {selectedZipFile.name} ({(selectedZipFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {currentZipUrl && (
              <p className="mt-1 text-xs text-gray-500">
                Ako ne izaberes novi ZIP, ostace sacuvan ovaj postojeci fajl.
              </p>
            )}
            {zipError && (
              <p className="mt-1 text-sm text-red-500">{zipError}</p>
            )}
          </div>

          {/* Mentor */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Mentor *</label>
            <div className="relative">
              <input
                type="text"
                name="mentor"
                value={formData.mentor}
                onChange={(e) => {
                  handleChange(e);
                  setShowMentorSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowMentorSuggestions(formData.mentor.length > 0)}
                onBlur={() => setTimeout(() => setShowMentorSuggestions(false), 200)}
                required
                placeholder="Prof. dr Ivan Petrovic"
                className="w-full px-4 py-2 border rounded-lg"
              />
              {showMentorSuggestions && mentorSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {mentorSuggestions
                    .filter((m) => normalizeName(m.toLowerCase()).includes(normalizeName(formData.mentor.toLowerCase())))
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setFormData({ ...formData, mentor: suggestion });
                          setShowMentorSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                      >
                        {suggestion}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
{/* Članovi komisije */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Članovi komisije</label>
            <div className="space-y-2">
              <div className="flex gap-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newCommitteeMember}
                    onChange={(e) => {
                      setNewCommitteeMember(e.target.value);
                      setShowCommitteeSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowCommitteeSuggestions(newCommitteeMember.length > 0)}
                    onBlur={() => setTimeout(() => setShowCommitteeSuggestions(false), 200)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCommitteeMember.trim()) {
                          setCommitteeMembers([...committeeMembers, newCommitteeMember.trim()]);
                          setNewCommitteeMember("");
                          setShowCommitteeSuggestions(false);
                        }
                      }
                    }}
                    placeholder="Počni kucati ime člana komisije..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  />
                  {showCommitteeSuggestions && committeeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {committeeSuggestions
                        .filter((m) => normalizeName(m.toLowerCase()).includes(normalizeName(newCommitteeMember.toLowerCase())))
                        .filter((m) => !committeeMembers.some(existing => normalizeName(existing) === normalizeName(m)))
                        .map((suggestion, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setCommitteeMembers([...committeeMembers, suggestion]);
                              setNewCommitteeMember("");
                              setShowCommitteeSuggestions(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          >
                            {suggestion}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newCommitteeMember.trim()) {
                      setCommitteeMembers([...committeeMembers, newCommitteeMember.trim()]);
                      setNewCommitteeMember("");
                      setShowCommitteeSuggestions(false);
                    }
                  }}
                  className="px-4 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-colors font-semibold"
                >
                  Dodaj
                </button>
              </div>
              {committeeMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {committeeMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      <span className="text-sm">{member}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCommitteeMembers(committeeMembers.filter((_, i) => i !== index));
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ocjena i jezik */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ocjena</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">-- Izaberi --</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Jezik rada</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">-- Izaberi --</option>
                <option value="cg">Crna Gora</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Ključne riječi */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ključne riječi *</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              required
              placeholder="AI, Machine Learning, Neural Networks"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">Odvojene zarezom</p>
          </div>

          {/* Sažetak */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sažetak</label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Datum odbrane */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Datum i vrijeme odbrane</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                name="defense_date"
                value={formData.defense_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="time"
                name="defense_time"
                value={formData.defense_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] disabled:opacity-50"
            >
              {loading ? "Čuvanje..." : "Sačuvaj izmjene"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditThesisModal;



