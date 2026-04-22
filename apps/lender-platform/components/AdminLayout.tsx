'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../styles/layout.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  platformName: string;
}

export default function AdminLayout({ children, platformName }: AdminLayoutProps) {
  const pathname = usePathname();
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
      icon: 'fa-regular fa-square-plus',
    },
    {
      label: 'Applications',
      icon: 'fa-regular fa-folder-open',
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
      icon: 'fa-regular fa-handshake',
    },
    {
      label: 'Manage Users',
      href: '/manage-users',
      icon: 'fa-regular fa-address-book',
    },
  ];

  const lenderMenuItems = [
    {
      label: 'Merchant Apps',
      href: '/merchant-apps',
      icon: 'fa-regular fa-building',
    },
    {
      label: 'Applications',
      icon: 'fa-regular fa-file-lines',
      submenu: [
        { label: 'All Apps', href: '/applications' },
        { label: 'Pending Approvals', href: '/applications/pending' },
      ],
    },
    {
      label: 'Customers',
      href: '/customers',
      icon: 'fa-regular fa-user',
    },
    {
      label: 'Manage Users',
      href: '/manage-users',
      icon: 'fa-regular fa-sun',
    },
  ];

  const menuItems = platformName === 'Merchant' ? merchantMenuItems : lenderMenuItems;

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-box">L</div>
          <div className="logo-text">LOS {platformName}</div>
        </div>

        <nav className="menu-section">
          <div className="section-label">Main Navigation</div>
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.submenu ? (
                <>
                  <button
                    className={`nav-item ${item.submenu?.some(sub => pathname === sub.href) ? 'active' : ''}`}
                    onClick={() => toggleMenu(`menu-${index}`)}
                  >
                    <i className={item.icon}></i>
                    <span className="nav-label">{item.label}</span>
                    <span className="chevron">
                      <i className={`fas fa-chevron-${expandedMenus[`menu-${index}`] ? 'down' : 'right'}`}></i>
                    </span>
                  </button>
                  {expandedMenus[`menu-${index}`] && (
                    <div className="submenu">
                      {item.submenu.map((subitem, subindex) => (
                        <Link key={subindex} href={subitem.href} className={`nav-item submenu-item ${pathname === subitem.href ? 'active' : ''}`}>
                          <i className="fa-regular fa-circle"></i>
                          <span className="nav-label">{subitem.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                  <i className={item.icon}></i>
                  <span className="nav-label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="sign-out">
          <Link href="/logout">
            <i className="fa-regular fa-circle-right"></i>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Page Content */}
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
