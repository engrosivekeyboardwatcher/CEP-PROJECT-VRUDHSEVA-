import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-switch" role="group" aria-label="Language switcher">
      {['en', 'hi', 'mr'].map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={language === option}
          onClick={() => setLanguage(option)}
          className={language === option ? 'active' : ''}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
