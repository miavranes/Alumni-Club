import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

interface AddThesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AlumniOption {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  username?: string;
}

export default function AddThesisModal({ isOpen, onClose, onSuccess }: AddThesisModalProps) {
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

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

  // Alumnista polja
  const [selectExistingAlumni, setSelectExistingAlumni] = useState(true);
  const [selectedAlumniId, setSelectedAlumniId] = useState("");
  const [newAlumniFirstName, setNewAlumniFirstName] = useState("");
  const [newAlumniLastName, setNewAlumniLastName] = useState("");
  const [alumniOptions, setAlumniOptions] = useState<AlumniOption[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniOption[]>([]);
  const [alumniSearch, setAlumniSearch] = useState("");
  const [showAlumniDropdown, setShowAlumniDropdown] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Polja za naslov
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [titleLanguage, setTitleLanguage] = useState("en");
  const [additionalTitle, setAdditionalTitle] = useState("");
  const [additionalSubtitle, setAdditionalSubtitle] = useState("");
  const [additionalTitleLanguage, setAdditionalTitleLanguage] = useState("");

  // Ostala polja
  const [thesisType, setThesisType] = useState("bachelors");
  const [year, setYear] = useState("");
  const [mentor, setMentor] = useState("");
  const [mentorSuggestions, setMentorSuggestions] = useState<string[]>([]);
  const [showMentorSuggestions, setShowMentorSuggestions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [committeeMembers, setCommitteeMembers] = useState<string[]>([]);
  const [newCommitteeMember, setNewCommitteeMember] = useState("");
  const [committeeSuggestions, setCommitteeSuggestions] = useState<string[]>([]);
  const [showCommitteeSuggestions, setShowCommitteeSuggestions] = useState(false);
  const [grade, setGrade] = useState("");
  const [language, setLanguage] = useState("en");
  const [keywords, setKeywords] = useState("");
  const [abstract, setAbstract] = useState("");
  const [defenseDate, setDefenseDate] = useState("");
  const [defenseTime, setDefenseTime] = useState("");

  const readJsonSafe = async (response: Response) => {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  };

  const toDotSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .replace(/\.+/g, ".");

  useEffect(() => {
    if (!isAdmin || !isOpen) {
      return;
    }

    const loadAlumni = async () => {
      try {
        const response = await fetch("/api/alumni/directory");
        const data = await response.json();
        if (response.ok && Array.isArray(data.users)) {
          setAlumniOptions(
            data.users.map((u: AlumniOption) => ({
              id: u.id,
              first_name: u.first_name,
              last_name: u.last_name,
              email: u.email,
              username: u.username,
            }))
          );
        }
      } catch (err) {
        console.error("Greska pri ucitavanju alumnista:", err);
      }
    };

    loadAlumni();
  }, [isAdmin, isOpen]);

  // Filter alumni based on search
  useEffect(() => {
    if (alumniSearch.trim() === "") {
      setFilteredAlumni(alumniOptions.slice(0, 10)); // Prikaži prvih 10
    } else {
      const searchLower = normalizeName(alumniSearch.toLowerCase());
      const filtered = alumniOptions.filter((a: AlumniOption) => {
        const fullName = normalizeName(`${a.first_name} ${a.last_name}`.toLowerCase());
        return fullName.includes(searchLower);
      });
      setFilteredAlumni(filtered.slice(0, 10)); // Max 10 rezultata
    }
  }, [alumniSearch, alumniOptions]);

  const handleAlumniSelect = (alumnus: AlumniOption) => {
    setSelectedAlumni(alumnus);
    setAlumniSearch(`${alumnus.first_name} ${alumnus.last_name}`);
    setSelectedAlumniId(String(alumnus.id));
    setShowAlumniDropdown(false);
  };

  const handleAlumniClear = () => {
    setSelectedAlumni(null);
    setAlumniSearch("");
    setSelectedAlumniId("");
  };

  // Učitaj mentore i članove komisije iz baze
  useEffect(() => {
    if (!isOpen) return;

    const loadSuggestions = async () => {
      try {
        const response = await fetch("/api/theses");
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          // Izvuci jedinstvene mentore (normalizovano)
          const seenMentors: { [key: string]: string } = {};
          data.forEach((t: any) => {
            if (t.mentor) {
              const normalized = normalizeName(t.mentor);
              if (!seenMentors[normalized]) seenMentors[normalized] = t.mentor;
            }
          });
          setMentorSuggestions(Object.values(seenMentors).sort());

          // Izvuci jedinstvene članove komisije (normalizovano)
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

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setFileError(null);
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
    setErrorMessage("");

    if (!user) {
      setErrorMessage("Morate biti prijavljeni da biste dodali rad.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Naziv rada je obavezan.");
      return;
    }

    if (!titleLanguage.trim()) {
      setErrorMessage("Jezik naslova je obavezan.");
      return;
    }

    const parsedYear = Number(year);
    if (!year || Number.isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      setErrorMessage("Godina mora biti izmedju 1900 i 2100.");
      return;
    }

    if ((additionalTitle.trim() || additionalSubtitle.trim()) && !additionalTitleLanguage.trim()) {
      setErrorMessage("Jezik dodatnog naslova je obavezan kada unosite prevod.");
      return;
    }

    if (!keywords.trim()) {
      setErrorMessage("Ključne riječi su obavezne.");
      return;
    }

    if (!mentor.trim()) {
      setErrorMessage("Mentor je obavezan.");
      return;
    }

    if (!selectedFile) {
      setErrorMessage("PDF fajl je obavezan.");
      return;
    }

    let authorFirstName = user.first_name || "";
    let authorLastName = user.last_name || "";
    let authorUserId = user.id;

    if (isAdmin) {
      if (selectExistingAlumni) {
        if (!selectedAlumniId) {
          setErrorMessage("Morate izabrati alumnistu.");
          return;
        }
        const selected = alumniOptions.find((a) => a.id === Number(selectedAlumniId));
        if (!selected) {
          setErrorMessage("Izabrani alumnista nije pronadjen.");
          return;
        }
        authorFirstName = selected.first_name;
        authorLastName = selected.last_name;
        authorUserId = selected.id;
      } else {
        // Dodavanje novog alumnistu
        if (!newAlumniFirstName.trim() || !newAlumniLastName.trim()) {
          setErrorMessage("Ime i prezime novog alumniste su obavezni.");
          return;
        }

        const proposedEmail = `${toDotSlug(newAlumniFirstName)}.${toDotSlug(newAlumniLastName)}@gmail.com`;
        const proposedUsername = `${toDotSlug(newAlumniFirstName)}.${toDotSlug(newAlumniLastName)}`;
        const normalizedNew = normalizeName(`${newAlumniFirstName} ${newAlumniLastName}`.toLowerCase());
        const duplicate = alumniOptions.find((a) => {
          const normalizedExisting = normalizeName(`${a.first_name} ${a.last_name}`.toLowerCase());
          const emailMatch = a.email?.toLowerCase() === proposedEmail.toLowerCase();
          const usernameMatch = a.username?.toLowerCase() === proposedUsername.toLowerCase();
          return normalizedExisting === normalizedNew || emailMatch || usernameMatch;
        });

        if (duplicate) {
          setErrorMessage("Alumnista već postoji. Molimo izaberite postojećeg.");
          setSelectExistingAlumni(true);
          setSelectedAlumni(duplicate);
          setAlumniSearch(`${duplicate.first_name} ${duplicate.last_name}`);
          setSelectedAlumniId(String(duplicate.id));
          setShowAlumniDropdown(false);
          return;
        }
        
        // Kreiraj novog alumnistu u bazi
        try {
          const createUserResponse = await fetch("/api/admin/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              first_name: newAlumniFirstName.trim(),
              last_name: newAlumniLastName.trim(),
              email: proposedEmail,
              username: proposedUsername,
              password: Math.random().toString(36).slice(-8), // Privremena lozinka
              role: "user",
              enrollment_year: parsedYear,
            }),
          });

          const userData = await readJsonSafe(createUserResponse);
          if (!createUserResponse.ok) {
            throw new Error(
              userData?.message
                ? `${userData.message}${userData?.error ? `: ${userData.error}` : ""}`
                : "Greska pri kreiranju novog alumnistu."
            );
          }

          authorFirstName = newAlumniFirstName.trim();
          authorLastName = newAlumniLastName.trim();
          authorUserId = userData?.id; // userData je direktno user objekat
        } catch (err: any) {
          console.error(err);
          setErrorMessage(err.message || "Greska pri kreiranju novog alumnistu.");
          return;
        }
      }
    }

    if (!authorFirstName || !authorLastName) {
      setErrorMessage("Ime i prezime autora su obavezni.");
      return;
    }

    const payload = {
      first_name: authorFirstName,
      last_name: authorLastName,
      title: title.trim(),
      subtitle: subtitle.trim() || null,
      title_language: titleLanguage.trim(),
      additional_title: additionalTitle.trim() || null,
      additional_subtitle: additionalSubtitle.trim() || null,
      additional_title_language: additionalTitleLanguage.trim() || null,
      type: thesisType,
      year: parsedYear,
      file_url: "",
      mentor: mentor.trim(),
      committee_members: committeeMembers.length > 0 ? committeeMembers.join(", ") : null,
      grade: grade || null,
      keywords: keywords.trim(),
      language: language.trim() || null,
      abstract: abstract.trim() || null,
      defense_date: defenseDate && defenseTime 
        ? new Date(`${defenseDate}T${defenseTime}`).toISOString() 
        : null,
      user_id: authorUserId,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/theses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await readJsonSafe(response);
      if (!response.ok) {
        throw new Error(data?.message || "Greska pri dodavanju rada.");
      }

      if (selectedFile) {
        const createdId = data?.id ?? data?.thesis?.id;
        if (!createdId) {
          throw new Error("Nije moguce otpremiti PDF jer ID rada nije dostupan.");
        }

        const uploadForm = new FormData();
        uploadForm.append("file", selectedFile);
        uploadForm.append("type", thesisType);
        if (title.trim()) {
          uploadForm.append("title", title.trim());
        }
        if (String(parsedYear).trim()) {
          uploadForm.append("year", String(parsedYear).trim());
        }

        const uploadResponse = await fetch(`/api/theses/upload-pdf/${createdId}`, {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await readJsonSafe(uploadResponse);
        if (!uploadResponse.ok) {
          throw new Error(uploadData?.message || "Upload nije uspio");
        }
      }

      if (selectedZipFile) {
        const createdId = data?.id ?? data?.thesis?.id;
        if (!createdId) {
          throw new Error("Nije moguce otpremiti ZIP jer ID rada nije dostupan.");
        }

        const uploadForm = new FormData();
        uploadForm.append("file", selectedZipFile);

        const uploadResponse = await fetch(`/api/theses/upload-zip/${createdId}`, {
          method: "POST",
          body: uploadForm,
        });

        const uploadData = await readJsonSafe(uploadResponse);
        if (!uploadResponse.ok) {
          throw new Error(uploadData?.message || "Upload nije uspio");
        }
      }

      await onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Greska pri dodavanju rada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#294a70]">Dodaj diplomski rad</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}
          {/* Alumnista sekcija - samo za admina */}
          {isAdmin && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg text-[#294a70] mb-4">Alumnista</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={selectExistingAlumni}
                      onChange={() => setSelectExistingAlumni(true)}
                      className="text-[#294a70]"
                    />
                    <span>Izaberi postojećeg</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!selectExistingAlumni}
                      onChange={() => setSelectExistingAlumni(false)}
                      className="text-[#294a70]"
                    />
                    <span>Dodaj novog</span>
                  </label>
                </div>

                {selectExistingAlumni ? (
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Izaberi alumnistu
                    </label>
                    <input
                      type="text"
                      value={alumniSearch}
                      onChange={(e) => {
                        setAlumniSearch(e.target.value);
                        setShowAlumniDropdown(true);
                      }}
                      onFocus={() => setShowAlumniDropdown(true)}
                      placeholder="Počni kucati ime ili prezime..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] pr-20"
                    />
                    {selectedAlumni && (
                      <button
                        type="button"
                        onClick={handleAlumniClear}
                        className="absolute right-2 top-10 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
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
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedAlumni && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Izabran: {selectedAlumni.first_name} {selectedAlumni.last_name}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ime <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAlumniFirstName}
                        onChange={(e) => setNewAlumniFirstName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                        placeholder="Unesite ime"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Prezime <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAlumniLastName}
                        onChange={(e) => setNewAlumniLastName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                        placeholder="Unesite prezime"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Naslov sekcija */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-[#294a70] mb-4">Naslov rada</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Naziv rada <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  placeholder="Unesite naziv rada"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Podnaslov (opciono)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  placeholder="Unesite podnaslov"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jezik naslova <span className="text-red-500">*</span>
                </label>
                <select
                  value={titleLanguage}
                  onChange={(e) => setTitleLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  required
                >
                  <option value="en">English</option>
                  <option value="cg">Crna Gora</option>
                </select>
              </div>

              <div className="border-t border-gray-300 pt-4 mt-4">
                <h4 className="font-semibold text-gray-700 mb-3">Dodatni naslov (opciono)</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dodatni naslov
                    </label>
                    <input
                      type="text"
                      value={additionalTitle}
                      onChange={(e) => setAdditionalTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                      placeholder="Unesite dodatni naslov"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dodatni podnaslov
                    </label>
                    <input
                      type="text"
                      value={additionalSubtitle}
                      onChange={(e) => setAdditionalSubtitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                      placeholder="Unesite dodatni podnaslov"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jezik dodatnog naslova
                    </label>
                    <select
                      value={additionalTitleLanguage}
                      onChange={(e) => setAdditionalTitleLanguage(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                    >
                      <option value="">-- Izaberi jezik --</option>
                      <option value="en">English</option>
                      <option value="cg">Crna Gora</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Osnovni podaci */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-[#294a70] mb-4">Osnovni podaci</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tip rada <span className="text-red-500">*</span>
                </label>
                <select
                  value={thesisType}
                  onChange={(e) => setThesisType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  required
                >
                  <option value="bachelors">Osnovne studije</option>
                  <option value="masters">Master studije</option>
                  <option value="specialist">Specijalističke studije</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Godina <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  placeholder="2024"
                  min="1900"
                  max="2100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jezik rada <span className="text-red-500">*</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  required
                >
                  <option value="en">English</option>
                  <option value="cg">Crna Gora</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ocjena
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                >
                  <option value="">-- Izaberi ocjenu --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Otpremi PDF <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                required
                className={`w-full px-4 py-2 border rounded-lg ${
                  fileError ? "border-red-500" : "border-gray-300"
                }`}
              />
              {selectedFile && (
                <p className="mt-1 text-sm text-green-600">
                  Novi PDF: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {fileError && (
                <p className="mt-1 text-sm text-red-500">{fileError}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Otpremi ZIP (dodatna dokumentacija) (opciono)
              </label>
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
                  ZIP: {selectedZipFile.name} ({(selectedZipFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              {zipError && (
                <p className="mt-1 text-sm text-red-500">{zipError}</p>
              )}
            </div>
          </div>

          {/* Mentor i komisija */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-[#294a70] mb-4">Mentor i komisija</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mentor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={mentor}
                  onChange={(e) => {
                    setMentor(e.target.value);
                    setShowMentorSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowMentorSuggestions(mentor.length > 0)}
                  onBlur={() => setTimeout(() => setShowMentorSuggestions(false), 200)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  placeholder="Ime i prezime mentora"
                  required
                />
                {showMentorSuggestions && mentorSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {mentorSuggestions
                      .filter((m) => normalizeName(m.toLowerCase()).includes(normalizeName(mentor.toLowerCase())))
                      .map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setMentor(suggestion);
                            setShowMentorSuggestions(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                        >
                          {suggestion}
                        </div>
                      ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Počnite kucati da vidite postojeće mentore ili unesite novog
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Članovi komisije (opciono)
                </label>
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                        placeholder="Počni kucati ime člana komisije..."
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
            </div>
          </div>

          {/* Tema, ključne riječi i sažetak */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-[#294a70] mb-4">Dodatne informacije</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ključne riječi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                  placeholder="Odvojene zarezom (npr. AI, Machine Learning, Python)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sažetak (Abstract)
                </label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] min-h-[120px]"
                  placeholder="Unesite sažetak rada"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Termin odbrane rada (opciono)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={defenseDate}
                      onChange={(e) => setDefenseDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={defenseTime}
                      onChange={(e) => setDefenseTime(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70]"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Unesite datum i vrijeme prezentacije/odbrane rada
                </p>
              </div>
            </div>
          </div>

          {/* Dugmad */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3a5a] transition-colors font-semibold"
            >
              {isSubmitting ? "Dodavanje..." : "Dodaj rad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
