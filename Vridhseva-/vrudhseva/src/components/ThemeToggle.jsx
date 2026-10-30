export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="icon-btn"
      aria-pressed={theme === 'dark'}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={onToggle}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}
