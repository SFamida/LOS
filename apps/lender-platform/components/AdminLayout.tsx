'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import '../styles/layout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  platformName: string;
}

export default function AdminLayout({ children, platformName }: AdminLayoutProps) {
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    applications: false,
  });

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const merchantMenuItems = [
    {
      label: 'Create Application',
      href: '/create-application',
      icon: 'fas fa-plus-circle',
    },
    {
      label: 'Applications',
      icon: 'fas fa-file-alt',
      submenu: [
        { label: 'All Apps', href: '/applications' },
        { label: 'Active Apps', href: '/applications/active' },
        { label: 'Ready To Fund', href: '/applications/ready-to-fund' },
        { label: 'Expiring Soon', href: '/applications/expiring-soon' },
      ],
    },
    {
      label: 'Offer Management',
      href: '/offer-management',
      icon: 'fas fa-handshake',
    },
    {
      label: 'Manage Users',
      href: '/manage-users',
      icon: 'fas fa-users',
    },
  ];

  const lenderMenuItems = [
    {
      label: 'Merchant Apps',
      href: '/merchant-apps',
      icon: 'fas fa-store',
    },
    {
      label: 'Applications',
      icon: 'fas fa-file-alt',
      submenu: [
        { label: 'All Apps', href: '/applications' },
        { label: 'Pending Approvals', href: '/applications/pending' },
      ],
    },
    {
      label: 'Customers',
      href: '/customers',
      icon: 'fas fa-users',
    },
    {
      label: 'Manage Users',
      href: '/manage-users',
      icon: 'fas fa-user-cog',
    },
  ];

  const menuItems = platformName === 'Merchant' ? merchantMenuItems : lenderMenuItems;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-box">LOS</div>
          <div className="logo-text">{platformName}</div>
        </div>

        <nav className="menu-section">
          <div className="section-label">Menu</div>
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <>
                  <button
                    className="nav-item"
                    onClick={() => toggleMenu(`menu-${index}`)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      padding: '12px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }}
                  >
                    <i className={item.icon} style={{ width: '24px', marginRight: '12px' }}></i>
                    {item.label}
                    <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
                      <i
                        className={`fas fa-chevron-${expandedMenus[`menu-${index}`] ? 'down' : 'right'}`}
                      ></i>
                    </span>
                  </button>
                  {expandedMenus[`menu-${index}`] && (
                    <div style={{ paddingLeft: '24px' }}>
                      {item.submenu.map((subitem, subindex) => (
                        <Link key={subindex} href={subitem.href}>
                          <span
                            className="nav-item"
                            style={{
                              fontSize: '13px',
                              color: '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px',
                              cursor: 'pointer',
                              borderRadius: '8px',
                              transition: 'all 0.2s',
                              marginBottom: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                              e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#94a3b8';
                            }}
                          >
                            <i className="fas fa-arrow-right" style={{ marginRight: '8px', width: '12px' }}></i>
                            {subitem.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href}>
                  <span
                    className="nav-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      fontSize: '14px',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      marginBottom: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }}
                  >
                    <i className={item.icon} style={{ width: '24px', marginRight: '12px' }}></i>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="sign-out">
          <a href="/logout">
            <i className="fas fa-sign-out-alt"></i>
            Sign Out
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <header>
          <div className="header-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </button>
            <button className="tickets-btn">Support Tickets</button>
            <div className="user-profile">
              <div className="avatar"></div>
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
