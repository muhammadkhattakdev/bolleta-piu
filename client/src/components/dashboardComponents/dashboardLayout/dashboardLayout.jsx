import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import './style.css';
import { useAuth } from '../../../context/context';
import Navbar from '../navbar/navbar';
import Sidebar from '../sidebar/sidebar';

const DashboardLayout = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Navbar 
          user={user} 
          toggleSidebar={toggleSidebar} 
          sidebarCollapsed={sidebarCollapsed} 
        />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;