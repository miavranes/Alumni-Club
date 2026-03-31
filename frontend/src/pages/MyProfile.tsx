import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import {
  Save,
  Eye,
  EyeOff,
  X,
  Mail,
  Briefcase,
  User,
  FileText,
  Edit,
  MapPin,
  BookOpen,
  Settings,
  Shield,
  Image,
} from "lucide-react";

type ProfileData = {
  ime: string;
  prezime: string;
  email: string;
  pozicija: string;
  nivoStudija: string;
  smjer: string;
  godinaZavrsetka: string;
  mjestoRada: string;
  firma: string;
  javniProfil: boolean;
};

export default function MyProfile() {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const [profileData, setProfileData] = useState<ProfileData>({
    ime: "",
    prezime: "",
    email: "",
    pozicija: "",
    nivoStudija: "",
    smjer: "",
    godinaZavrsetka: "",
    mjestoRada: "",
    firma: "",
    javniProfil: true,
  });

  const [profilnaSlika, setProfilnaSlika] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<
    ProfileData & {
      profilnaSlikaFile: File | null;
      cvFile: File | null;
      cvFileName: string;
    }
  >({
    ime: "",
    prezime: "",
    email: "",
    pozicija: "",
    nivoStudija: "",
    smjer: "",
    godinaZavrsetka: "",
    mjestoRada: "",
    firma: "",
    javniProfil: true,
    profilnaSlikaFile: null,
    cvFile: null,
    cvFileName: "",
  });

  const smjerOpcije = {
    "Osnovne studije": [
      "Softversko inženjerstvo",
      "Informaciono-komunikacione tehnologije",
    ],
    "Master studije": [
      "Informaciono-komunikacione tehnologije",
      "Softverski inženjering",
      "Informatika u obrazovanju",
    ],
    "Specijalističke studije": ["Informacione tehnologije"],
  };

  // --------------------------------------------------------
  // LOAD USER FROM BACKEND
  // --------------------------------------------------------
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const resp = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) return;

        const data = await resp.json();
        console.log("Podaci učitani sa backend-a:", data);
        console.log("enrollment_year iz backend-a:", data.enrollment_year);

        const profileInfo = {
          ime: data.first_name || "",
          prezime: data.last_name || "",
          email: data.email || "",
          pozicija: data.position || "",
          nivoStudija: data.study_level || "",
          smjer: data.study_direction || "",
          godinaZavrsetka: String(data.enrollment_year || ""),
          mjestoRada: data.work_location || "",
          firma: data.occupation || "",
          javniProfil: data.is_public ?? true,
        };

        console.log("Mapiran profileInfo:", profileInfo);
        console.log(
          "godinaZavrsetka nakon mapiranja:",
          profileInfo.godinaZavrsetka
        );

        setProfileData(profileInfo);
        setEditFormData({
          ...profileInfo,
          profilnaSlikaFile: null,
          cvFile: null,
          cvFileName: "",
        });

        if (data.profile_picture) {
          setProfilnaSlika(
            `${API_BASE_URL}${data.profile_picture}?t=${Date.now()}`
          );
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProfile();
  }, [API_BASE_URL]);

  const openEditModal = () => {
    console.log("Otvaranje edit modal-a");
    console.log("Trenutni profileData:", profileData);
    console.log("Trenutna godinaZavrsetka:", profileData.godinaZavrsetka);

    setEditFormData({
      ...profileData,
      profilnaSlikaFile: null,
      cvFile: null,
      cvFileName: "",
    });

    console.log("EditFormData nakon postavljanja:", {
      ...profileData,
      profilnaSlikaFile: null,
      cvFile: null,
      cvFileName: "",
    });

    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Edit form handlers
  const handleEditChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    console.log(`Mijenjam polje ${name} na vrijednost: ${value}`);

    if (name === "nivoStudija") {
      setEditFormData((prev) => ({ ...prev, nivoStudija: value, smjer: "" }));
      console.log("Resetovan smjer zbog promjene nivoa studija");
      return;
    }

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "godinaZavrsetka") {
      console.log("Nova godina diplomiranja postavljena:", value);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditFormData((prev) => ({ ...prev, profilnaSlikaFile: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilnaSlika(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditFormData((prev) => ({
      ...prev,
      cvFile: file,
      cvFileName: file.name,
    }));
  };

  // --------------------------------------------------------
  // SUBMIT UPDATE TO BACKEND
  // --------------------------------------------------------
  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Email validacija na frontend strani
      if (editFormData.email && editFormData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(editFormData.email.trim())) {
          alert("Molimo unesite valjan email format");
          return;
        }
      }

      const payload = {
        ime: editFormData.ime,
        prezime: editFormData.prezime,
        email: editFormData.email,
        pozicija: editFormData.pozicija,
        nivoStudija: editFormData.nivoStudija,
        smjer: editFormData.smjer,
        godinaZavrsetka: editFormData.godinaZavrsetka,
        mjestoRada: editFormData.mjestoRada,
        firma: editFormData.firma,
        javniProfil: editFormData.javniProfil,
      };

      console.log("Šaljem podatke na backend:", payload);
      console.log(
        "Godina diplomiranja koja se šalje:",
        editFormData.godinaZavrsetka
      );

      // Update main profile info
      const response = await fetch(`${API_BASE_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend greška:", errorData);

        // Prikaži specifičnu grešku korisniku
        if (errorData.message) {
          alert(`Greška: ${errorData.message}`);
        } else {
          alert("Došlo je do greške prilikom ažuriranja profila");
        }
        return;
      }

      const updatedData = await response.json();
      console.log("Backend odgovor:", updatedData);
      console.log("Ažuriran enrollment_year:", updatedData.enrollment_year);

      // Upload avatar
      if (editFormData.profilnaSlikaFile) {
        const formData = new FormData();
        formData.append("avatar", editFormData.profilnaSlikaFile);

        const avatarResponse = await fetch(
          `${API_BASE_URL}/api/users/me/avatar`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          // Ažuriraj sliku u state-u sa cache-busting parametrom
          if (avatarData.profile_picture) {
            setProfilnaSlika(
              `${API_BASE_URL}${avatarData.profile_picture}?t=${Date.now()}`
            );
          }
        }
      }

      // Upload CV
      if (editFormData.cvFile) {
        const cvData = new FormData();
        cvData.append("cv", editFormData.cvFile);

        await fetch(`${API_BASE_URL}/api/users/me/cv`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: cvData,
        });
      }

      // Update local state
      const updatedProfileData = {
        ime: editFormData.ime,
        prezime: editFormData.prezime,
        email: editFormData.email, // stays the same (read-only in UI)
        pozicija: editFormData.pozicija,
        nivoStudija: editFormData.nivoStudija,
        smjer: editFormData.smjer,
        godinaZavrsetka: editFormData.godinaZavrsetka,
        mjestoRada: editFormData.mjestoRada,
        firma: editFormData.firma,
        javniProfil: editFormData.javniProfil,
      };

      console.log("Ažuriram local state sa:", updatedProfileData);
      console.log(
        "Nova godina diplomiranja u local state:",
        updatedProfileData.godinaZavrsetka
      );

      setProfileData(updatedProfileData);

      closeEditModal();
    } catch (err) {
      console.error(err);
    }
  };

  const currentYear = new Date().getFullYear();
  const startYear = 2009; // Najranija godina diplomiranja
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => currentYear - i
  );

  // Sidebar menu items
  const menuItems = [
    {
      icon: <Edit className="w-5 h-5" />,
      label: "Izmijeni profil",
      action: openEditModal,
      color: "text-[#294a70] hover:text-[#1f3854]",
      bg: "hover:bg-blue-50",
    },
    {
      icon: <Image className="w-5 h-5" />,
      label: "Promijeni sliku",
      action: () => document.getElementById("avatar-upload")?.click(),
      color: "text-[#294a70] hover:text-[#1f3854]",
      bg: "hover:bg-blue-50",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Privatnost",
      action: () => {
        setProfileData((prev) => ({ ...prev, javniProfil: !prev.javniProfil }));
        // TODO: Save to backend immediately
      },
      color: "text-[#294a70] hover:text-[#1f3854]",
      bg: "hover:bg-blue-50",
    },
  ];

  return (
    <>
      <div className="w-full min-h-screen bg-gray-50 flex">
        {/* Sidebar Menu */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="pt-12 pb-6 px-6 border-b border-gray-200 bg-gradient-to-r from-[#294a70] to-[#324D6B]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Upravljanje profilom
            </h2>
            <p className="text-blue-100 text-sm mt-1">Uredite svoj profil</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${item.color} ${item.bg} border border-transparent hover:border-gray-200 hover:shadow-sm`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Privacy Status Card */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Status profila
                </span>
                {profileData.javniProfil ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <p className="text-xs text-gray-600">
                {profileData.javniProfil ? "Profil je javan" : "Profil je privatan"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#294a70] to-[#324D6B] px-8 py-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20 border-4 border-white/30 shadow-xl">
                      {profilnaSlika ? (
                        <img
                          src={profilnaSlika}
                          alt="Profil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/10">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    {/* Hidden file input for avatar upload */}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="text-white">
                    <h1 className="text-3xl font-bold">
                      {profileData.ime} {profileData.prezime}
                    </h1>
                    {profileData.pozicija && (
                      <p className="text-blue-100 text-lg mt-1">
                        {profileData.pozicija}
                      </p>
                    )}
                    <p className="text-blue-200 text-sm mt-2">
                      Alumni Club Mediteran
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProfileItem icon={<Mail />} label="Email" value={profileData.email} />
                  <ProfileItem
                    icon={<BookOpen />}
                    label="Nivo studija"
                    value={profileData.nivoStudija}
                  />
                  <ProfileItem
                    icon={<BookOpen />}
                    label="Smjer"
                    value={profileData.smjer}
                  />
                  <ProfileItem
                    icon={<BookOpen />}
                    label="Godina diplomiranja"
                    value={profileData.godinaZavrsetka}
                  />
                  <ProfileItem
                    icon={<MapPin />}
                    label="Mjesto rada"
                    value={profileData.mjestoRada}
                  />
                  <ProfileItem
                    icon={<Briefcase />}
                    label="Firma"
                    value={profileData.firma}
                  />
                </div>

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Dodatne informacije
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Privatnost
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {profileData.javniProfil ? "Javan profil" : "Privatan profil"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          CV
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {editFormData.cvFileName || "Nije otpremljen"}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Status
                        </span>
                      </div>
                      <p className="text-sm text-green-600 font-medium">Aktivan</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Same as before */}
      {isEditModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeEditModal}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#294a70] to-[#324D6B]">
                <h3 className="text-2xl font-bold text-white">Izmijeni profil</h3>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="p-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-white ring-4 ring-[#ffab1f]/30">
                        {profilnaSlika ? (
                          <img
                            src={profilnaSlika}
                            className="w-full h-full object-cover"
                            alt="Profile"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#294a70] to-[#324D6B]">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    <label className="mt-4 px-6 py-2 bg-gradient-to-br from-[#ffab1f] to-[#ff9500] text-white font-semibold rounded-full cursor-pointer hover:shadow-lg transition-all">
                      Promijeni sliku
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        icon={<User />}
                        label="Ime"
                        name="ime"
                        value={editFormData.ime}
                        onChange={handleEditChange}
                      />
                      <FormField
                        icon={<User />}
                        label="Prezime"
                        name="prezime"
                        value={editFormData.prezime}
                        onChange={handleEditChange}
                      />
                    </div>

                    <EmailField
                      icon={<Mail />}
                      label="Email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                    />
                    <FormField
                      icon={<Briefcase />}
                      label="Pozicija"
                      name="pozicija"
                      value={editFormData.pozicija}
                      onChange={handleEditChange}
                    />

                    {/* EMAIL: READ-ONLY */}
                    <FormField
                      icon={<Mail />}
                      label="Email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      readOnly
                    />

                    <FormField
                      icon={<Briefcase />}
                      label="Pozicija"
                      name="pozicija"
                      value={editFormData.pozicija}
                      onChange={handleEditChange}
                    />

                    <FormSelect
                      icon={<BookOpen />}
                      label="Nivo studija"
                      name="nivoStudija"
                      value={editFormData.nivoStudija}
                      onChange={handleEditChange}
                      options={Object.keys(smjerOpcije)}
                    />

                    {editFormData.nivoStudija && (
                      <FormSelect
                        icon={<BookOpen />}
                        label="Smjer"
                        name="smjer"
                        value={editFormData.smjer}
                        onChange={handleEditChange}
                        options={
                          smjerOpcije[
                            editFormData.nivoStudija as keyof typeof smjerOpcije
                          ] || []
                        }
                      />
                    )}

                    <FormSelect
                      icon={<BookOpen />}
                      label="Godina diplomiranja"
                      name="godinaZavrsetka"
                      value={editFormData.godinaZavrsetka}
                      onChange={handleEditChange}
                      options={years.map((year) => String(year))}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        icon={<MapPin />}
                        label="Mjesto rada"
                        name="mjestoRada"
                        value={editFormData.mjestoRada}
                        onChange={handleEditChange}
                      />
                      <FormField
                        icon={<Briefcase />}
                        label="Firma"
                        name="firma"
                        value={editFormData.firma}
                        onChange={handleEditChange}
                      />
                    </div>

                    {/* CV Upload */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div className="text-[#ffab1f]">
                        <FileText />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600 font-medium block mb-2">
                          CV
                        </label>
                        {editFormData.cvFileName ? (
                          <p className="text-sm text-gray-800">
                            {editFormData.cvFileName}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Nijedan fajl nije odabran
                          </p>
                        )}
                      </div>
                      <label className="px-4 py-2 text-white font-semibold text-sm bg-gradient-to-br from-[#294a70] to-[#324D6B] rounded-lg cursor-pointer hover:shadow-lg transition-all">
                        Dodaj CV
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCvUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <label className="text-sm text-gray-600 font-medium block mb-3">
                        Vidljivost profila
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              javniProfil: false,
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                            !editFormData.javniProfil
                              ? "bg-[#ffab1f] text-white"
                              : "bg-white text-gray-600 border border-gray-300"
                          }`}
                        >
                          Privatan
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFormData((prev) => ({
                              ...prev,
                              javniProfil: true,
                            }))
                          }
                          className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                            editFormData.javniProfil
                              ? "bg-[#ffab1f] text-white"
                              : "bg-white text-gray-600 border border-gray-300"
                          }`}
                        >
                          Javan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 p-6 border-t border-gray-200 bg-gray-50 z-10">
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveChanges}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-semibold
                               bg-gradient-to-br from-[#294a70] to-[#324D6B]
                               hover:from-[#ffab1f] hover:to-[#ff9500]
                               transform transition hover:-translate-y-1
                               shadow-md hover:shadow-xl"
                  >
                    <Save className="w-5 h-5" />
                    Sačuvaj izmjene
                  </button>
                  <button
                    onClick={closeEditModal}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-gray-700 font-semibold
                               bg-white border border-gray-300
                               hover:bg-gray-50 transition-all"
                  >
                    <X className="w-5 h-5" />
                    Otkaži
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Helper Components
function ProfileItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-[#ffab1f]">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-base font-semibold text-[#294a70]">{value || "—"}</p>
      </div>
    </div>
  );
}

function FormField({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  readOnly = false,
  disabled = false,
}: any) {
  return (
    <div
      className={`flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 ${
        disabled ? "opacity-70" : ""
      }`}
    >
      <div className="text-[#ffab1f]">{icon}</div>
      <div className="flex-1">
        <label className="text-sm text-gray-600 font-medium block mb-2">
          {label}
        </label>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          className={`w-full text-base font-semibold bg-transparent border-none focus:outline-none ${
            readOnly || disabled
              ? "cursor-not-allowed text-gray-500"
              : "text-[#294a70]"
          }`}
        />
        {readOnly && name === "email" && (
          <p className="text-xs text-gray-500 mt-1">Email nije moguće mijenjati.</p>
        )}
      </div>
    </div>
  );
}

function EmailField({ icon, label, name, value, onChange }: any) {
  const [isValid, setIsValid] = useState(true);
  const [showValidation, setShowValidation] = useState(false);

  const validateEmail = (email: string) => {
    if (!email.trim()) return true; // Prazan email je OK
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(e);

    setShowValidation(newValue.length > 0);
    setIsValid(validateEmail(newValue));
  };

  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="text-[#ffab1f]">{icon}</div>
      <div className="flex-1">
        <label className="text-sm text-gray-600 font-medium block mb-2">
          {label}
        </label>
        <input
          type="email"
          name={name}
          value={value}
          onChange={handleEmailChange}
          className={`w-full text-base font-semibold bg-transparent border-none focus:outline-none ${
            showValidation && !isValid ? "text-red-600" : "text-[#294a70]"
          }`}
          placeholder="ime@example.com"
        />
        {showValidation && !isValid && (
          <p className="text-xs text-red-500 mt-1">
            Molimo unesite valjan email format
          </p>
        )}
      </div>
    </div>
  );
}

function FormSelect({ icon, label, name, value, onChange, options }: any) {
  return (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <div className="text-[#ffab1f]">{icon}</div>
      <div className="flex-1">
        <label className="text-sm text-gray-600 font-medium block mb-2">
          {label}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="w-full text-base font-semibold text-[#294a70] bg-transparent border-none focus:outline-none"
        >
          <option value="" disabled>
            Izaberite...
          </option>
          {options.map((op: string) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
