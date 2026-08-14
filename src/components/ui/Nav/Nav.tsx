import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export interface NavProps {
  items: NavItem[];
  "aria-label": string;
  /** 靠右對齊的附加內容（例如工具按鈕），與導覽連結分開、不參與路由 active 判斷。 */
  trailing?: ReactNode;
}

export function Nav({ items, "aria-label": ariaLabel, trailing }: NavProps) {
  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            [styles.link, isActive && styles.linkActive].filter(Boolean).join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
      {trailing && <div className={styles.trailing}>{trailing}</div>}
    </nav>
  );
}
