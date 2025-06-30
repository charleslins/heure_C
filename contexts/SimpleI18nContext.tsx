import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations } from "../i18nSimple";

type Lang = keyof typeof translations;

interface SimpleI18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const SimpleI18nContext = createContext<SimpleI18nContextType | undefined>(undefined);

export const SimpleI18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("pt");

  function t(key: string): string {
    const parts = key.split(".");
    let value: unknown = translations[lang];
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return `[${key}]`;
    }
    return value as string;
  }

  return (
    <SimpleI18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </SimpleI18nContext.Provider>
  );
};

export function useTranslation() {
  const ctx = useContext(SimpleI18nContext);
  if (!ctx) throw new Error("useTranslation must be used within SimpleI18nProvider");
  return { t: ctx.t, lang: ctx.lang, setLang: ctx.setLang };
} 