import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ordersService } from '../services/ordersService';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await ordersService.getOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleGenerateReport = () => {
    // Generate and print report
    const reportWindow = window.open('', '_blank');
    const reportDate = new Date().toLocaleDateString('tr-TR');
    const reportTime = new Date().toLocaleTimeString('tr-TR');
    
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Otocap Dashboard Raporu</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 18px;
            color: #666;
          }
          .report-info {
            text-align: right;
            margin-bottom: 30px;
            font-size: 12px;
            color: #666;
          }
          .stats-section {
            margin-bottom: 30px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .stat-box {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .stat-title {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #333;
          }
          .orders-section {
            margin-top: 30px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .orders-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .orders-table th,
          .orders-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-size: 11px;
          }
          .orders-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">OTOCAP</div>
          <div class="report-title">Dashboard Performans Raporu</div>
        </div>
        
        <div class="report-info">
          <div>Rapor Tarihi: ${reportDate}</div>
          <div>Rapor Saati: ${reportTime}</div>
        </div>
        
        <div class="stats-section">
          <div class="section-title">Genel İstatistikler</div>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-title">Toplam Siparişler</div>
              <div class="stat-value">${totalOrders.toLocaleString('tr-TR')}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">Bugünkü Siparişler</div>
              <div class="stat-value">${todayOrders.toLocaleString('tr-TR')}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">Toplam Gelir</div>
              <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-title">Aktif Müşteriler</div>
              <div class="stat-value">${activeCustomers.toLocaleString('tr-TR')}</div>
            </div>
          </div>
        </div>
        
        <div class="orders-section">
          <div class="section-title">Son Siparişler (Son 10)</div>
          <table class="orders-table">
            <thead>
              <tr>
                <th>Sipariş ID</th>
                <th>Müşteri</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              ${orders.slice(0, 10).map(order => `
                <tr>
                  <td>#${order.id}</td>
                  <td>${order.user || 'Bilinmiyor'}</td>
                  <td>${formatCurrency(order.total || 0)}</td>
                  <td>${order.status?.display_name || order.status?.name || 'Beklemede'}</td>
                  <td>${new Date(order.created_at).toLocaleDateString('tr-TR')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
          <p>Bu rapor ${reportDate} tarihinde ${reportTime} saatinde otomatik olarak oluşturulmuştur.</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  // Calculate statistics from real data
  const totalOrders = orders.length;
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === today.toDateString();
  }).length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeCustomers = new Set(orders.map(order => order.user).filter(user => user)).size;

  const stats = [
    {
      title: 'Toplam Siparişler',
      value: loading ? '...' : totalOrders.toLocaleString('tr-TR'),
      color: '#3b82f6'
    },
    {
      title: 'Bugünkü Siparişler',
      value: loading ? '...' : todayOrders.toLocaleString('tr-TR'),
      color: '#10b981'
    },
    {
      title: 'Toplam Gelir',
      value: loading ? '...' : formatCurrency(totalRevenue),
      color: '#f59e0b'
    },
    {
      title: 'Aktif Müşteriler',
      value: loading ? '...' : activeCustomers.toLocaleString('tr-TR'),
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-title">
          Otocap Dashboard
        </div>
        <nav>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link active">
                📊 Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/orders" className="nav-link">
                📦 Siparişler
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/categories" className="nav-link">
                📂 Kategoriler
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/brands" className="nav-link">
                🏷️ Markalar
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">
                🛍️ Ürünler
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/blogs" className="nav-link">
                📝 Bloglar
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/banners" className="nav-link">
                🎯 Bannerlar
              </Link>
            </li>
            <li className="nav-item">
              <button 
                onClick={handleLogout}
                className="nav-link"
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  width: '100%', 
                  textAlign: 'left',
                  color: '#d1d5db'
                }}
              >
                🚪 Çıkış Yap
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-title">{stat.title}</div>
              <div 
                className="stat-value" 
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
            Hızlı İşlemler
          </h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/orders" className="btn-success">
              📦 Siparişleri Görüntüle
            </Link>
            <button 
              onClick={handleGenerateReport}
              className="btn-success"
              disabled={loading}
            >
              📊 Rapor Oluştur
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1f2937' }}>
            Son Aktiviteler
          </h2>
          <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Yükleniyor...
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Henüz sipariş bulunmuyor
              </div>
            ) : (
              orders.slice(0, 5).map((order, index) => {
                const timeAgo = new Date() - new Date(order.created_at);
                const minutesAgo = Math.floor(timeAgo / (1000 * 60));
                const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
                const daysAgo = Math.floor(timeAgo / (1000 * 60 * 60 * 24));
                
                let timeText;
                if (minutesAgo < 60) {
                  timeText = `${minutesAgo} dakika önce`;
                } else if (hoursAgo < 24) {
                  timeText = `${hoursAgo} saat önce`;
                } else {
                  timeText = `${daysAgo} gün önce`;
                }
                
                return (
                  <div 
                    key={order.id} 
                    style={{ 
                      marginBottom: index < 4 ? '1rem' : '0', 
                      paddingBottom: index < 4 ? '1rem' : '0', 
                      borderBottom: index < 4 ? '1px solid #f3f4f6' : 'none' 
                    }}
                  >
                    <div style={{ fontWeight: '500', color: '#1f2937' }}>
                      Sipariş #{order.id} - {order.user || 'Bilinmeyen müşteri'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {formatCurrency(order.total || 0)} - {timeText}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;