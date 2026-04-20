import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

interface SidebarProps {
  brand: string;
  items: SidebarItem[];
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ brand, items, onSignOut }) => {
  const router = useRouter();
  const currentPath = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoBox}>
          {brand.split(' ').map((word) => word.charAt(0)).join('')}
        </div>
        <span className={styles.logoText}>{brand}</span>
      </div>

      <div className={styles.menuSection}>
        <div className={styles.sectionLabel}>Main Menu</div>

        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`${styles.navItem} ${currentPath === item.href ? styles.active : ''}`}
          >
            <i className={`fa-solid ${item.icon}`}></i>
            <span>{item.label}</span>
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
            <i className={`fa-solid fa-chevron-right ${styles.chevron}`}></i>
          </Link>
        ))}
      </div>

      <div className={styles.signOut}>
        <button onClick={onSignOut || (() => router.push('/login'))}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
