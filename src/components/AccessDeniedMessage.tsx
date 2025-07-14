import React from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const AccessDeniedMessage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-red-600 mb-2">
        {t("common.accessDenied")}
      </h2>
      <p className="text-slate-600">{t("common.noPermission")}</p>
    </div>
  );
};

export default AccessDeniedMessage;
