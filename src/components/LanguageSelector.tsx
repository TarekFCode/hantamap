import { useState } from "react";
import {
  getLanguageLabel,
  LANGUAGE_OPTIONS,
  saveLanguage,
  SupportedLanguage,
} from "../i18n";

type LanguageSelectorProps = {
  language: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
};

export default function LanguageSelector({
  language,
  onChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectLanguage = (nextLanguage: SupportedLanguage) => {
    saveLanguage(nextLanguage);
    onChange(nextLanguage);
    setIsOpen(false);
  };

  return (
    <div className="language-selector" dir={language === "ar" ? "rtl" : "ltr"}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="language-selector-button"
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        {getLanguageLabel(language)}
      </button>

      {isOpen ? (
        <div className="language-menu" role="listbox" aria-label="Select language">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              aria-selected={option.code === language}
              className={option.code === language ? "is-selected" : undefined}
              key={option.code}
              role="option"
              type="button"
              onClick={() => selectLanguage(option.code)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
