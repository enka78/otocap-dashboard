import React, { useState, useEffect } from 'react';
import { usersService } from '../services/usersService';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await usersService.getUsers();
    setUsers(data || []);
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <PageHeader 
          title="Üyeler"
        />

        {/* Search */}
        <div style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Üye ara (ad, email, telefon...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Users Table */}
        <div className="orders-table">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Üyeler yükleniyor...</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ad</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      Üye bulunamadı
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>
                          {user.name || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#3b82f6' }}>
                          {user.email || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#1f2937' }}>
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#6b7280' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;