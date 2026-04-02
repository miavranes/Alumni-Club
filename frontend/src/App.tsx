import React from "react";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import AlumniDirectory from "./pages/AlumniDirectory";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Theses from "./pages/Theses";
import Messages from "./components/messages/Messages";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import PublicRoute from "./components/common/PublicRoute";
import PublicProfile from "./pages/PublicProfile";
import AdminRoute from "./components/common/AdminRoute";
import MyProfile from "./pages/MyProfile";
import ResetPassword from "./pages/ResetPassword";
import EventList from "./pages/EventList";
import EventForm from "./pages/EventForm";
import PublicEventList from "./pages/PublicEventList";
import PublicEventDetails from "./pages/PublicEventDetails";
import AdminEventDetails from "./pages/AdminEventDetails";
import Enroll from "./pages/Enroll";

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="bg-[#294a70] min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 w-full pt-16 pb-32">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/AlumniDirectory" element={<AlumniDirectory />} />
            <Route path="/Blog" element={<Blog />} />

            {/* Public login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Public reset password */}
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Theses" element={<Theses />} />
            <Route path="/MyProfile" element={<MyProfile />} />

            {/* MESSAGES */}
            <Route path="/messages" element={<Messages />} />

            {/* PUBLIC PROFILE FOR ALUMNI */}
            <Route path="/alumni/:id" element={<PublicProfile />} />

            {/* ADMIN DASHBOARD */}
            <Route
              path="/Dashboard"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />
            {/* Admin event routes */}
            <Route
              path="/admin/events"
              element={
                <AdminRoute>
                  <EventList />
                </AdminRoute>
              }
            />
            <Route 
              path="/admin/events/:id" 
              element={
              <AdminRoute>
                  <AdminEventDetails />
              </AdminRoute>
                } 
            />
            <Route
              path="/admin/events/new"
              element={
                <AdminRoute>
                  <EventForm />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/events/:id/edit"
              element={
                <AdminRoute>
                  <EventForm />
                </AdminRoute>
              }
            />

            {/* Public event routes */}
            <Route path="/events" element={<PublicEventList />} />
            <Route path="/events/:id" element={<PublicEventDetails />} />
            <Route path="/enroll" element={<Enroll />} />

          </Routes>
        </main>
        <Footer />
      </div>
      </LanguageProvider>
    </AuthProvider>
  );
}
