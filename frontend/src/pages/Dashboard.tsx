import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminService from "../services/adminService";
import StatsCards from "../components/admin/StatsCards";
import UserManagement from "../components/admin/UserManagement";
import ContentManagement from "../components/admin/ContentManagement";
import AdminInquiries from "../components/admin/AdminInquiries";
import { Camera } from "lucide-react";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalEvents: number;
  totalComments: number;
  recentRegistrations: number;
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "content" | "inquiries"
  >("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
<<<<<<< HEAD
=======

  const API_BASE_URL = import.meta.env.VITE_API_URL;
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    } else if (user?.profile_picture) {
<<<<<<< HEAD
      setProfilePicture(`http://localhost:4000${user.profile_picture}?t=${Date.now()}`);
=======
      setProfilePicture(`${API_BASE_URL}${user.profile_picture}?t=${Date.now()}`);
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
    }
  }, [user, loading, navigate, API_BASE_URL]);

  useEffect(() => {
    if (user && user.role === "admin" && activeTab === "overview") {
      loadStats();
    }
  }, [user, activeTab]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await AdminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error("Greška pri učitavanju statistika:", error);
      alert("Greška pri učitavanju statistika dashboard-a");
    } finally {
      setStatsLoading(false);
    }
  };

<<<<<<< HEAD
  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
=======
  const handleProfilePictureUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
<<<<<<< HEAD
    if (!file.type.startsWith('image/')) {
      alert('Molimo odaberite sliku (JPG, PNG, GIF)');
=======
    if (!file.type.startsWith("image/")) {
      alert("Molimo odaberite sliku (JPG, PNG, GIF)");
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
<<<<<<< HEAD
      alert('Slika je prevelika. Maksimalna veličina je 5MB.');
=======
      alert("Slika je prevelika. Maksimalna veličina je 5MB.");
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
      return;
    }

    try {
      setUploadingPicture(true);
<<<<<<< HEAD
      
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('http://localhost:4000/api/users/me/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
=======

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
        },
        body: formData,
      });

      if (!response.ok) {
<<<<<<< HEAD
        throw new Error('Greška pri upload-u slike');
      }

      const data = await response.json();
      
      // Update profile picture with cache busting
      if (data.profile_picture) {
        const newPictureUrl = `http://localhost:4000${data.profile_picture}?t=${Date.now()}`;
        setProfilePicture(newPictureUrl);
        
=======
        throw new Error("Greška pri upload-u slike");
      }

      const data = await response.json();

      // Update profile picture with cache busting
      if (data.profile_picture) {
        const newPictureUrl = `${API_BASE_URL}${data.profile_picture}?t=${Date.now()}`;
        setProfilePicture(newPictureUrl);

>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
        // Force re-render by updating user context if possible
        window.location.reload(); // Simple solution to refresh user data
      }

<<<<<<< HEAD
      alert('Profilna slika je uspješno ažurirana!');
    } catch (error) {
      console.error('Greška pri upload-u:', error);
      alert('Greška pri upload-u profilne slike');
=======
      alert("Profilna slika je uspješno ažurirana!");
    } catch (error) {
      console.error("Greška pri upload-u:", error);
      alert("Greška pri upload-u profilne slike");
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
    } finally {
      setUploadingPicture(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#294a70] mx-auto"></div>
          <p className="mt-4 text-gray-600">Provjeravam autentifikaciju...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#294a70] mb-4">
            {isAdmin ? "Admin panel" : "Korisnički Dashboard"}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
            {isAdmin
              ? "Dobrodošli u vaš administratorski panel"
              : "Dobrodošli u vaš lični dashboard"}
          </p>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div className="bg-gray-50 rounded-xl shadow-lg p-4 mb-8 border border-gray-200">
            <nav className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === "overview"
                    ? "bg-[#294a70] text-white"
                    : "bg-white text-[#294a70] hover:bg-blue-50 border border-[#294a70]"
                }`}
              >
                Pregled
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === "users"
                    ? "bg-[#294a70] text-white"
                    : "bg-white text-[#294a70] hover:bg-blue-50 border border-[#294a70]"
                }`}
              >
                Upravljanje korisnicima
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === "content"
                    ? "bg-[#294a70] text-white"
                    : "bg-white text-[#294a70] hover:bg-blue-50 border border-[#294a70]"
                }`}
              >
                Upravljanje sadržajem
              </button>
              <button
                onClick={() => setActiveTab("inquiries")}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  activeTab === "inquiries"
                    ? "bg-[#294a70] text-white"
                    : "bg-white text-[#294a70] hover:bg-blue-50 border border-[#294a70]"
                }`}
              >
                Upiti
              </button>
            </nav>
          </div>
        )}

        {/* Admin Content */}
        {isAdmin && (
          <div className="mb-8">
            {activeTab === "overview" && (
              <div>
                {statsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#294a70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Učitavanje statistika...</p>
                  </div>
                ) : stats ? (
                  <StatsCards stats={stats} />
                ) : null}
              </div>
            )}

            {activeTab === "users" && <UserManagement />}
            {activeTab === "content" && <ContentManagement />}
            {activeTab === "inquiries" && <AdminInquiries />}
          </div>
        )}

        {/* User Profile */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold text-[#294a70] mb-4 border-b border-gray-200 pb-2">
            Vaš profil
          </h2>
<<<<<<< HEAD
          
=======

>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0 relative group">
              <img
<<<<<<< HEAD
                src={profilePicture || user.profile_picture 
                  ? `http://localhost:4000${user.profile_picture}?t=${Date.now()}`
                  : "https://via.placeholder.com/100x100?text=Admin"
=======
                src={
                  profilePicture || user.profile_picture
                    ? `${API_BASE_URL}${user.profile_picture}?t=${Date.now()}`
                    : "https://via.placeholder.com/100x100?text=Admin"
>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
                }
                alt="Profilna slika"
                className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-md"
              />
<<<<<<< HEAD
              
=======

>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingPicture}
                  />
                </label>
              </div>
<<<<<<< HEAD
              
=======

>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
              {uploadingPicture && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
<<<<<<< HEAD
            
=======

>>>>>>> 7085e605405945ce4b0bd5fab9c54c1107a7cf8f
            {/* Profile Info */}
            <div className="flex-1 space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Korisničko ime:</span>
                <span>{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Puno ime:</span>
                <span>
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Uloga:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === "admin"
                      ? "bg-[#ffab1f] text-white"
                      : "bg-[#294a70] text-white"
                  }`}
                >
                  {user.role === "admin" ? "Administrator" : "Korisnik"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition duration-200"
        >
          Odjavi se
        </button>
      </div>
    </div>
  );
}
