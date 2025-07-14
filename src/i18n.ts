import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationPT from "../locales/pt/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    pt: {
      translation: translationPT,
    },
  },
  lng: "pt", // língua padrão
  fallbackLng: "pt",
  debug: false, // desabilitado para parar os logs de erro
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
