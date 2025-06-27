import React from 'react';
import { useTranslation } from '../contexts/SimpleI18nContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'pt', name: 'Português' },
];

const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useTranslation();

  const changeLanguage = (lng: string) => {
    setLang(lng);
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={lang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="px-2 py-1 text-xs sm:text-sm bg-orange-400 text-white rounded-md hover:bg-orange-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors appearance-none cursor-pointer"
        aria-label="Select language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-white text-slate-700">
            {lang.name}
          </option>
        ))}
      </select>
       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.043-.48 1.576 0L10 10.405l2.908-2.857c.533-.48 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.72 3.707c-.436.446-1.043.48-1.576 0L5.516 9.163c-.408-.418-.436-1.17 0-1.615z"/></svg>
      </div>
    </div>
  );
};

export default LanguageSwitcher;