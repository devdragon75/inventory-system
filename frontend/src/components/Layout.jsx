import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: '📊 Dashboard' },
    { path: '/products', label: '📦 Products' },
    { path: '/customers', label: '👥 Customers' },
    { path: '/orders', label: '🛒 Orders' },
  ];

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-header">
          Inventory OS
        </div>
        <div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
