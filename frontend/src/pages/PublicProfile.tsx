import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const load = async () => {
      try {
        console.log("Loading profile for ID:", id);
        const res = await api.get(`/alumni/${id}`);
        console.log("Profile data received:", res.data);
        console.log("User position:", res.data.user.position);
        console.log("User study_level:", res.data.user.study_level);
        console.log("User study_direction:", res.data.user.study_direction);
        console.log("User cv_url:", res.data.user.cv_url);
        setUser(res.data.user);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return <div className="text-center text-white py-20">Učitavanje...</div>;
  }

  if (!user) {
    return (
      <div className="text-center text-white py-20">
        Profil nije pronađen.
      </div>
    );
  }

  console.log("Rendering profile for user:", user);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Nije navedeno";
    const date = new Date(dateString);
    return date.toLocaleDateString("sr-Latn-ME", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-[#294a70] text-white py-16 text-center">
        <img
          src={
            user.profile_picture
              ? `${API_BASE_URL}${user.profile_picture}?t=${Date.now()}`
              : "https://via.placeholder.com/120"
          }
          className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
        />
        <h1 className="mt-4 text-3xl font-bold">
          {user.first_name} {user.last_name}
        </h1>
        <p className="text-lg opacity-90">
          {user.occupation || "Nije navedeno"}
        </p>
        {user.position && <p className="text-md opacity-80">{user.position}</p>}
      </div>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Osnovne informacije */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#294a70] mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Osnovne informacije
            </h2>
            <div className="space-y-4">
              <PublicInfo icon={<Mail size={16} />} label="Email" value={user.email} />
              <PublicInfo
                icon={<Briefcase size={16} />}
                label="Firma"
                value={user.occupation}
              />
              {user.position && (
                <PublicInfo
                  icon={<Briefcase size={16} />}
                  label="Pozicija"
                  value={user.position}
                />
              )}
              {user.work_location && (
                <PublicInfo
                  icon={<MapPin size={16} />}
                  label="Mjesto rada"
                  value={user.work_location}
                />
              )}
            </div>
          </div>

          {/* Obrazovanje */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#294a70] mb-4 flex items-center">
              <GraduationCap className="mr-2" size={20} />
              Obrazovanje
            </h2>
            <div className="space-y-4">
              <PublicInfo
                icon={<Calendar size={16} />}
                label="Godina diplomiranja"
                value={user.enrollment_year}
              />
              {user.study_level && (
                <PublicInfo
                  icon={<GraduationCap size={16} />}
                  label="Nivo studija"
                  value={user.study_level}
                />
              )}
              {user.study_direction && (
                <PublicInfo
                  icon={<GraduationCap size={16} />}
                  label="Smjer studija"
                  value={user.study_direction}
                />
              )}
            </div>
          </div>

          {/* Dodatne informacije */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-[#294a70] mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Dodatne informacije
            </h2>
            <div className="space-y-4">
              <PublicInfo
                icon={<User size={16} />}
                label="Vidljivost profila"
                value={user.is_public ? "Javan" : "Privatan"}
              />
              {user.cv_url && (
                <div className="flex items-start space-x-3">
                  <FileText
                    size={16}
                    className="text-[#294a70] mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">CV</p>
                    <a
                      href={`${API_BASE_URL}${user.cv_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#294a70] hover:text-[#1f3854] font-medium underline"
                    >
                      Preuzmi CV
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kontakt */}
          {authUser && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#294a70] mb-4 flex items-center">
                <Mail className="mr-2" size={20} />
                Kontakt
              </h2>
              <button
                onClick={() => navigate(`/messages?to=${user.username}`)}
                className="w-full py-3 bg-[#294a70] text-white rounded-lg font-semibold hover:bg-[#1f3854] transition flex items-center justify-center"
              >
                <Mail className="mr-2" size={18} />
                Pošaljite poruku
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PublicInfo({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: any;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start space-x-3">
      {icon && <div className="text-[#294a70] mt-1 flex-shrink-0">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-base font-medium text-gray-900">
          {value || "Nije navedeno"}
        </p>
      </div>
    </div>
  );
}
