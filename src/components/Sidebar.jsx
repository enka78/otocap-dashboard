import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/orders', icon: '📦', label: 'Siparişler' },
    { path: '/users', icon: '👥', label: 'Üyeler' },
    { path: '/categories', icon: '📂', label: 'Kategoriler' },
    { path: '/brands', icon: '🏷️', label: 'Markalar' },
    { path: '/products', icon: '🛍️', label: 'Ürünler' },
    { path: '/blogs', icon: '📝', label: 'Bloglar' },
    { path: '/banners', icon: '🎯', label: 'Bannerlar' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        Otocap Dashboard
      </div>
      <nav>
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path} 
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
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
  );
};

export default Sidebar;