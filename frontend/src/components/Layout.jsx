import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiPieChart, FiBox, FiUsers, FiShoppingCart } from 'react-icons/fi';

const Layout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FiPieChart /> },
    { path: '/products', label: 'Products', icon: <FiBox /> },
    { path: '/customers', label: 'Customers', icon: <FiUsers /> },
    { path: '/orders', label: 'Orders', icon: <FiShoppingCart /> },
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
              <span style={{ marginRight: '10px', fontSize: '18px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
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
