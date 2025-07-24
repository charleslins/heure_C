import React from "react";
import { useTranslation } from "react-i18next";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const { t } = useTranslation();
  const displayMessage =
    message || t("common.loadingApp", "Initializing application...");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-indigo-600 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <h1 className="mt-3 text-xl font-semibold text-slate-700">
          {displayMessage}
        </h1>
      </div>
    </div>
  );
};

// Otimização com React.memo - LoadingScreen raramente precisa re-renderizar
export default React.memo(LoadingScreen, (prevProps, nextProps) => {
  return prevProps.message === nextProps.message;
});
