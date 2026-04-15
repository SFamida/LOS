import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  brand: string;
  menuItems: Array<{
    icon: string;
    label: string;
    href: string;
    badge?: number;
  }>;
  userName?: string;
  userInitials?: string;
  notificationCount?: number;
  onSignOut?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  brand,
  menuItems,
  userName = 'User',
  userInitials = 'U',
  notificationCount = 0,
  onSignOut,
}) => {
  const router = useRouter();

  const handleSignOut = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className={styles.pageLayout}>
      <Sidebar
        brand={brand}
        items={menuItems}
        onSignOut={handleSignOut}
      />

      <div className={styles.mainWrapper}>
        <header className={styles.header}>
          <div className={styles.headerActions}>
            <div className={styles.notificationBtn}>
              <i className="fa-solid fa-bell"></i>
              {notificationCount > 0 && (
                <span className={styles.badgeNotification}>{notificationCount}</span>
              )}
            </div>
            <button className={styles.ticketsBtn}>Tickets</button>
            <div className={styles.userProfile}>
              <div className={styles.avatar}>{userInitials}</div>
              <span className={styles.userName}>{userName}</span>
              <i
                className="fa-solid fa-chevron-down"
                style={{ fontSize: '10px', color: '#94a3b8' }}
              ></i>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
