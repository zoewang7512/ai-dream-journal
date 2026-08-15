import styles from "./Footer.module.css";

const GITHUB_REPO_URL = "https://github.com/zoewang7512/ai-dream-journal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        © {year} AI 夢境日記 ·{" "}
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
