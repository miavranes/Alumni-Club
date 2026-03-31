import React, { useState, useEffect } from 'react';
import AdminService from '../../services/adminService';
import { generateUsername } from '../utils/UsernameGenerator';
import Papa from 'papaparse';

// Extended User interface for the component (different from AdminService User)
interface ExtendedUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  role: string;
  enrollment_year: number;
  occupation: string;
  is_active: boolean;
  created_at: string;
  _count: {
    posts: number;
    comments: number;
    event_registration: number;
  };
}

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  enrollment_year: number;
  role: string;
  occupation: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    is_active: ''
  });
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserData, setCreateUserData] = useState<CreateUserData>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    enrollment_year: new Date().getFullYear(),
    role: 'user',
    occupation: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [filters, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const backendFilters = {
        role: filters.role || undefined,
        search: filters.search || undefined,
        is_active: filters.is_active === '' ? undefined : filters.is_active === 'true'
      };
      
      console.log("Šaljem filtere na backend:", backendFilters);
      console.log("Stranica:", pagination.page, "Limit:", pagination.limit);
      
      const data = await AdminService.getUsers(backendFilters, pagination.page, pagination.limit);
      console.log("Podaci sa backend-a:", data);
      console.log("Broj korisnika:", data.users?.length);
      
      setUsers((data.users as unknown as ExtendedUser[]) || []);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (error) {
      console.error('Greška prilikom učitavanja korisnika:', error);
      alert('Neuspješno učitavanje korisnika. Provjerite konzolu.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId: number) => {
    if (window.confirm('Sigurno želite deaktivirati profil korisnika?')) {
      try {
        await AdminService.deactivateUser(userId);
        loadUsers();
        alert('Uspješno deaktiviran korisnik');
      } catch (error: any) {
        console.error('Neuspješno deaktiviranje:', error);
        alert(`Neuspješno deaktiviranje korisnika: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      await AdminService.activateUser(userId);
      loadUsers();
      alert('Korisnik uspješno aktiviran');
    } catch (error: any) {
      console.error('Greška prilikom aktiviranja korisnika:', error);
      alert(`Neuspješno aktiviranje korisnika: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Da li ste sigurni da želite obrisati korisnika? Ovaj postupak se ne može povratiti.')) {
      try {
        await AdminService.deleteUser(userId);
        loadUsers();
        alert('Korisnik uspješno obrisan');
      } catch (error: any) {
        console.error('Greška prilikom brisanja korisnika:', error);
        alert(`Neuspješno brisanje korisnika: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      await AdminService.createUser(createUserData);
      setShowCreateModal(false);
      setCreateUserData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        enrollment_year: new Date().getFullYear(),
        role: 'user',
        occupation: ''
      });
      loadUsers();
      alert('Korisnik uspješno kreiran');
    } catch (error: any) {
      console.error('Greška prilikom kreiranja korisnika:', error);
      alert(`Neuspješno kreiranje korisnika: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBulkImport = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setBulkImportLoading(true);

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
      alert("CSV ne sadrži validne podatke.");
      return;
    }

    const existingUsernames = users.map(u => u.username);
    const usersToCreate: any[] = [];

    for (const row: any of parsed.data) {
      const firstName = row.Ime || row.ime || "";
      const lastName = row.Prezime || row.prezime || "";
      const email = row.Email || row.email || "";

      if (!firstName || !lastName || !email) continue;

      const username = generateUsername(
        firstName,
        lastName,
        [...existingUsernames, ...usersToCreate.map(u => u.username)]
      );

      if (!isValidEmail(email)) {
        alert(`Email nije validan: ${email}`);
        return;
      }

      usersToCreate.push({
        first_name: firstName,
        last_name: lastName,
        email: email,
        username,
        password: "alumni123",
        enrollment_year: new Date().getFullYear(),
        role: "user",
        occupation: ""
      });
    }

    if (usersToCreate.length === 0) {
      alert("Nema validnih korisnika za import.");
      return;
    }

    let success = 0;
    let fail = 0;

    for (const userData of usersToCreate) {
      try {
        await AdminService.createUser(userData);
        success++;
      } catch {
        fail++;
      }
    }

    setShowBulkImportModal(false);
    setCsvData("");
    loadUsers();

    alert(`Import završen.\nUspješno: ${success}\nGreške: ${fail}`);

  } catch (error: any) {
    console.error(error);
    alert("Greška tokom importa.");
  } finally {
    setBulkImportLoading(false);
  }
};

  const handleFirstNameChange = (firstName: string) => {
    const updatedData = { ...createUserData, first_name: firstName };
    
    if (firstName && createUserData.last_name) {
      const existingUsernames = users.map(user => user.username);
      updatedData.username = generateUsername(firstName, createUserData.last_name, existingUsernames);
    }
    
    setCreateUserData(updatedData);
  };

  const handleLastNameChange = (lastName: string) => {
    const updatedData = { ...createUserData, last_name: lastName };
    
    if (createUserData.first_name && lastName) {
      const existingUsernames = users.map(user => user.username);
      updatedData.username = generateUsername(createUserData.first_name, lastName, existingUsernames);
    }
    
    setCreateUserData(updatedData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header with Create Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#294a70]">Upravljanje korisnicima</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="bg-[#294a70] hover:bg-[#1f3854] text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Masovni import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#ffab1f] hover:bg-[#ff9500] text-white py-2 px-4 rounded-lg transition duration-200"
          >
            Kreiraj korisnika
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pretraga</label>
          <input
            type="text"
            placeholder="Pretražite korisnike..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] text-gray-700"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Uloga</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] text-gray-700"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">Sve uloge</option>
            <option value="admin">Administrator</option>
            <option value="user">Korisnik</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#294a70] text-gray-700"
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}
          >
            <option value="">Svi statusi</option>
            <option value="true">Aktivan</option>
            <option value="false">Neaktivan</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilters({ role: '', search: '', is_active: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-200"
          >
            Obriši filtere
          </button>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Učitavanje korisnika...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Korisnik</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Uloga</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diplomiranje</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Aktivnost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Akcije</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nema korisnika koji odgovaraju kriterijumima
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-sm text-gray-400">@{user.username}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrator' : 'Korisnik'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.enrollment_year}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Aktivan' : 'Neaktivan'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div>Objave: {user._count.posts}</div>
                        <div>Eventi: {user._count.event_registration}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          {user.is_active ? (
                            <button
                              onClick={() => handleDeactivate(user.id)}
                              className="px-3 py-1 bg-[#ffab1f] text-white rounded-lg text-sm hover:bg-[#ff9500] transition"
                            >
                              Deaktiviraj
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivate(user.id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                            >
                              Aktiviraj
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
           {pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition text-gray-700"
              >
                Prethodna
              </button>
              <span className="text-gray-600">
                Stranica {pagination.page} od {pagination.pages} (Ukupno: {pagination.total})
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition text-gray-700"
              >
                Sljedeća
              </button>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Kreiraj novog korisnika</h3>
            <form onSubmit={handleCreateUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ime *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.first_name}
                    onChange={(e) => handleFirstNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prezime *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.last_name}
                    onChange={(e) => handleLastNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.email}
                    onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Korisničko ime *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-gray-50"
                    value={createUserData.username}
                    onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })}
                    placeholder="Automatski generisano iz imena"
                  />
                  <p className="text-xs text-gray-500 mt-1">Automatski generisano, ali možete izmijeniti ako je potrebno</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lozinka *</label>
                  <input
                    type="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.password}
                    onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                    placeholder="Postavite početnu lozinku"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Godina diplomiranja</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.enrollment_year}
                    onChange={(e) => setCreateUserData({ ...createUserData, enrollment_year: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uloga</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.role}
                    onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}
                  >
                    <option value="user">Korisnik</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zanimanje</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    value={createUserData.occupation}
                    onChange={(e) => setCreateUserData({ ...createUserData, occupation: e.target.value })}
                    placeholder="Opciono - korisnik može postaviti kasnije"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3854] transition disabled:opacity-50"
                >
                  {createLoading ? 'Kreiranje...' : 'Kreiraj korisnika'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Masovni import korisnika</h3>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Uputstva:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Eksportujte Google Forms odgovore kao CSV</li>
                <li>Osigurajte da CSV ima kolone za: <strong>Ime, Prezime, Email</strong></li>
                <li>Korisnička imena će biti automatski generisana kao ime.prezime</li>
                <li>Svi korisnici će biti kreirani sa podrazumjevanom lozinkom "alumni123"</li>
              </ol>
              <div className="mt-3 text-sm">
                <strong className="text-gray-800">Primjer CSV formata:</strong>
                <pre className="bg-gray-100 p-2 rounded mt-1 text-xs text-gray-800 border">
                  Timestamp,Ime,Prezime,Email{'\n'}
                  2025/11/26 5:46:06 PM GMT+1,Marko,Marković,marko.markovic@primjer.com{'\n'}
                  2025/11/26 5:46:06 PM GMT+1,Ana,Anić,ana.anic@primjer.com
                </pre>
              </div>
            </div>

            <form onSubmit={handleBulkImport}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zalijepite CSV podatke:
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm text-gray-700 bg-white"
                  placeholder="Zalijepite vaše CSV podatke ovdje..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkImportModal(false);
                    setCsvData('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={bulkImportLoading || !csvData.trim()}
                  className="px-4 py-2 bg-[#294a70] text-white rounded-lg hover:bg-[#1f3854] transition disabled:opacity-50"
                >
                  {bulkImportLoading ? 'Importovanje...' : 'Importuj korisnike'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}