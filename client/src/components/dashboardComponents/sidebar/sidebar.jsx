import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style.css';
import logoImg from '../../../static/images/sidebarLogo.png';

const DashboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 13H10C10.55 13 11 12.55 11 12V4C11 3.45 10.55 3 10 3H4C3.45 3 3 3.45 3 4V12C3 12.55 3.45 13 4 13ZM4 21H10C10.55 21 11 20.55 11 20V16C11 15.45 10.55 15 10 15H4C3.45 15 3 15.45 3 16V20C3 20.55 3.45 21 4 21ZM14 21H20C20.55 21 21 20.55 21 20V12C21 11.45 20.55 11 20 11H14C13.45 11 13 11.45 13 12V20C13 20.55 13.45 21 14 21ZM13 4V8C13 8.55 13.45 9 14 9H20C20.55 9 21 8.55 21 8V4C21 3.45 20.55 3 20 3H14C13.45 3 13 3.45 13 4Z" fill="currentColor"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 16H13V19H11V16H8V14H11V11H13V14H16V16ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
  </svg>
);

const CalculationsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13.03 7.06L14.09 6L15.5 7.41L16.91 6L17.97 7.06L16.56 8.47L17.97 9.88L16.91 10.94L15.5 9.54L14.09 10.94L13.03 9.88L14.44 8.47L13.03 7.06ZM6.25 7.72H11.25V9.22H6.25V7.72ZM14.5 16.69L17.25 13.94L14.5 11.19L15.56 10.13L19.38 13.94L15.56 17.75L14.5 16.69ZM6.25 10.72H11.25V12.22H6.25V10.72ZM6.25 13.72H11.25V15.22H6.25V13.72ZM6.25 16.72H11.25V18.22H6.25V16.72Z" fill="currentColor"/>
  </svg>
);

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5C16.87 5 20 8.13 20 12C20 15.87 16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 19.99 10.51 21 13 21C17.97 21 22 16.97 22 12C22 7.03 17.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="currentColor"/>
  </svg>
);

const Sidebar = ({ collapsed }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      title: 'Upload Document',
      icon: <UploadIcon />,
      path: '/upload',
    },
    {
      title: 'Calculations',
      icon: <CalculationsIcon />,
      path: '/calculations',
    },
    {
      title: 'Settings',
      icon: <SettingsIcon />,
      path: '/profile',
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img 
          src={logoImg} 
          alt="Bolletta Più Logo" 
          className="sidebar-logo"
        />
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="sidebar-menu-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-menu-title">{item.title}</span>}
            {collapsed && <span className="sidebar-tooltip">{item.title}</span>}
          </Link>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="help-section">
          <span className="help-icon"><HelpIcon /></span>
          {!collapsed && <span className="help-text">Need Help?</span>}
          {collapsed && <span className="sidebar-tooltip">Need Help?</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;