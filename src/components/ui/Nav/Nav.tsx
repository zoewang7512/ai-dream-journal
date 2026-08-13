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
}

export function Nav({ items, "aria-label": ariaLabel }: NavProps) {
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
    </nav>
  );
}
