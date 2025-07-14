import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LoginPage from "./LoginPage";
import Button from "../components/common/Button";
import { supabase } from "@/utils/supabaseClient";

// Ilustração hero como imagem PNG
const HeroIllustration = ({ altText }: { altText: string }) => (
  <div className="w-full flex items-center justify-center animate-fade-in-up">
    <img
      src="/hero-time-management.png"
      alt={altText}
      className="max-w-xs md:max-w-md w-full h-auto drop-shadow-2xl rounded-xl transition-transform duration-700 ease-in-out hover:scale-105 bg-transparent"
      style={{
        background: "transparent",
        animation: "fadeInUp 1.2s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    />
    {/*
      Certifique-se de colocar a imagem hero-time-management.png na pasta public/
      Ou ajuste o caminho conforme necessário.
    */}
    <style>{`
      @keyframes fadeInUp {
        0% { opacity: 0; transform: translateY(40px); }
        100% { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up { animation: fadeInUp 1.2s cubic-bezier(0.23, 1, 0.32, 1); }
    `}</style>
  </div>
);

// Removed hardcoded arrays - now using translations

interface LanguageLandingPageProps {
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
}

const LanguageLandingPage: React.FC<LanguageLandingPageProps> = ({
  showLogin,
  setShowLogin,
}) => {
  const { t } = useTranslation();
  const [loginMode, setLoginMode] = useState<"user" | "admin">("user");

  const openLogin = (mode: "user" | "admin") => {
    console.log("🔓 Abrindo modal de login:", mode);
    setLoginMode(mode);
    setShowLogin(true);
  };

  const menuLinks = [
    { label: t("landingPage.menu.home"), href: "#" },
    { label: t("landingPage.menu.features"), href: "#funcionalidades" },
    { label: t("landingPage.menu.team"), href: "#equipe" },
    { label: t("landingPage.menu.contact"), href: "#contato" },
  ];

  const beneficios = [
    t("landingPage.benefits.vacationControl"),
    t("landingPage.benefits.automaticReports"),
    t("landingPage.benefits.multiLanguage"),
    t("landingPage.benefits.intuitiveInterface"),
    t("landingPage.benefits.errorReduction"),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-100 to-indigo-100">
      {/* Header fixo */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-white/90 shadow-md fixed top-0 left-0 z-20">
        <span className="text-2xl md:text-3xl font-extrabold text-indigo-700 tracking-tight drop-shadow">
          HeureC
        </span>
        <nav className="hidden md:flex gap-8 items-center">
          {menuLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-slate-700 hover:text-indigo-600 font-medium transition-colors text-base"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            size="md"
            onClick={() => openLogin("user")}
            className="font-bold shadow"
          >
            {t("landingPage.userLogin")}
          </Button>
          <Button
            variant="warning"
            size="md"
            onClick={() => openLogin("admin")}
            className="font-bold shadow"
          >
            {t("landingPage.adminLogin")}
          </Button>
        </div>
      </header>
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-36 pb-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl mx-auto">
          {/* Texto */}
          <div className="flex-1 flex flex-col items-start md:items-start space-y-6 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 leading-tight">
              {t("landingPage.heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium">
              {t("landingPage.heroSubtitle")}
            </p>
            <div className="flex gap-4 mt-2">
              <Button
                variant="warning"
                size="lg"
                onClick={() => openLogin("user")}
                className="font-bold shadow"
              >
                {t("landingPage.getStarted")}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => openLogin("admin")}
                className="font-bold shadow"
              >
                {t("landingPage.adminArea")}
              </Button>
            </div>
            <ul className="mt-4 space-y-2 text-slate-700 text-base md:text-lg">
              {beneficios.map((b, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-green-500 text-xl">✔</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Ilustração */}
          <div className="flex-1 flex items-center justify-center">
            <HeroIllustration altText={t("landingPage.heroImageAlt")} />
          </div>
        </div>
      </main>
      {/* Modal de Login */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            console.log("🎯 Modal overlay clicado");
            if (e.target === e.currentTarget) {
              setShowLogin(false);
            }
          }}
        >
          <div className="modal-content">
            <button
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow hover:bg-slate-100 text-slate-500"
              onClick={() => setShowLogin(false)}
              aria-label={t("landingPage.close")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <LoginPage
              supabaseClient={supabase}
              isModal={true}
              isAdmin={loginMode === "admin"}
            />
          </div>
        </div>
      )}
      {/* Rodapé */}
      <footer className="w-full py-6 text-slate-400 text-xs text-center bg-white/70 mt-auto">
        {t("landingPage.copyright", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
};

export default LanguageLandingPage;
